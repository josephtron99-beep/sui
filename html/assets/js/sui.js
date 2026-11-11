/* Suinance · live Sui mainnet data, program checks and the data-driven page parts. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cfg = window.SUINANCE_CONFIG || {};
  const RULES = cfg.rules;
  const GQL = cfg.graphqlUrl || "https://graphql.mainnet.sui.io/graphql";
  const MIST = 1e9;
  const CACHE_KEY = "suinance-snapshot-v2";
  const CACHE_MS = 5 * 60 * 1000;

  const fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const compact = (n) => Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  const short = (a, n = 6) => (a && a.length > n * 2 + 2 ? `${a.slice(0, n)}…${a.slice(-4)}` : a || "");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");

  const ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    arrow: '<svg class="arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };

  /* ── Data ── */
  const EPOCH_QUERY = `query Epoch($after: String) {
    epoch { epochId startTimestamp referenceGasPrice
      validatorSet { activeValidators(first: 50, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { atRisk contents { json } reportRecords(first: 50) { nodes { contents { json } } } }
      } } } }`;
  const PREV_QUERY = `query Prev($id: UInt53!) { epoch(epochId: $id) { totalStakeRewards totalTransactions } }`;

  async function gql(query, variables) {
    const res = await fetch(GQL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, variables: variables || {} }) });
    if (!res.ok) throw new Error("Sui GraphQL " + res.status);
    const j = await res.json();
    if (j.errors && j.errors.length) throw new Error(j.errors[0].message);
    return j.data;
  }

  function host(multiaddr) {
    const p = String(multiaddr || "").split("/");
    return p.length > 2 ? p[2] : "";
  }

  async function load() {
    const raw = [];
    let after = null, head = null;
    for (let page = 0; page < 8; page++) {
      const d = await gql(EPOCH_QUERY, { after });
      head = d.epoch;
      const conn = d.epoch.validatorSet.activeValidators;
      conn.nodes.forEach((n) => raw.push({ atRisk: n.atRisk, v: n.contents.json, reportedBy: ((n.reportRecords && n.reportRecords.nodes) || []).map((r) => r.contents.json.metadata.name) }));
      if (!conn.pageInfo.hasNextPage) break;
      after = conn.pageInfo.endCursor;
    }
    const prev = await gql(PREV_QUERY, { id: head.epochId - 1 });
    const totalStake = raw.reduce((s, r) => s + Number(r.v.staking_pool.sui_balance) / MIST, 0);
    const rewards = Number((prev.epoch && prev.epoch.totalStakeRewards) || 0) / MIST;
    const gross = totalStake > 0 ? (rewards / totalStake) * 365 * 100 : 0;
    const validators = raw
      .map(({ atRisk, v, reportedBy }) => {
        const c = Number(v.commission_rate) / 100;
        return {
          address: v.metadata.sui_address,
          name: v.metadata.name,
          description: v.metadata.description,
          imageUrl: v.metadata.image_url,
          projectUrl: v.metadata.project_url,
          commissionPct: c,
          nextCommissionPct: Number(v.next_epoch_commission_rate) / 100,
          stakeSui: Number(v.staking_pool.sui_balance) / MIST,
          nextStakeSui: Number(v.next_epoch_stake) / MIST,
          pendingStakeSui: Number(v.staking_pool.pending_stake) / MIST,
          pendingWithdrawSui: Number(v.staking_pool.pending_total_sui_withdraw) / MIST,
          votingPowerPct: Number(v.voting_power) / 100,
          gasPrice: Number(v.gas_price),
          apyPct: gross * (1 - c / 100),
          atRisk: Boolean(atRisk && atRisk > 0),
          partner: (cfg.partners || []).some((a) => a.toLowerCase() === v.metadata.sui_address.toLowerCase()),
          activationEpoch: Number(v.staking_pool.activation_epoch || 0),
          reportedBy,
          host: host(v.metadata.net_address),
        };
      })
      .sort((a, b) => b.stakeSui - a.stakeSui);
    return {
      epoch: Number(head.epochId),
      referenceGasPrice: Number(head.referenceGasPrice),
      totalStakeSui: totalStake,
      validatorCount: validators.length,
      validators,
      fetchedAt: Date.now(),
    };
  }

  let pending = null;
  function snapshot() {
    if (pending) return pending;
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (c && Date.now() - c.fetchedAt < CACHE_MS) return (pending = Promise.resolve(c));
    } catch (e) {}
    pending = load().then((s) => {
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(s)); } catch (e) {}
      return s;
    });
    pending.catch(() => (pending = null));
    return pending;
  }

  /* ── Program checks (same rules as the Next.js site) ── */
  function check(v) {
    const commission = Math.max(v.commissionPct, v.nextCommissionPct);
    const missing = [!v.name && "name", !v.description && "description", !v.imageUrl && "logo", !v.projectUrl && "website"].filter(Boolean);
    return [
      { key: "active", label: "In Sui's active validator set", status: v.atRisk ? "fail" : "pass",
        detail: v.atRisk ? "Active, but stake is below Sui's minimum and the validator is at risk of removal." : "Active on mainnet with stake above Sui's minimum." },
      { key: "commission", label: `Commission at or below ${RULES.maxCommissionPct}%`, status: commission <= RULES.maxCommissionPct ? "pass" : "fail",
        detail: v.nextCommissionPct !== v.commissionPct ? `${fmt(v.commissionPct, 2)}% now, ${fmt(v.nextCommissionPct, 2)}% from next epoch.` : `${fmt(v.commissionPct, 2)}% this epoch and next.` },
      { key: "reports", label: "No peer reports", status: v.reportedBy.length === 0 ? "pass" : "fail",
        detail: v.reportedBy.length === 0 ? `No tallying-rule reports this epoch. The full ${RULES.cleanEpochs}-epoch record is checked at review.` : `Reported this epoch by ${v.reportedBy.join(", ")}.` },
      { key: "voting", label: `Voting power under ${RULES.maxVotingPowerPct}%`, status: v.votingPowerPct < RULES.maxVotingPowerPct ? "pass" : "fail",
        detail: `${fmt(v.votingPowerPct, 2)}% of network voting power.` },
      { key: "identity", label: "Public identity on-chain", status: missing.length === 0 ? "pass" : "fail",
        detail: missing.length === 0 ? "Name, description, logo and website are all set." : `Missing on-chain: ${missing.join(", ")}.` },
      { key: "software", label: "Current Sui release", status: "manual",
        detail: `Node versions are not published on-chain. We confirm the ${RULES.upgradeHours}-hour upgrade window with the operator.` },
    ];
  }
  const failed = (r) => r.filter((x) => x.status === "fail").length;
  const passed = (r) => r.filter((x) => x.status === "pass").length;
  function nakamoto(vs) {
    const s = vs.slice().sort((a, b) => b.votingPowerPct - a.votingPowerPct);
    let sum = 0;
    for (let i = 0; i < s.length; i++) { sum += s[i].votingPowerPct; if (sum > 100 / 3) return i + 1; }
    return s.length;
  }

  function checksHtml(results) {
    const map = { pass: [ICON.check, "Pass"], fail: [ICON.x, "Not met"], manual: [ICON.minus, "Checked at review"] };
    return '<ul class="checks">' + results.map((r) =>
      `<li class="${r.status}"><span class="ic">${map[r.status][0]}</span><span><span class="t">${esc(r.label)}<span class="sr-only">: ${map[r.status][1]}</span></span><br><span class="d">${esc(r.detail)}</span></span></li>`).join("") + "</ul>";
  }
  function avatar(v, size) {
    const s = size || 36;
    const fb = `<span class="avatar fallback" style="width:${s}px;height:${s}px">${esc((v.name || "?").slice(0, 2).toUpperCase())}</span>`;
    if (!safeUrl(v.imageUrl)) return fb;
    return `<img class="avatar" src="${esc(v.imageUrl)}" alt="" width="${s}" height="${s}" loading="lazy" style="width:${s}px;height:${s}px" data-fb="${esc((v.name || "?").slice(0, 2).toUpperCase())}">`;
  }
  // Broken validator logos fall back to initials.
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.fb) return;
    const span = document.createElement("span");
    span.className = "avatar fallback";
    span.style.cssText = img.style.cssText;
    span.textContent = img.dataset.fb;
    img.replaceWith(span);
  }, true);
  function unavailable(el) {
    el.innerHTML = '<p class="muted" style="padding:24px;border:1.5px dashed color-mix(in srgb,var(--ink) 40%,transparent);border-radius:14px;text-align:center">Live Sui network data is temporarily unavailable. Please refresh in a minute.</p>';
  }

  /* ── Live stats strip ── */
  function renderStats(s) {
    $$("[data-stat]").forEach((el) => {
      const k = el.dataset.stat;
      const C = window.SuinanceCount;
      if (k === "count") C(el, s.validatorCount);
      if (k === "stake") C(el, s.totalStakeSui / 1e9, { decimals: 2, suffix: "B" });
      if (k === "gas") C(el, s.referenceGasPrice);
      if (k === "epoch") C(el, s.epoch);
      if (k === "count-plain") el.textContent = s.validatorCount;
      if (k === "epoch-plain") el.textContent = fmt(s.epoch);
    });
    $$("[data-live-text]").forEach((el) => {
      if (el.dataset.liveText === "network")
        el.textContent = `${s.validatorCount} validators secure Sui right now, holding ${fmt(s.totalStakeSui / 1e9, 2)} billion staked SUI between them. The program favours strong mid-sized operators, so stake and voting power spread more evenly across the set.`;
      if (el.dataset.liveText === "eligible") {
        const n = s.validators.filter((v) => failed(check(v)) === 0).length;
        el.textContent = `Search any active Sui validator to run the program checks against live mainnet data. Right now ${n} of ${s.validatorCount} active validators meet every automatic check.`;
      }
    });
  }

  /* ── Eligibility checker (program page) ── */
  function renderChecker(s) {
    const box = $("[data-checker]");
    if (!box) return;
    const input = $("input", box), list = $("[data-results]", box), out = $("[data-output]", box), none = $("[data-none]", box);
    const entries = s.validators.map((v) => { const r = check(v); return { v, r, f: failed(r) }; });
    input.placeholder = `Try "${entries[0] ? entries[0].v.name : "Mysten"}" or 0x…`;
    input.disabled = false;
    function badge(f) { return f === 0 ? '<span class="badge success">Eligible</span>' : `<span class="badge danger">${f} not met</span>`; }
    function pick(e) {
      input.value = e.v.name;
      list.innerHTML = "";
      input.setAttribute("aria-expanded", "false");
      out.innerHTML = `<div class="stack" style="--gap:16px" aria-live="polite">
        <div class="row" style="justify-content:space-between"><strong style="font-size:18px">${esc(e.v.name)}</strong>${e.f === 0 ? '<span class="badge success">Meets the automatic checks</span>' : `<span class="badge danger">${e.f} check${e.f > 1 ? "s" : ""} not met</span>`}</div>
        ${checksHtml(e.r)}
        <a class="text-link" href="validator.html?address=${e.v.address}">Open the full scorecard ${ICON.arrow}</a></div>`;
    }
    input.addEventListener("input", () => {
      out.innerHTML = "";
      const q = input.value.trim().toLowerCase();
      const m = q.length < 2 ? [] : entries.filter((e) => e.v.name.toLowerCase().includes(q) || e.v.address.toLowerCase().includes(q)).slice(0, 6);
      none.hidden = !(/^0x[0-9a-f]{64}$/.test(q) && m.length === 0);
      input.setAttribute("aria-expanded", String(m.length > 0));
      list.innerHTML = m.map((e, i) => `<li role="option" aria-selected="false"><button type="button" data-i="${i}"><span><span style="font-weight:500">${esc(e.v.name)}</span><br><span class="mono muted" style="font-size:12px">${short(e.v.address)}</span></span>${badge(e.f)}</button></li>`).join("");
      $$("button", list).forEach((b) => b.addEventListener("click", () => pick(m[Number(b.dataset.i)])));
    });
  }

  /* ── Validators page: decentralisation + table + drawer ── */
  function renderDecentral(s) {
    const box = $("[data-decentral]");
    if (!box) return;
    const vs = s.validators;
    const byPower = vs.slice().sort((a, b) => b.votingPowerPct - a.votingPowerPct);
    const com = vs.map((v) => v.commissionPct).sort((a, b) => a - b);
    const items = [
      [String(nakamoto(vs)), "Nakamoto coefficient", "Fewest validators that together hold over one third of voting power"],
      [fmt(byPower.slice(0, 10).reduce((a, v) => a + v.votingPowerPct, 0), 1) + "%", "Top 10 voting power", "Share held by the ten largest validators"],
      [fmt(com[Math.floor(com.length / 2)] || 0, 2) + "%", "Median commission", "Half of all validators charge this or less"],
      [String(vs.filter((v) => failed(check(v)) === 0).length), "Meet program checks", "Active validators passing every automatic check"],
      [String(vs.filter((v) => v.reportedBy.length > 0).length), "Reported this epoch", "Validators flagged by peers under the tallying rule"],
      [String(vs.filter((v) => v.atRisk).length), "At risk", "Below Sui's minimum stake and facing removal"],
    ];
    box.innerHTML = items.map(([v, l, n], i) => `<div class="dark-card" data-reveal style="--d:${i * 0.04}s"><span class="big-num text-yellow">${esc(v)}</span><span style="font-weight:500">${esc(l)}</span><span class="note">${esc(n)}</span></div>`).join("");
    window.SuinanceReveal(box);
  }

  function renderTable(s) {
    const wrap = $("[data-validator-table]");
    if (!wrap) return;
    const tbody = $("tbody", wrap), search = $("[data-search]"), count = $("[data-count-label]");
    const drawer = $("#drawer"), back = $("#drawer-backdrop");
    let sortKey = "stakeSui", dir = -1, lastRow = null;
    function rows() {
      const q = (search.value || "").trim().toLowerCase();
      return s.validators
        .filter((v) => !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q))
        .sort((a, b) => (sortKey === "name" ? a.name.localeCompare(b.name) * -dir : (a[sortKey] - b[sortKey]) * dir));
    }
    function draw() {
      const r = rows();
      count.textContent = `${r.length} of ${s.validators.length} validators`;
      tbody.innerHTML = r.length ? r.map((v) => `<tr>
        <td><button type="button" class="v-name" data-open="${v.address}">${avatar(v)}<span><span class="t">${esc(v.name)}</span> ${v.partner ? '<span class="badge yellow">Program</span>' : ""}${v.atRisk ? ' <span class="badge danger">At risk</span>' : ""}<small>${short(v.address)}</small></span></button></td>
        <td class="num">${compact(v.stakeSui)}</td><td class="num">${fmt(v.votingPowerPct, 2)}%</td><td class="num">${fmt(v.commissionPct, 2)}%</td><td class="num">${fmt(v.apyPct, 2)}%</td>
        <td style="text-align:right"><button type="button" class="btn btn-outline btn-sm" data-open="${v.address}">Details</button></td></tr>`).join("")
        : '<tr><td colspan="6" class="muted" style="text-align:center;padding:48px">No validators match your search.</td></tr>';
      $$("[data-open]", tbody).forEach((b) => b.addEventListener("click", () => { lastRow = b; open(s.validators.find((v) => v.address === b.dataset.open)); }));
    }
    function open(v) {
      const r = check(v);
      drawer.innerHTML = `<div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:nowrap">
          <div class="row" style="flex-wrap:nowrap">${avatar(v, 52)}<div><h3 style="font-size:20px">${esc(v.name)}</h3><span class="mono muted" style="font-size:12px">${short(v.address, 10)}</span></div></div>
          <button type="button" class="icon-btn" data-close aria-label="Close">${ICON.x}</button></div>
        ${v.description ? `<p class="muted" style="font-size:15px">${esc(v.description)}</p>` : ""}
        <dl class="kv">${[["Total stake", fmt(v.stakeSui) + " SUI"], ["Voting power", fmt(v.votingPowerPct, 2) + "%"], ["Commission", fmt(v.commissionPct, 2) + "%"], ["Est. rate", fmt(v.apyPct, 2) + "%"], ["Gas price quote", v.gasPrice + " MIST"], ["Active since epoch", String(v.activationEpoch)]].map(([k, x]) => `<div><dt>${k}</dt><dd>${esc(x)}</dd></div>`).join("")}</dl>
        <div class="row">${failed(r) === 0 ? '<span class="badge success">Meets the program checks</span>' : `<span class="badge danger">${failed(r)} program check${failed(r) > 1 ? "s" : ""} not met</span>`}</div>
        <div class="stack" style="--gap:8px">
          <a class="btn btn-primary btn-lg btn-block" href="validator.html?address=${v.address}">Full scorecard &amp; program checks</a>
          <a class="btn btn-outline btn-lg btn-block" href="https://suiscan.xyz/mainnet/validator/${v.address}" target="_blank" rel="noopener noreferrer">View on Suiscan ${ICON.ext}</a>
          ${safeUrl(v.projectUrl) ? `<a class="btn btn-ghost btn-block" href="${esc(v.projectUrl)}" target="_blank" rel="noopener noreferrer">Validator website ${ICON.ext}</a>` : ""}
        </div>
        <p class="muted" style="font-size:12.5px">Rate is estimated from last epoch's network rewards, after this validator's commission. It changes every epoch.</p>`;
      drawer.classList.add("is-open"); back.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      $("[data-close]", drawer).addEventListener("click", close);
      setTimeout(() => $("[data-close]", drawer).focus(), 50);
    }
    function close() {
      drawer.classList.remove("is-open"); back.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      if (lastRow) lastRow.focus();
    }
    back.addEventListener("click", close);
    addEventListener("keydown", (e) => e.key === "Escape" && drawer.classList.contains("is-open") && close());
    search.addEventListener("input", draw);
    $$("[data-sort]", wrap).forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.sort;
      dir = sortKey === k ? -dir : k === "name" ? 1 : -1;
      sortKey = k;
      $$("[data-sort]", wrap).forEach((x) => x.setAttribute("aria-sort", x === b ? (dir === -1 ? "descending" : "ascending") : "none"));
      draw();
    }));
    draw();
  }

  /* ── Validator scorecard page ── */
  function renderScorecard(s) {
    const page = $("[data-scorecard]");
    if (!page) return;
    const addr = (new URLSearchParams(location.search).get("address") || "").toLowerCase();
    const v = s.validators.find((x) => x.address.toLowerCase() === addr);
    if (!v) {
      $("[data-sc-title]").textContent = "Validator not found";
      $("[data-sc-desc]").textContent = "This address is not in Sui's active validator set this epoch. Check the address, or browse the full validator set.";
      $("[data-sc-body]").innerHTML = '<div class="row"><a class="btn btn-primary btn-lg" href="validators.html">See all validators</a></div>';
      const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex"; document.head.appendChild(m);
      return;
    }
    const r = check(v), f = failed(r);
    const rank = s.validators.indexOf(v) + 1;
    const diff = v.nextStakeSui - v.stakeSui;
    document.title = `${v.name}: Sui Validator Scorecard · Suinance`;
    const md = $('meta[name="description"]');
    if (md) md.content = `Live scorecard for ${v.name} on Sui mainnet: stake, voting power, commission, gas price, peer reports and Suinance Validator Program checks.`;
    $("[data-sc-title]").textContent = v.name;
    $("[data-sc-desc]").textContent = v.description || "No description set on-chain.";
    $("[data-sc-badges]").innerHTML = (f === 0 ? '<span class="badge success">Meets the automatic checks</span>' : `<span class="badge danger">${f} check${f > 1 ? "s" : ""} not met</span>`) +
      (v.partner ? ' <span class="badge yellow">Program member</span>' : "") + ` <span class="mono muted" style="font-size:12px">${short(v.address, 10)}</span>`;
    const stats = [
      ["Total stake", fmt(v.stakeSui) + " SUI", `#${rank} of ${s.validatorCount} by stake`],
      ["Voting power", fmt(v.votingPowerPct, 2) + "%", "Share of consensus votes"],
      ["Commission", fmt(v.commissionPct, 2) + "%", v.nextCommissionPct !== v.commissionPct ? `${fmt(v.nextCommissionPct, 2)}% from next epoch` : "Same next epoch"],
      ["Gas price quote", fmt(v.gasPrice) + " MIST", `Reference price: ${fmt(s.referenceGasPrice)} MIST`],
      ["Stake next epoch", fmt(v.nextStakeSui) + " SUI", diff === 0 ? "No change scheduled" : `${diff > 0 ? "+" : "−"}${fmt(Math.abs(diff))} SUI`],
      ["Pending in / out", `${fmt(v.pendingStakeSui)} / ${fmt(v.pendingWithdrawSui)}`, "SUI joining / leaving the pool"],
      ["Est. delegator rate", fmt(v.apyPct, 2) + "%", "From last epoch's rewards, after commission"],
      ["Active since", "Epoch " + v.activationEpoch, v.host ? "Node: " + v.host : ""],
    ];
    $("[data-sc-body]").innerHTML = `
      <div class="grid cols-2-sm" style="--gap:12px" id="sc-stats">${stats.map(([k, x, n]) => `<div class="card sm" style="gap:4px"><span class="muted" style="font-size:13px">${k}</span><span class="tabular" style="font-family:var(--font-display);font-weight:800;font-size:clamp(18px,2.2vw,26px);line-height:1.2;overflow-wrap:anywhere">${esc(x)}</span>${n ? `<span class="muted" style="font-size:12.5px;overflow-wrap:anywhere">${esc(n)}</span>` : ""}</div>`).join("")}</div>
      <div class="split">
        <div class="heading"><span class="eyebrow">Program checks</span><h2>${passed(r)} of ${r.length} checks passed</h2><p>Run live against this epoch's on-chain data. The full review also looks at the last ${RULES.cleanEpochs} epochs and confirms the node's software version with the operator.</p></div>
        ${checksHtml(r)}
      </div>
      <div class="row">
        <a class="btn btn-outline" href="https://suiscan.xyz/mainnet/validator/${v.address}" target="_blank" rel="noopener noreferrer">View on Suiscan ${ICON.ext}</a>
        ${safeUrl(v.projectUrl) ? `<a class="btn btn-outline" href="${esc(v.projectUrl)}" target="_blank" rel="noopener noreferrer">Validator website ${ICON.ext}</a>` : ""}
        <a class="btn btn-ghost" href="validators.html">← All validators</a>
      </div>`;
    $("[data-sc-cta]").textContent = `Do you run ${v.name}?`;
    $("[data-sc-cta-wrap]").hidden = false;
    const style = document.createElement("style");
    style.textContent = "@media (min-width:1024px){#sc-stats{grid-template-columns:repeat(4,1fr)}}";
    document.head.appendChild(style);
  }

  /* ── Program visual (hero) ── */
  function renderVisual(s) {
    $$("[data-pv-count]").forEach((e) => (e.textContent = s.validatorCount));
    $$("[data-pv-epoch]").forEach((e) => (e.textContent = fmt(s.epoch)));
  }

  const needs = $("[data-stat], [data-live-text], [data-checker], [data-decentral], [data-validator-table], [data-scorecard], [data-pv-count]");
  if (needs) {
    snapshot()
      .then((s) => { renderStats(s); renderVisual(s); renderChecker(s); renderDecentral(s); renderTable(s); renderScorecard(s); })
      .catch((e) => {
        console.error("[sui]", e);
        $$("[data-live-fail]").forEach(unavailable);
        const sc = $("[data-sc-body]");
        if (sc) unavailable(sc);
        $$("[data-stat]").forEach((el) => (el.textContent = "–"));
      });
  }
  window.SuinanceSui = { snapshot, check };
})();
