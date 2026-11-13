/* Suinance dashboard · shell, components and page renderers.
   Depends on ../assets/js/app.js (theme, reveal, password toggles) and data.js. */
(function () {
  "use strict";
  const T0 = performance.now();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const C = window.SUINANCE_DASH;
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n, d = 2) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const usd = (n, d = 2) => "$" + num(n, d);
  const date = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const DAY = 864e5;
  let PRICE = C.suiPriceFallbackUsd;
  const sui = (u, d = 2) => num(u / PRICE, d) + " SUI";
  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
  const incomeName = (k) => (C.incomes.find((i) => i.key === k) || { name: k }).name;

  /* ───────── Icons ───────── */
  const svg = (p, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const G = {
    direct: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    roi: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    passive: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    global: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    royalty: '<path d="M11.56 3.27a.5.5 0 0 1 .88 0l2.95 5.6a1 1 0 0 0 1.52.29l4.27-3.66a.5.5 0 0 1 .82.5l-2.83 10.24a1 1 0 0 1-.96.73H5.8a1 1 0 0 1-.96-.73L2.01 5.99a.5.5 0 0 1 .82-.5l4.27 3.66a1 1 0 0 0 1.52-.29zM5 21h14"/>',
    onetime: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    performance: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    total: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    check: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    left: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    right: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    down: '<path d="M12 3v14M5 10l7 7 7-7M5 21h14"/>',
    up: '<path d="M12 21V7M5 14l7-7 7 7M5 3h14"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    tree: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-3h14v3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    ok: '<path d="M20 6 9 17l-5-5"/>',
  };
  const HEX = (fill, stroke = "#111") => `<svg class="hx" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 90 27v46L50 96 10 73V27z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/></svg>`;
  const EMPTY = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 88 28v44L50 94 12 72V28z" fill="var(--tint)" stroke="var(--ink)" stroke-width="3" stroke-dasharray="6 6"/><path d="M38 52h24M50 40v24" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/></svg>`;

  /* ───────── Toast + copy ───────── */
  const toastEl = document.createElement("div");
  toastEl.className = "d-toast";
  toastEl.setAttribute("role", "status");
  document.body.appendChild(toastEl);
  let toastT;
  function toast(msg) { toastEl.innerHTML = svg(G.ok) .replace("<svg ", '<svg style="width:16px;height:16px" ') + esc(msg); toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2400); }
  async function copy(text, label, btn) {
    try {
      await navigator.clipboard.writeText(text);
      toast(label || "Copied");
      if (btn) { const html = btn.innerHTML; btn.classList.add("is-done"); btn.innerHTML = svg(G.ok) + "Copied"; setTimeout(() => { btn.classList.remove("is-done"); btn.innerHTML = html; }, 1600); }
    } catch (e) { toast("Copy failed. Select the text instead."); }
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-copy-text]"); if (b) copy(b.dataset.copyText, b.dataset.copyLabel, b); });

  /* ───────── Sidebar ───────── */
  const side = $(".d-side"), scrim = $(".d-scrim");
  function setSide(open) { side.classList.toggle("is-open", open); scrim.classList.toggle("is-open", open); document.documentElement.style.overflow = open && innerWidth < 1100 ? "hidden" : ""; }
  $$("[data-side-toggle]").forEach((b) => b.addEventListener("click", () => setSide(!side.classList.contains("is-open"))));
  addEventListener("keydown", (e) => e.key === "Escape" && setSide(false));
  $$(".d-group > button").forEach((b) => b.addEventListener("click", () => {
    if (document.body.classList.contains("is-rail") && innerWidth >= 1100 && b.dataset.first) { location.href = b.dataset.first; return; }
    const g = b.parentElement; const o = !g.classList.contains("is-open"); g.classList.toggle("is-open", o); b.setAttribute("aria-expanded", String(o));
  }));
  // Collapse the side menu to an icon rail (remembered)
  $$("[data-rail-toggle]").forEach((b) => {
    const label = () => b.setAttribute("aria-label", document.body.classList.contains("is-rail") ? "Expand the side menu" : "Collapse the side menu");
    label();
    b.addEventListener("click", () => {
      const on = !document.body.classList.contains("is-rail");
      document.body.classList.toggle("is-rail", on);
      try { localStorage.setItem("suinance-rail", on ? "1" : "0"); } catch (e) {}
      label();
      setTimeout(() => dispatchEvent(new Event("resize")), 380);
    });
  });
  // Avatar menu
  const meBtn = $("[data-me-menu]"), meMenu = $(".d-menu");
  if (meBtn && meMenu) {
    const set = (o) => { meMenu.hidden = !o; meBtn.setAttribute("aria-expanded", String(o)); if (o) { const f = $("a, button", meMenu); f && f.focus(); } };
    meBtn.addEventListener("click", (e) => { e.stopPropagation(); set(meMenu.hidden); });
    document.addEventListener("click", (e) => { if (!meMenu.hidden && !e.target.closest(".d-me")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !meMenu.hidden) { set(false); meBtn.focus(); } });
  }
  $$("[data-logout]").forEach((b) => b.addEventListener("click", async () => { try { await fetch(C.api + "/api/auth/logout", { method: "POST", credentials: "include" }); } catch (e) {} location.replace("../index.html"); }));

  /* ───────── Count-up (with prefix/suffix) ───────── */
  function countUp(el, value, { prefix = "", suffix = "", decimals = 2 } = {}) {
    const fmt = (n) => prefix + num(n, decimals) + suffix;
    if (reduce) { el.textContent = fmt(value); return; }
    const start = performance.now(), dur = 1300;
    (function tick(t) { const p = Math.min(1, (t - start) / dur); el.textContent = fmt(value * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(start);
  }
  const io = "IntersectionObserver" in window ? new IntersectionObserver((ens) => ens.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    io.unobserve(el);
    el.classList.add("is-in");
    $$("[data-count]", el).forEach((c) => countUp(c, Number(c.dataset.count), { prefix: c.dataset.prefix || "", suffix: c.dataset.suffix || "", decimals: Number(c.dataset.dec || 0) }));
    $$("[data-w]", el).forEach((b) => requestAnimationFrame(() => (b.style.width = b.dataset.w)));
    $$("[data-h]", el).forEach((b, i) => setTimeout(() => (b.style.height = b.dataset.h), i * 60));
    $$("[data-dash]", el).forEach((c) => requestAnimationFrame(() => c.setAttribute("stroke-dasharray", c.dataset.dash)));
  }), { rootMargin: "0px 0px -6% 0px" }) : null;
  function animateIn(scope) {
    $$(".d-stat, .d-panel, [data-anim]", scope || document).forEach((el) => {
      if (el.dataset.observed) return;
      el.dataset.observed = "1";
      if (io && !reduce) io.observe(el); else { el.classList.add("is-in"); $$("[data-count]", el).forEach((c) => countUp(c, Number(c.dataset.count), { prefix: c.dataset.prefix || "", suffix: c.dataset.suffix || "", decimals: Number(c.dataset.dec || 0) })); $$("[data-w]", el).forEach((b) => (b.style.width = b.dataset.w)); $$("[data-h]", el).forEach((b) => (b.style.height = b.dataset.h)); $$("[data-dash]", el).forEach((c) => c.setAttribute("stroke-dasharray", c.dataset.dash)); }
    });
    if (window.SuinanceReveal) window.SuinanceReveal(scope);
  }

  /* ───────── Components ───────── */
  // Sparkline path from a series of numbers
  function spark(series) {
    if (!series || series.length < 2) return "";
    const w = 160, h = 40, max = Math.max(...series, 1), min = Math.min(...series, 0);
    const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const last = pts[pts.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="area" d="${line} L${w} ${h} L0 ${h} Z"/><path class="line" d="${line}" style="--len:420"/><circle cx="${last[0]}" cy="${last[1]}" r="3.5"/></svg>`;
  }
  // value: { n, prefix, suffix, dec } or plain string
  function stat({ label, value, sub, icon = "total", tone = "", trend, series, href, link }) {
    const v = typeof value === "object" ? `<span data-count="${value.n}" data-prefix="${value.prefix || ""}" data-suffix="${value.suffix || ""}" data-dec="${value.dec == null ? 2 : value.dec}">${value.prefix || ""}0${value.suffix || ""}</span>` : esc(value);
    const tr = trend == null || !isFinite(trend) ? "" : `<span class="trend ${trend < 0 ? "down" : ""}" title="Change vs the previous 30 days">${trend < 0 ? "▼" : "▲"} ${Math.abs(trend) > 999 ? "999+" : Math.abs(trend).toFixed(0)}%</span>`;
    const dark = tone === "is-yellow" || tone === "is-dark";
    const fill = dark ? "rgb(255 255 255 / 0.1)" : "var(--surface)";
    const glyphColor = "var(--yellow)";
    return `<article class="d-stat ${tone}"><div class="top"><span class="ico" style="color:${glyphColor}">${HEX(fill, dark ? "rgb(255 255 255 / 0.2)" : "var(--surface)")}${svg(G[icon] || G.total, "g")}</span><span class="label">${esc(label)}</span>${tr}</div>
      <span class="val">${v}</span>${sub ? `<span class="sub">${sub}</span>` : ""}${series ? spark(series) : ""}
      ${href ? `<span class="go">${esc(link || "View report")} ${svg(G.arrow)}</span><a class="cover" href="${href}" aria-label="${esc(label)}: ${esc(link || "View report")}"></a>` : ""}</article>`;
  }
  const status = (s) => { const k = /active|completed|closed|answered|member/i.test(s) ? "ok" : /open|pending|review/i.test(s) ? "wait" : "bad"; return `<span class="d-status ${k}">${esc(s)}</span>`; };

  // Sliding tab indicator (works for links and buttons)
  function tabs(box) {
    if (!box) return;
    box.classList.remove("no-js");
    let ind = $(".ind", box);
    if (!ind) { ind = document.createElement("span"); ind.className = "ind"; box.prepend(ind); }
    const move = () => {
      const cur = $('[aria-selected="true"], [aria-current="page"]', box);
      if (!cur) return;
      ind.style.width = cur.offsetWidth + "px";
      ind.style.transform = `translateX(${cur.offsetLeft}px)`;
      if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: cur.offsetLeft - 24, behavior: reduce ? "auto" : "smooth" });
    };
    move();
    addEventListener("resize", move);
    document.fonts && document.fonts.ready.then(move);
    box._move = move;
  }
  function selectTab(box, attr, key, panes, paneAttr) {
    $$(`[${attr}]`, box).forEach((b) => b.setAttribute("aria-selected", String(b.getAttribute(attr) === key)));
    panes.forEach((p) => { const on = p.getAttribute(paneAttr) === key; p.hidden = !on; if (on) { p.style.animation = "none"; p.offsetHeight; p.style.animation = "fade-down .4s var(--ease)"; } });
    box._move && box._move();
  }

  // Data table with search + pagination + staggered rows
  function table(mount, { columns, rows, pageSize = 15, searchKeys, empty = "Nothing here yet." }) {
    const box = typeof mount === "string" ? $(mount) : mount;
    if (!box) return;
    const input = $("[data-table-search]", box.closest(".d-panel") || document);
    let pageNo = 1;
    const filtered = () => { const q = input ? input.value.trim().toLowerCase() : ""; return q ? rows.filter((r) => (searchKeys || Object.keys(r)).some((k) => String(r[k] == null ? "" : r[k]).toLowerCase().includes(q))) : rows; };
    function draw() {
      const list = filtered();
      const pages = Math.max(1, Math.ceil(list.length / pageSize));
      pageNo = Math.min(pageNo, pages);
      const start = (pageNo - 1) * pageSize, slice = list.slice(start, start + pageSize);
      const head = "<tr>" + columns.map((c) => `<th scope="col" class="${c.num ? "num" : ""}">${esc(c.label)}</th>`).join("") + "</tr>";
      const body = slice.length ? slice.map((r, i) => `<tr style="--i:${i}">` + columns.map((c) => `<td class="${c.num ? "num" : ""} ${c.mono ? "mono" : ""}">${c.render ? c.render(r, start + i) : esc(r[c.key])}</td>`).join("") + "</tr>").join("")
        : `<tr><td colspan="${columns.length}"><div class="d-empty">${EMPTY}<span>${esc(empty)}</span></div></td></tr>`;
      const nums = [];
      for (let p = Math.max(1, pageNo - 2); p <= Math.min(pages, pageNo + 2); p++) nums.push(p);
      box.innerHTML = `<div class="d-table-wrap"><table class="d-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>
        <div class="d-table-foot"><span>Showing ${list.length ? start + 1 : 0}–${start + slice.length} of ${list.length} entries</span>
        <div class="d-pager"><button type="button" data-p="${pageNo - 1}" ${pageNo === 1 ? "disabled" : ""} aria-label="Previous page">←</button>${nums.map((p) => `<button type="button" data-p="${p}" ${p === pageNo ? 'aria-current="page"' : ""}>${p}</button>`).join("")}<button type="button" data-p="${pageNo + 1}" ${pageNo === pages ? "disabled" : ""} aria-label="Next page">→</button></div></div>`;
      $$("[data-p]", box).forEach((b) => b.addEventListener("click", () => { pageNo = Number(b.dataset.p); draw(); box.closest(".d-panel").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }));
    }
    if (input) input.addEventListener("input", () => { pageNo = 1; draw(); });
    draw();
  }
  const SNO = { label: "S.No.", render: (_, i) => i + 1, mono: true };

  // Donut chart (animated arcs) + legend
  const PALETTE = ["#a0d0d0", "#dccb9f", "#9080c0", "#70a0a0", "#c0b0f0", "#407070", "#8a7a55"];
  function donut(box, items, centerLabel) {
    if (!box) return;
    const total = sum(items, (i) => i.v) || 1;
    const R = 80, CIRC = 2 * Math.PI * R;
    let off = 0;
    const segs = items.map((it, i) => {
      const len = (it.v / total) * CIRC;
      const s = `<circle class="seg" data-i="${i}" cx="100" cy="100" r="${R}" stroke="${PALETTE[i % PALETTE.length]}" stroke-dasharray="0 ${CIRC}" data-dash="${Math.max(0, len - 2).toFixed(2)} ${CIRC.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"><title>${esc(it.label)}: ${usd(it.v)}</title></circle>`;
      off += len;
      return s;
    }).join("");
    box.innerHTML = `<div class="d-donut-wrap" data-anim><div class="d-donut"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--line)" stroke-width="26"/>${segs}</svg>
      <div class="mid"><b data-mid-v>${usd(total, 0)}</b><span data-mid-l>${esc(centerLabel)}</span></div></div>
      <div class="d-legend">${items.map((it, i) => `<button type="button" data-i="${i}"><span class="n"><span class="sw" style="background:${PALETTE[i % PALETTE.length]}"></span>${esc(it.label)}</span><span class="p">${((it.v / total) * 100).toFixed(1)}%</span></button>`).join("")}</div></div>`;
    const wrap = $(".d-donut", box);
    const pick = (i) => {
      const on = i != null;
      wrap.classList.toggle("has-on", on);
      $$(".seg", box).forEach((s) => s.classList.toggle("on", s.dataset.i === String(i)));
      $$(".d-legend button", box).forEach((b) => b.classList.toggle("on", b.dataset.i === String(i)));
      $("[data-mid-v]", box).textContent = on ? usd(items[i].v, 0) : usd(total, 0);
      $("[data-mid-l]", box).textContent = on ? items[i].label : centerLabel;
    };
    $$(".seg, .d-legend button", box).forEach((el) => { el.addEventListener("mouseenter", () => pick(Number(el.dataset.i))); el.addEventListener("click", () => pick(Number(el.dataset.i))); });
    $(".d-donut-wrap", box).addEventListener("mouseleave", () => pick(null));
  }

  /* ───────── Domain math ───────── */
  function totals(d) {
    const by = {};
    C.incomes.forEach((i) => (by[i.key] = sum(d.ledger.filter((l) => l.type === i.key), (l) => l.credit)));
    const income = sum(Object.values(by), (x) => x);
    const deposits = sum(d.ledger.filter((l) => l.type === "deposit"), (l) => l.credit);
    const withdrawals = sum(d.ledger.filter((l) => l.type === "withdraw"), (l) => l.debit);
    const staked = sum(d.ledger.filter((l) => l.type === "stake"), (l) => l.debit);
    const retained = income * C.retentionPct / 100;
    const balance = sum(d.ledger, (l) => l.credit) - sum(d.ledger, (l) => l.debit) - retained;
    return { by, income, deposits, withdrawals, staked, retained, balance };
  }
  const isIncome = (t) => C.incomes.some((i) => i.key === t);
  function series(rows, days = 14) {
    const out = Array(days).fill(0);
    const now = Date.now();
    rows.forEach((r) => { const k = Math.floor((now - new Date(r.date)) / DAY); if (k >= 0 && k < days) out[days - 1 - k] += r.credit; });
    return out.map((v, i, a) => a.slice(0, i + 1).reduce((x, y) => x + y, 0)); // cumulative looks smoother
  }
  function trend(rows) {
    const now = Date.now();
    const a = sum(rows.filter((r) => now - new Date(r.date) < 30 * DAY), (r) => r.credit);
    const b = sum(rows.filter((r) => { const t = now - new Date(r.date); return t >= 30 * DAY && t < 60 * DAY; }), (r) => r.credit);
    return b ? ((a - b) / b) * 100 : null;
  }
  const money = (n, dec = 2) => ({ n, prefix: "$", dec });

  function stakesList(box, stakes) {
    if (!box) return;
    if (!stakes.length) { box.innerHTML = `<div class="d-empty">${EMPTY}<span>No active stakes yet.</span><a class="btn btn-primary btn-sm" href="stake.html">Choose a package</a></div>`; return; }
    box.innerHTML = stakes.map((s) => {
      const pct = Math.min(100, (s.earnedUsd / s.capUsd) * 100);
      return `<div class="d-stake" data-anim><div class="head"><strong>${esc(s.package)} package <span class="mono muted" style="font-size:12px;font-weight:400">${esc(s.id)}</span></strong>${status(s.status)}</div>
        <div class="meta"><span>Staked<b>${usd(s.amountUsd)}</b></span><span>Since<b>${date(s.start)}</b></span></div>
        <div class="d-progress" role="progressbar" aria-valuenow="${pct.toFixed(0)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(s.package)} progress to cap"><span data-w="${pct}%"></span></div>
        <div class="foot"><span>Earned ${usd(s.earnedUsd)}</span><span>${pct.toFixed(1)}% of ${usd(s.capUsd, 0)} cap</span></div></div>`;
    }).join("");
  }
  function retention(box, t) {
    if (!box) return;
    const rows = C.incomes.map((i) => { const g = t.by[i.key], r = g * C.retentionPct / 100; return { name: i.name, key: i.key, g, r, n: g - r }; });
    box.innerHTML = `<div class="d-table-wrap"><table class="d-table"><thead><tr><th>Income</th><th class="num">Earned</th><th class="num">Retained (${C.retentionPct}%)</th><th class="num">Credited</th></tr></thead><tbody>
      ${rows.map((x, i) => `<tr style="--i:${i}"><td><a class="underline" style="text-decoration-color:var(--line)" href="income.html?type=${x.key}">${esc(x.name)}</a></td><td class="num mono">${usd(x.g)}</td><td class="num mono minus">−${usd(x.r)}</td><td class="num mono plus">${usd(x.n)}</td></tr>`).join("")}
      <tr class="total"><td>Total</td><td class="num mono">${usd(t.income)}</td><td class="num mono">−${usd(t.retained)}</td><td class="num mono">${usd(t.income - t.retained)}</td></tr></tbody></table></div>`;
  }

  /* ───────── Pages ───────── */
  const R = {};
  // Shared with page scripts such as network.js (they add their renderer to R).
  window.SuinanceDash = { R, esc, usd, num, date, toast, stat, animateIn };

  R.overview = (d) => {
    const t = totals(d);
    const inc = d.ledger.filter((l) => isIncome(l.type));
    const glance = $("[data-stats-glance]");
    if (glance) glance.innerHTML =
      stat({ label: "Available balance", value: money(t.balance), sub: "≈ " + sui(t.balance), icon: "wallet", tone: "is-yellow", href: "wallet.html", link: "SUI wallet" }) +
      stat({ label: "Total income", value: money(t.income), sub: "≈ " + sui(t.income), icon: "total", trend: trend(inc), series: series(inc), href: "income.html", link: "All income" }) +
      stat({ label: "My team", value: { n: d.direct.length + d.indirect.length, dec: 0 }, sub: `${d.direct.length} direct · ${d.indirect.length} indirect`, icon: "users", href: "network.html", link: "Network map" }) +
      stat({ label: "Active stakes", value: { n: d.stakes.length, dec: 0 }, sub: `${usd(sum(d.stakes, (x) => x.amountUsd), 0)} staked`, icon: "layers", tone: "is-dark", href: "staking-report.html", link: "Staking report" });
    incomeBreakdown($("[data-income-v2]"), d, t, inc);
  };

  // One calm panel: total + area chart on the left, the seven streams as a ranked list on the right.
  function incomeBreakdown(box, d, t, inc) {
    if (!box) return;
    const items = C.incomes.map((i, k) => {
      const rows = inc.filter((l) => l.type === i.key);
      return { key: i.key, name: i.name, v: t.by[i.key], tr: trend(rows), color: PALETTE[k % PALETTE.length] };
    }).sort((a, b) => b.v - a.v);
    const total = t.income || 1, max = Math.max(...items.map((x) => x.v), 1);
    // 30-day cumulative curve
    const s = series(inc, 30), W = 560, Hh = 150, top = Math.max(...s, 1);
    const pts = s.map((v, i) => [(i / (s.length - 1)) * W, Hh - 8 - (v / top) * (Hh - 24)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const last = pts[pts.length - 1];
    const tr = trend(inc);
    const chip = (v) => (v == null || !isFinite(v) ? "" : `<span class="ib-trend ${v < 0 ? "down" : ""}">${v < 0 ? "▼" : "▲"} ${Math.abs(v) > 999 ? "999+" : Math.abs(v).toFixed(0)}%</span>`);
    const last30 = sum(inc.filter((l) => Date.now() - new Date(l.date) < 30 * DAY), (l) => l.credit);
    box.innerHTML = `<div class="ib" data-anim>
      <div class="ib-hero">
        <span class="ib-label">Total income</span>
        <div class="ib-total"><span data-count="${t.income}" data-prefix="$" data-dec="2">$0</span>${chip(tr)}</div>
        <span class="ib-sub">≈ ${sui(t.income)} · <b>${usd(last30)}</b> in the last 30 days</span>
        <svg class="ib-chart" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="ib-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a0d0d0" stop-opacity=".35"/><stop offset="1" stop-color="#a0d0d0" stop-opacity="0"/></linearGradient></defs>
          ${[0.25, 0.5, 0.75].map((g) => `<line x1="0" x2="${W}" y1="${(Hh * g).toFixed(0)}" y2="${(Hh * g).toFixed(0)}" class="grid"/>`).join("")}
          <path class="area" d="${line} L${W} ${Hh} L0 ${Hh} Z"/><path class="line" d="${line}" pathLength="1"/>
          <circle cx="${last[0]}" cy="${last[1]}" r="5" class="dot"/><circle cx="${last[0]}" cy="${last[1]}" r="11" class="halo"/>
        </svg>
        <div class="ib-axis"><span>30 days ago</span><span>Today</span></div>
        <div class="ib-stack" aria-hidden="true">${items.map((x) => `<span data-w="${((x.v / total) * 100).toFixed(2)}%" style="background:${x.color}" title="${esc(x.name)}"></span>`).join("")}</div>
      </div>
      <ul class="ib-list">${items.map((x, i) => `<li style="--i:${i}"><a href="income.html?type=${x.key}">
        <span class="ib-dot" style="--c:${x.color}"></span>
        <span class="ib-name">${esc(x.name)}<small>${((x.v / total) * 100).toFixed(1)}% of income</small></span>
        <span class="ib-track"><span data-w="${((x.v / max) * 100).toFixed(1)}%" style="background:${x.color}"></span></span>
        <span class="ib-amt">${usd(x.v)}${chip(x.tr)}</span>
        <svg class="ib-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>`).join("")}</ul>
    </div>`;
  }

  R.income = (d) => {
    const type = params.get("type") || "all";
    const meta = C.incomes.find((i) => i.key === type);
    $$(".d-sub a").forEach((a) => { if (!a.pathname.endsWith("income.html")) return; const t = new URL(a.href).searchParams.get("type") || "all"; if (t === type) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    const nav = $("[data-income-tabs]");
    nav.innerHTML = `<a href="income.html" ${type === "all" ? 'aria-current="page"' : ""}>All income</a>` + C.incomes.map((i) => `<a href="income.html?type=${i.key}" ${type === i.key ? 'aria-current="page"' : ""}>${esc(i.name)}</a>`).join("");
    tabs(nav);
    $("[data-income-title]").textContent = meta ? meta.name : "All income";
    $("[data-income-note]").textContent = meta ? meta.note : "Every reward credited to your wallet, newest first.";
    const crumb = $(".d-hero .crumbs [aria-current]"); if (crumb) crumb.textContent = meta ? meta.name : "All income";
    document.title = (meta ? meta.name : "Income") + " · Suinance dashboard";
    const rows = d.ledger.filter((l) => (meta ? l.type === meta.key : isIncome(l.type)));
    const last30 = rows.filter((l) => Date.now() - new Date(l.date) < 30 * DAY);
    $("[data-income-stats]").innerHTML =
      stat({ label: meta ? `Total ${meta.name.toLowerCase()}` : "Total income", value: money(sum(rows, (l) => l.credit)), sub: "≈ " + sui(sum(rows, (l) => l.credit)), icon: meta ? meta.key : "total", tone: "is-yellow", series: series(rows, 30) }) +
      stat({ label: "Last 30 days", value: money(sum(last30, (l) => l.credit)), sub: `${last30.length} credits`, icon: "clock", trend: trend(rows), series: series(rows) }) +
      stat({ label: "Entries", value: { n: rows.length, dec: 0 }, sub: rows.length ? `Average ${usd(sum(rows, (l) => l.credit) / rows.length)}` : "No credits yet", icon: "list", tone: "is-dark" });
    table("[data-table]", { rows, searchKeys: ["desc", "type"], empty: "No income of this type yet.",
      columns: [SNO, { label: "Date", render: (r) => date(r.date), mono: true }, { label: "Income", render: (r) => esc(incomeName(r.type)) }, { label: "Description", key: "desc" }, { label: "Credit", render: (r) => `<span class="plus">+${usd(r.credit, 4)}</span>`, num: true, mono: true }, { label: "≈ SUI", render: (r) => num(r.credit / PRICE, 4), num: true, mono: true }] });
  };

  R.retention = (d) => {
    const t = totals(d);
    $("[data-retention-stats]").innerHTML = stat({ label: "Total earned", value: money(t.income), sub: "≈ " + sui(t.income), icon: "total" }) + stat({ label: `Retained (${C.retentionPct}%)`, value: money(t.retained), sub: "Held for the program reserve", icon: "lock", tone: "is-dark" }) + stat({ label: "Credited to wallet", value: money(t.income - t.retained), sub: "≈ " + sui(t.income - t.retained), icon: "wallet", tone: "is-yellow" });
    retention($("[data-retention]"), t);
  };

  function teamStats(list, deep) {
    const act = list.filter((m) => m.active);
    return stat({ label: deep ? "Indirect members" : "Direct members", value: { n: list.length, dec: 0 }, sub: `${act.length} active`, icon: "users", tone: "is-yellow" }) +
      stat({ label: "Active", value: { n: act.length, dec: 0 }, sub: `${((act.length / (list.length || 1)) * 100).toFixed(0)}% of the team`, icon: "check" }) +
      (deep ? stat({ label: "Deepest level", value: { n: Math.max(0, ...list.map((m) => m.level)), dec: 0 }, sub: "levels below you", icon: "layers" })
        : stat({ label: "Left / right", value: `${list.filter((m) => m.side === "Left").length} / ${list.filter((m) => m.side === "Right").length}`, sub: "placement", icon: "tree" })) +
      stat({ label: "Team investment", value: money(sum(list, (m) => m.investUsd), 0), sub: "≈ " + sui(sum(list, (m) => m.investUsd), 0), icon: "wallet", tone: "is-dark" });
  }
  R["direct-team"] = (d) => {
    $("[data-stats]").innerHTML = teamStats(d.direct, false);
    table("[data-table]", { rows: d.direct, searchKeys: ["uid", "name", "package", "side"], columns: [SNO, { label: "User ID", key: "uid", mono: true }, { label: "Name", key: "name" }, { label: "Joined", render: (r) => date(r.joined), mono: true }, { label: "Position", render: (r) => `<span class="d-status ${r.side === "Left" ? "wait" : "ok"}" style="${r.side === "Right" ? "background:var(--surface);color:#fff" : ""}">${r.side}</span>` }, { label: "Package", key: "package" }, { label: "Investment", render: (r) => usd(r.investUsd), num: true, mono: true }, { label: "Status", render: (r) => status(r.active ? "Active" : "Inactive") }] });
  };
  R["indirect-team"] = (d) => {
    $("[data-stats]").innerHTML = teamStats(d.indirect, true);
    table("[data-table]", { rows: d.indirect, searchKeys: ["uid", "name", "sponsor", "package", "level"], columns: [SNO, { label: "User ID", key: "uid", mono: true }, { label: "Name", key: "name" }, { label: "Joined", render: (r) => date(r.joined), mono: true }, { label: "Sponsor ID", key: "sponsor", mono: true }, { label: "Level", render: (r) => `<span class="mono" style="display:inline-grid;place-items:center;min-width:28px;height:24px;border-radius:8px;background:var(--tint);border:1px solid var(--line)">${r.level}</span>`, num: true }, { label: "Package", key: "package" }, { label: "Investment", render: (r) => usd(r.investUsd), num: true, mono: true }] });
  };

  R.genealogy = (d) => {
    const colors = { Free: "var(--paper)" };
    ["#fff6b3", "#ffe97a", "#ffd400", "#e0b23a", "#111111"].forEach((c, i) => C.packages[i] && (colors[C.packages[i].name] = c));
    $("[data-legend]").innerHTML = Object.entries(colors).map(([k, c]) => `<span><i style="background:${c}"></i>${esc(k)}</span>`).join("");
    const index = {}, parent = {};
    (function walk(n, p) { if (!n || n.empty) return; index[n.uid] = n; if (p) parent[n.uid] = p.uid; walk(n.left, n); walk(n.right, n); })(d.tree, null);
    const hexNode = (fill, dashed) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 90 27v46L50 96 10 73V27z" fill="${fill}" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="8 7"' : ""}/>${dashed ? '<path d="M38 50h24M50 38v24" stroke="var(--muted)" stroke-width="5" stroke-linecap="round"/>' : ""}</svg>`;
    function li(n, depth, root) {
      if (!n || n.empty) return `<li style="--depth:${depth}"><div class="d-node free">${hexNode("transparent", true)}<span>Free place</span></div></li>`;
      const kids = n.left !== null || n.right !== null ? `<ul>${li(n.left, depth + 1)}${li(n.right, depth + 1)}</ul>` : "";
      return `<li style="--depth:${depth}"><button type="button" class="d-node ${root ? "root" : ""}" data-uid="${esc(n.uid)}" title="Open ${esc(n.name)}'s tree">${hexNode(colors[n.rank] || "var(--paper)")}<span>${esc(n.uid)}</span><span class="who">${esc(n.name)}</span><span class="rank">${esc(n.rank)}</span></button>${kids}</li>`;
    }
    const mount = $("[data-tree]");
    function show(root) {
      mount.innerHTML = `<div class="d-tree"><ul>${li(root, 0, true)}</ul></div>`;
      const path = []; let cur = root.uid; while (cur) { path.unshift(index[cur].name.split(" ")[0] + " · " + cur); cur = parent[cur]; }
      $("[data-tree-path]").textContent = root === d.tree ? "Showing your tree" : "Path: " + path.join("  →  ");
      $$("[data-uid]", mount).forEach((b) => b.addEventListener("click", () => { if (index[b.dataset.uid] === root) return; $("#tree-uid").value = b.dataset.uid; show(index[b.dataset.uid]); }));
      requestAnimationFrame(() => { mount.scrollLeft = (mount.scrollWidth - mount.clientWidth) / 2; });
    }
    show(d.tree);
    // drag to pan
    let drag = null;
    mount.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; drag = { x: e.clientX, s: mount.scrollLeft }; });
    addEventListener("pointermove", (e) => { if (drag) mount.scrollLeft = drag.s - (e.clientX - drag.x); });
    addEventListener("pointerup", () => (drag = null));
    $("#tree-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const id = $("#tree-uid").value.trim(), err = $("[data-tree-error]");
      if (!id) { err.hidden = true; show(d.tree); return; }
      if (!index[id]) { err.hidden = false; err.textContent = `User ID ${id} is not in your binary team.`; return; }
      err.hidden = true; show(index[id]);
    });
    $("[data-tree-reset]").addEventListener("click", () => { $("#tree-uid").value = ""; $("[data-tree-error]").hidden = true; show(d.tree); });
  };

  R.stake = (d) => {
    const t = totals(d);
    $("[data-stake-balance]").innerHTML = `<div><span class="l">Available balance</span><span class="v" data-count="${t.balance}" data-prefix="$" data-dec="2">$0</span><span class="s">≈ ${sui(t.balance)}</span></div><div><span class="l">1 SUI</span><span class="v">${usd(PRICE, 4)}</span><span class="s dim">live price</span></div><div><span class="l">Active stakes</span><span class="v">${d.stakes.length}</span><span class="s dim">${usd(sum(d.stakes, (s) => s.amountUsd), 0)} staked</span></div>`;
    const MARK = '<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 90 27v46L50 96 10 73V27z" fill="currentColor"/></svg>';
    $("[data-packages]").innerHTML = C.packages.map((p, i) => {
      const fee = p.amountUsd * C.adminChargePct / 100;
      return `<article class="d-pkg ${p.featured ? "featured" : ""}" data-reveal style="--d:${i * 0.06}s">${MARK}
        <span class="name">${esc(p.name)} package ${p.featured ? '<span class="badge">Top</span>' : ""}</span>
        <span class="amt">$${num(p.amountUsd, 0)}<small>≈ ${num(p.amountUsd / PRICE, 1)} SUI</small></span>
        <div class="d-rows"><div><span class="k"><i></i>Daily reward rate</span><span class="v">${num(p.dailyPct, 2)}%</span></div><div><span class="k"><i></i>Cap</span><span class="v">${p.capX}x · $${num(p.amountUsd * p.capX, 0)}</span></div><div><span class="k"><i></i>Admin charge</span><span class="v">$${num(fee, 0)}</span></div></div>
        <div class="note">${svg(G.info)}<span>Total to pay: $${num(p.amountUsd + fee, 0)}. Rates are program terms and can change. Rewards are not guaranteed.</span></div>
        <button type="button" class="btn btn-lg btn-block" data-stake="${p.id}">Stake ${esc(p.name)} ${svg(G.arrow, "arrow-right")}</button></article>`;
    }).join("");
    const scrim = $("#stake-modal"), m = $(".d-modal", scrim);
    let current = null, lastBtn = null;
    const close = () => { scrim.classList.remove("is-open"); document.documentElement.style.overflow = ""; lastBtn && lastBtn.focus(); };
    $$("[data-stake]").forEach((b) => b.addEventListener("click", () => {
      lastBtn = b;
      current = C.packages.find((p) => p.id === b.dataset.stake);
      const fee = current.amountUsd * C.adminChargePct / 100, total = current.amountUsd + fee;
      $("[data-m-name]", m).textContent = `${current.name} package`;
      $("[data-m-amt]", m).textContent = "$" + num(current.amountUsd, 0);
      $("[data-m-rate]", m).textContent = num(current.dailyPct, 2) + "%";
      $("[data-m-cap]", m).textContent = current.capX + "x";
      $("[data-m-price]", m).textContent = "$" + num(PRICE, 4);
      $("[data-m-balance]", m).textContent = usd(t.balance);
      $("[data-m-rows]", m).innerHTML = `<div><span class="k"><i></i>Package</span><span class="v">${usd(current.amountUsd)}</span></div><div><span class="k"><i></i>Admin charge (${C.adminChargePct}%)</span><span class="v">${usd(fee)}</span></div><div><span class="k"><i></i>Paid in SUI</span><span class="v">${num(total / PRICE, 4)} SUI</span></div><div class="total"><span class="k">Total</span><span class="v">${usd(total)}</span></div>`;
      $("[data-m-alert]", m).hidden = true;
      $("#stake-form").reset();
      $("#stake-uid").value = d.me.uid;
      const enough = t.balance >= total, btn = $("#stake-submit");
      btn.disabled = !enough;
      btn.textContent = enough ? `Confirm stake · ${usd(total)}` : "Not enough balance · deposit SUI first";
      scrim.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
      setTimeout(() => $(".close", m).focus(), 60);
    }));
    $(".close", m).addEventListener("click", close);
    scrim.addEventListener("click", (e) => e.target === scrim && close());
    addEventListener("keydown", (e) => e.key === "Escape" && scrim.classList.contains("is-open") && close());
    $("#stake-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const a = $("[data-m-alert]", m);
      if (!/^\d{6}$/.test($("#stake-uid").value.trim())) { a.hidden = false; a.textContent = "Enter a 6-digit user ID."; return; }
      if ($("#stake-code").value.trim().length < 4) { a.hidden = false; a.textContent = "Enter your security code."; return; }
      if (!$("#stake-terms").checked) { a.hidden = false; a.textContent = "Please accept the staking terms."; return; }
      if (d.demo) { close(); toast("Demo mode: no stake was placed"); return; }
      a.hidden = false; a.textContent = "Staking is not connected to the server yet.";
    });
  };

  R["staking-report"] = (d) => {
    const total = sum(d.stakes, (s) => s.amountUsd), earned = sum(d.stakes, (s) => s.earnedUsd), cap = sum(d.stakes, (s) => s.capUsd);
    $("[data-stats]").innerHTML = stat({ label: "Total staked", value: money(total), sub: "≈ " + sui(total), icon: "layers", tone: "is-yellow" }) + stat({ label: "Earned so far", value: money(earned), sub: `${((earned / (cap || 1)) * 100).toFixed(1)}% of combined cap`, icon: "roi" }) + stat({ label: "Active stakes", value: { n: d.stakes.length, dec: 0 }, sub: `Cap ${usd(cap, 0)}`, icon: "clock", tone: "is-dark" });
    stakesList($("[data-my-stakes]"), d.stakes);
    table("[data-table]", { rows: d.stakes, empty: "No stakes yet.", columns: [SNO, { label: "Stake ID", key: "id", mono: true }, { label: "Date", render: (r) => date(r.start), mono: true }, { label: "Package", key: "package" }, { label: "Amount", render: (r) => usd(r.amountUsd), num: true, mono: true }, { label: "Daily rate", render: (r) => num(r.dailyPct, 2) + "%", num: true, mono: true }, { label: "Days", key: "days", num: true, mono: true }, { label: "Earned", render: (r) => usd(r.earnedUsd), num: true, mono: true }, { label: "Status", render: (r) => status(r.status) }] });
  };
  R["unstaking-report"] = (d) => table("[data-table]", { rows: d.unstakes, empty: "No completed or released stakes yet.", columns: [SNO, { label: "Stake ID", key: "id", mono: true }, { label: "Package", key: "package" }, { label: "Started", render: (r) => date(r.start), mono: true }, { label: "Released", render: (r) => date(r.end), mono: true }, { label: "Principal", render: (r) => usd(r.amountUsd), num: true, mono: true }, { label: "Rewards", render: (r) => usd(r.rewardsUsd), num: true, mono: true }, { label: "Status", render: (r) => status(r.status) }] });

  R.wallet = (d) => {
    const t = totals(d);
    $("[data-wallet-balance]").innerHTML = `<div><span class="l">SUI wallet</span><span class="v" data-count="${t.balance / PRICE}" data-dec="4">0</span><span class="s">SUI</span></div><div><span class="l">Value</span><span class="v" data-count="${t.balance}" data-prefix="$" data-dec="2">$0</span><span class="s dim">at today&rsquo;s price</span></div><div><span class="l">1 SUI</span><span class="v">${usd(PRICE, 4)}</span><span class="s dim">live price</span></div>`;
    $("[data-deposit-addr]").textContent = d.depositAddress;
    $("[data-deposit-copy]").dataset.copyText = d.depositAddress;
    const qr = $("[data-qr]");
    qr.innerHTML = '<span class="scan" aria-hidden="true"></span>';
    if (window.QRCode) { const holder = document.createElement("div"); qr.appendChild(holder); new window.QRCode(holder, { text: d.depositAddress, width: 220, height: 220, correctLevel: window.QRCode.CorrectLevel.M }); }
    else qr.insertAdjacentHTML("beforeend", '<p class="muted">The QR code could not load. Copy the address below.</p>');
    $("[data-wd-fee]").textContent = C.withdrawFeeSui + " SUI";
    const box = $("[data-wallet-tabs]");
    tabs(box);
    const panes = $$("[data-wpane]");
    const go = (k) => { selectTab(box, "data-wtab", k, panes, "data-wpane"); history.replaceState(null, "", "#" + k); };
    $$("[data-wtab]", box).forEach((b) => b.addEventListener("click", () => go(b.dataset.wtab)));
    selectTab(box, "data-wtab", location.hash === "#withdraw" ? "withdraw" : "deposit", panes, "data-wpane");
    const amt = $("#wd-amount"), rec = $("[data-wd-receive]");
    const upd = () => (rec.textContent = num(Math.max(0, Number(amt.value || 0) - C.withdrawFeeSui), 4) + " SUI");
    $("#wd-max").addEventListener("click", () => { amt.value = Math.max(0, t.balance / PRICE - C.withdrawFeeSui).toFixed(4); upd(); });
    amt.addEventListener("input", upd);
    $("#withdraw-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const a = $("[data-wd-alert]"), addr = $("#wd-address").value.trim(), v = Number(amt.value);
      a.className = "alert danger";
      if (!/^0x[0-9a-fA-F]{64}$/.test(addr)) { a.hidden = false; a.textContent = "Enter a full Sui address: 0x followed by 64 hex characters."; return; }
      if (!(v >= C.withdrawMinSui)) { a.hidden = false; a.textContent = `The minimum withdrawal is ${C.withdrawMinSui} SUI.`; return; }
      if (v > t.balance / PRICE) { a.hidden = false; a.textContent = "This is more than your available balance."; return; }
      if ($("#wd-code").value.trim().length < 4) { a.hidden = false; a.textContent = "Enter your security code."; return; }
      a.hidden = false;
      if (d.demo) { a.className = "alert info"; a.textContent = "Demo mode: no withdrawal was sent."; return; }
      a.textContent = "Withdrawals are not connected to the server yet.";
    });
  };

  R.ledger = (d) => {
    const t = totals(d);
    $("[data-stats]").innerHTML = stat({ label: "Total credits", value: money(sum(d.ledger, (l) => l.credit)), sub: `${d.ledger.filter((l) => l.credit).length} entries`, icon: "down", tone: "is-yellow" }) + stat({ label: "Total debits", value: money(sum(d.ledger, (l) => l.debit)), sub: `${d.ledger.filter((l) => l.debit).length} entries`, icon: "up" }) + stat({ label: "Available balance", value: money(t.balance), sub: "after retention", icon: "wallet", tone: "is-dark" });
    const types = ["all", "deposit", "withdraw", "stake"].concat(C.incomes.map((i) => i.key));
    const label = (k) => (k === "all" ? "All transactions" : k === "deposit" ? "Deposits" : k === "withdraw" ? "Withdrawals" : k === "stake" ? "Stakes" : incomeName(k));
    const sel = $("#ledger-type");
    sel.innerHTML = types.map((k) => `<option value="${k}">${esc(label(k))}</option>`).join("");
    let bal = 0;
    const withBal = d.ledger.slice().reverse().map((l) => { bal += l.credit - l.debit; return Object.assign({}, l, { bal }); }).reverse();
    const typeTag = (k) => { const out = k === "withdraw" || k === "stake"; return `<span class="d-status ${out ? "bad" : k === "deposit" ? "wait" : "ok"}">${esc(k === "deposit" ? "Deposit" : k === "withdraw" ? "Withdrawal" : k === "stake" ? "Stake" : incomeName(k))}</span>`; };
    const draw = () => table("[data-table]", { rows: sel.value === "all" ? withBal : withBal.filter((l) => l.type === sel.value), searchKeys: ["desc", "type"],
      columns: [SNO, { label: "Date", render: (r) => date(r.date), mono: true }, { label: "Type", render: (r) => typeTag(r.type) }, { label: "Description", key: "desc" }, { label: "Credit", render: (r) => (r.credit ? `<span class="plus">+${usd(r.credit, 4)}</span>` : '<span class="muted">–</span>'), num: true, mono: true }, { label: "Debit", render: (r) => (r.debit ? `<span class="minus">−${usd(r.debit, 4)}</span>` : '<span class="muted">–</span>'), num: true, mono: true }, { label: "Balance", render: (r) => usd(r.bal), num: true, mono: true }] });
    sel.addEventListener("change", draw);
    draw();
  };

  R["wallet-summary"] = (d) => {
    const t = totals(d);
    $("[data-stats]").innerHTML = stat({ label: "Available balance", value: money(t.balance), sub: "≈ " + sui(t.balance), icon: "wallet", tone: "is-yellow" }) + stat({ label: "Total deposits", value: money(t.deposits), sub: "≈ " + sui(t.deposits), icon: "down" }) + stat({ label: "Total income", value: money(t.income), sub: "≈ " + sui(t.income), icon: "roi", series: series(d.ledger.filter((l) => isIncome(l.type)), 30) }) +
      stat({ label: "Staked", value: money(t.staked), sub: "≈ " + sui(t.staked), icon: "layers", tone: "is-dark" }) + stat({ label: "Withdrawn", value: money(t.withdrawals), sub: "≈ " + sui(t.withdrawals), icon: "up" }) + stat({ label: `Retained (${C.retentionPct}%)`, value: money(t.retained), sub: "held for the reserve", icon: "lock", tone: "is-dark" });
    const months = {};
    d.ledger.forEach((l) => { const k = l.date.slice(0, 7); months[k] = months[k] || { inc: 0, out: 0 }; if (isIncome(l.type)) months[k].inc += l.credit; if (l.type === "withdraw") months[k].out += l.debit; });
    const keys = Object.keys(months).sort().slice(-6);
    const max = Math.max(1, ...keys.map((k) => Math.max(months[k].inc, months[k].out)));
    $("[data-chart]").innerHTML = `<div class="d-bars" data-anim style="grid-template-columns:repeat(${keys.length},1fr)">${keys.map((k) => `<div class="col"><div class="pair"><span class="bar inc" data-h="${(months[k].inc / max) * 100}%" data-tip="Income ${usd(months[k].inc, 0)}"></span><span class="bar out" data-h="${Math.max(2, (months[k].out / max) * 100)}%" data-tip="Withdrawn ${usd(months[k].out, 0)}"></span></div><span class="m">${new Date(k + "-01").toLocaleDateString("en-GB", { month: "short" })}</span></div>`).join("")}</div>
      <div class="d-legend-row" style="margin-top:16px"><span><i style="background:var(--yellow)"></i>Income</span><span><i style="background:var(--surface)"></i>Withdrawn</span></div>`;
    donut($("[data-donut]"), C.incomes.map((i) => ({ label: i.name, v: t.by[i.key] })), "Total income");
  };

  R.tickets = (d) => {
    const list = $("[data-tickets]");
    const draw = () => (list.innerHTML = d.tickets.length ? d.tickets.map((t, i) => `<div class="d-ticket" style="--i:${i}"><div class="top"><strong>${esc(t.subject)}</strong>${status(t.status)}</div><span class="id">${esc(t.id)} · ${esc(t.category)} · opened ${date(t.created)} · updated ${date(t.updated)}</span></div>`).join("") : `<div class="d-empty">${EMPTY}<span>No tickets yet.</span></div>`);
    draw();
    $("#ticket-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target, a = $("[data-ticket-alert]");
      a.className = "alert danger";
      if (f.subject.value.trim().length < 4) { a.hidden = false; a.textContent = "Add a short subject."; return; }
      if (f.message.value.trim().length < 10) { a.hidden = false; a.textContent = "Describe the issue in a few words."; return; }
      d.tickets.unshift({ id: "TKT-" + Math.floor(2300 + Math.random() * 600), subject: f.subject.value.trim(), category: f.category.value, status: "Open", created: new Date().toISOString(), updated: new Date().toISOString() });
      draw(); f.reset();
      a.hidden = false; a.className = "alert success"; a.textContent = d.demo ? "Demo mode: the ticket is shown here but not sent." : "Ticket created. We will reply by email.";
      toast("Ticket created");
    });
  };

  R.profile = (d) => {
    const f = $("#profile-form");
    f.name.value = d.me.name; f.email.value = d.me.email; f.phone.value = d.me.phone; f.gender.value = d.me.gender || ""; f.suiAddress.value = d.me.suiAddress || "";
    const box = $("[data-profile-tabs]");
    tabs(box);
    const panes = $$("[data-ppane]");
    const go = (k) => { selectTab(box, "data-ptab", k, panes, "data-ppane"); history.replaceState(null, "", "#" + k); };
    $$("[data-ptab]", box).forEach((b) => b.addEventListener("click", () => go(b.dataset.ptab)));
    selectTab(box, "data-ptab", ["password", "security"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "details", panes, "data-ppane");
    const say = (form, ok, msg) => { const a = $("[data-alert]", form); a.hidden = false; a.className = "alert " + (ok ? "success" : "danger"); a.textContent = msg; if (ok) toast(msg.replace(/^Demo mode: /, "")); };
    f.addEventListener("submit", (e) => { e.preventDefault(); if (f.suiAddress.value && !/^0x[0-9a-fA-F]{64}$/.test(f.suiAddress.value.trim())) return say(f, false, "Enter a full Sui address: 0x followed by 64 hex characters."); say(f, true, d.demo ? "Demo mode: we would now email you a code to confirm." : "We sent a code to your email to confirm."); });
    const strong = (v) => v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v);
    // strength meter
    const meter = $("[data-strength-for]"), pin = $("#pw-new");
    pin.addEventListener("input", () => { const v = pin.value; let s = 0; if (v.length >= 8) s++; if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++; if (/\d/.test(v)) s++; if (v.length >= 12 || /[^A-Za-z0-9]/.test(v)) s++; if (!v) s = 0; $$(".bars span", meter).forEach((b, i) => b.classList.toggle("on", i < s)); meter.className = "strength s" + s; $("[data-strength-text]", meter).textContent = ["Use 8+ characters with upper and lower case letters and a number", "Weak", "Fair", "Good", "Strong"][s]; });
    $("#password-form").addEventListener("submit", (e) => { e.preventDefault(); const g = e.target; if (!g.current.value) return say(g, false, "Enter your current password."); if (!strong(g.next.value)) return say(g, false, "Use at least 8 characters with upper and lower case letters and a number."); if (g.next.value !== g.confirm.value) return say(g, false, "The new passwords do not match."); say(g, true, d.demo ? "Demo mode: your password was not changed." : "Password updated."); g.reset(); });
    $("#security-form").addEventListener("submit", (e) => { e.preventDefault(); const g = e.target; if (!/^\d{4,8}$/.test(g.next.value)) return say(g, false, "Use 4 to 8 digits for your security code."); if (g.next.value !== g.confirm.value) return say(g, false, "The security codes do not match."); say(g, true, d.demo ? "Demo mode: your security code was not changed." : "Security code updated."); g.reset(); });
  };

  /* ───────── Boot ───────── */
  function finishLoader() {
    const loader = $("[data-loader]");
    if (!loader) { document.dispatchEvent(new Event("dash:loaded")); return; }
    const wait = Math.max(0, 1700 - (performance.now() - T0));
    setTimeout(() => {
      loader.classList.add("done");
      document.body.classList.remove("is-loading");
      document.dispatchEvent(new Event("dash:loaded"));
      setTimeout(() => loader.remove(), 900);
    }, wait);
  }
  window.SuinanceData.load().then((d) => {
    if (d.signedOut) { location.replace("../login.html?next=dashboard/" + (location.pathname.split("/").pop() || "index.html")); return; }
    PRICE = d.price || PRICE;
    document.body.classList.toggle("is-demo", !!d.demo && !!C.showDemoFlag);
    const name = String(d.me.name || "Member");
    $$("[data-me-name]").forEach((e) => (e.textContent = name));
    $$("[data-me-uid]").forEach((e) => (e.textContent = d.me.uid));
    $$("[data-me-initials]").forEach((e) => (e.textContent = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()));
    $$("[data-price]").forEach((e) => (e.textContent = usd(PRICE, 4)));
    const h = new Date().getHours();
    $$("[data-greet]").forEach((e) => (e.textContent = h < 12 ? "Good morning," : h < 17 ? "Good afternoon," : "Good evening,"));
    const loader = $("[data-loader]");
    if (loader) { const n = $("[data-loader-name]", loader); n.textContent = "Welcome, " + name; requestAnimationFrame(() => n.classList.add("on")); }
    if (R[page]) R[page](d);
    // The network map can also sit inside other pages (e.g. the overview).
    if (page !== "network" && R.network && document.querySelector("[data-nm-view]")) R.network(d);
    animateIn();
    finishLoader();
  }).catch((err) => {
    finishLoader();
    console.error(err);
    $$("[data-table], [data-stats], [data-stats-income]").forEach((e) => (e.innerHTML = '<p class="d-empty">We could not load your dashboard. Please refresh the page.</p>'));
  });
})();
