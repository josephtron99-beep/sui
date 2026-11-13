/* Suinance dashboard · Network map
   Your referral tree as a branching bubble map: you → your directs → their directs …
   Click a member to open their branch and see their details in the side panel. */
(function () {
  "use strict";
  const H = window.SuinanceDash;
  if (!H) return;
  const { esc, usd, num, date } = H;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ic = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  // Geometry
  const HUB_X = 150, COL1_X = 330, COL_GAP = 318, NODE_W = 252, NODE_H = 62, ROW = 76, PAD = 56;
  const PKG_COLORS = { Free: "#5d7171", Tropo: "#a0d0d0", Starto: "#70a0a0", Meso: "#c0b0f0", Finance: "#dccb9f", Exo: "#e2d3a8" };
  const LIMIT = 6; // members shown per branch before "View more"
  // Ring of glowing particles around the hub orb (like the reference video)
  const PARTICLES = (() => {
    let s = 7, out = "";
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 140; i++) {
      const a = (i / 140) * Math.PI * 2 + r() * 0.05, rad = 52 + r() * 24, size = 0.6 + r() * 1.6;
      const hue = r() < 0.55 ? "#c0b0f0" : r() < 0.6 ? "#a0d0d0" : "#ffffff";
      out += `<circle cx="${(100 + Math.cos(a) * rad).toFixed(1)}" cy="${(100 + Math.sin(a) * rad).toFixed(1)}" r="${size.toFixed(2)}" fill="${hue}" opacity="${(0.25 + r() * 0.75).toFixed(2)}" style="--tw:${(1.5 + r() * 3).toFixed(1)}s;--td:${(r() * 3).toFixed(1)}s"/>`;
    }
    return `<svg class="nm-particles" viewBox="0 0 200 200" aria-hidden="true">${out}</svg>`;
  })();
  const initials = (n) => String(n).split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  H.R.network = (d) => {
    const root = d.network;
    // index + parents + team sizes
    const byId = {}, parent = {};
    (function walk(n, p) { byId[n.uid] = n; if (p) parent[n.uid] = p; n.children.forEach((c) => walk(c, n)); })(root, null);
    (function size(n) { n.team = n.children.reduce((s, c) => s + 1 + size(c), 0); return n.team; })(root);
    const total = root.team;
    const activeCount = Object.values(byId).filter((n) => n.active && !n.isRoot).length;

    const view = $("[data-nm-view]"), zoomEl = $("[data-nm-zoom]"), stage = $("[data-nm-stage]"), pathEl = $("[data-nm-path]");
    const panel = $("[data-nm-panel]"), scrim = $("[data-nm-scrim]");
    $("[data-nm-total]").textContent = total;
    $("[data-nm-active]").textContent = activeCount;
    $("[data-nm-legend]").innerHTML = Object.entries(PKG_COLORS).map(([k, c]) => `<span><i style="background:${c}"></i>${k}</span>`).join("");

    let path = [root];          // selected chain
    let selected = root;        // shown in the panel
    let scale = 1;
    const shown = new Map(); // parent uid → how many children are visible
    const visibleOf = (n) => Math.min(n.children.length, shown.get(n.uid) || LIMIT);

    function columns() {
      const cols = [];
      for (let k = 0; k < path.length; k++) {
        const kids = path[k].children;
        if (!kids.length) break;
        const next = path[k + 1];
        if (next) { const idx = kids.indexOf(next); if (idx >= visibleOf(path[k])) shown.set(path[k].uid, Math.ceil((idx + 1) / LIMIT) * LIMIT); }
        const vis = visibleOf(path[k]);
        cols.push({ parent: path[k], nodes: kids.slice(0, vis), hidden: kids.length - vis });
      }
      return cols;
    }

    function layout() {
      const cols = columns();
      const tallest = Math.max(1, ...cols.map((c) => c.nodes.length + (c.hidden ? 1 : 0)));
      const Hh = Math.max(view.clientHeight - 20, tallest * ROW + PAD * 2, 420);
      const W = COL1_X + cols.length * COL_GAP + 40;
      const pos = new Map();
      pos.set(root.uid, { x: HUB_X, y: Hh / 2, hub: true });
      cols.forEach((c, k) => {
        const p = pos.get(c.parent.uid);
        const h = (c.nodes.length + (c.hidden ? 1 : 0)) * ROW - (ROW - NODE_H);
        let top = p.y - h / 2;
        top = Math.max(PAD, Math.min(top, Hh - PAD - h));
        c.nodes.forEach((n, i) => pos.set(n.uid, { x: COL1_X + k * COL_GAP, y: top + i * ROW + NODE_H / 2, k }));
        if (c.hidden) pos.set("more:" + c.parent.uid, { x: COL1_X + k * COL_GAP, y: top + c.nodes.length * ROW + NODE_H / 2, k });
      });
      return { cols, pos, W, Hh };
    }

    function render(animateFrom) {
      const { cols, pos, W, Hh } = layout();
      stage.style.width = W + "px";
      stage.style.height = Hh + "px";
      zoomEl.style.width = W * scale + "px";
      zoomEl.style.height = Hh * scale + "px";
      stage.style.transform = `scale(${scale})`;
      stage.style.transformOrigin = "0 0";
      const onSet = new Set(path.map((n) => n.uid));
      let lines = "", nodes = "";
      cols.forEach((c, k) => {
        const p = pos.get(c.parent.uid);
        const x1 = p.hub ? HUB_X + 105 : p.x + NODE_W, y1 = p.y;
        const fresh = animateFrom != null && k >= animateFrom;
        nodes += `<span class="nm-col-label" style="left:${COL1_X + k * COL_GAP}px;top:${Math.max(16, pos.get(c.nodes[0].uid).y - NODE_H / 2 - 26)}px">${k === 0 ? "Your directs" : "Directs of " + esc(c.parent.name.split(" ")[0])} · ${c.nodes.length + c.hidden}</span>`;
        c.nodes.forEach((n, i) => {
          const q = pos.get(n.uid);
          const x2 = q.x, y2 = q.y, mx = (x1 + x2) / 2;
          const on = onSet.has(n.uid);
          const delay = fresh ? 0.35 + Math.min(i * 0.09, 1.1) : 0;
          lines += `<path class="${on ? "on" : ""} ${fresh && !reduce ? "draw" : ""}" style="--delay:${delay}s" d="M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}"/>`;
          if (on && !reduce) lines += `<circle r="3.2"><animateMotion dur="2.4s" repeatCount="indefinite" path="M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}"/></circle>`;
          const cls = ["nm-node", selected === n ? "sel" : "", on && selected !== n ? "path" : "", n.active ? "" : "inactive"].join(" ");
          nodes += `<button type="button" class="${cls}" data-uid="${esc(n.uid)}" style="left:${x2}px;top:${y2 - NODE_H / 2}px;--delay:${fresh ? 0.55 + Math.min(i * 0.09, 1.1) : 0}s" aria-label="${esc(n.name)}, ID ${esc(n.uid)}, ${n.children.length} direct members">
            <span class="nm-av" style="background:${PKG_COLORS[n.package] || "#6b6b70"}">${esc(initials(n.name))}</span>
            <span class="nm-meta"><b>${esc(n.name)}</b><small>ID ${esc(n.uid)} · ${esc(n.package)}</small></span>
            <span class="nm-dir"><b>${n.children.length}</b><small>directs</small></span>
            ${n.children.length ? ic('<path d="m9 18 6-6-6-6"/>').replace("<svg ", '<svg class="chev" ') : ""}
          </button>`;
        });
        if (c.hidden) {
          const q = pos.get("more:" + c.parent.uid);
          const left = c.hidden;
          nodes += `<button type="button" class="nm-more" data-more="${esc(c.parent.uid)}" style="left:${q.x}px;top:${q.y - 20}px;--delay:${fresh ? Math.min(c.nodes.length * 0.035, 0.7) : 0}s">${ic('<path d="M12 5v14M5 12h14"/>')}View more <span class="n">+${left}</span></button>`;
        }
      });
      const hp = pos.get(root.uid);
      const hub = `<div class="nm-hub ${selected === root ? "sel" : ""}" data-uid="${esc(root.uid)}" role="button" tabindex="0" aria-label="You: ${esc(root.name)}" style="left:${hp.x}px;top:${hp.y}px"><span class="r1"></span>${PARTICLES}<span class="r3"></span>
        <span class="txt"><span class="nm-name">${esc(root.name)}</span><span class="nm-id">UID ${esc(root.uid)}</span></span><span class="orb"></span>
        <span class="chip"><b>${root.children.length}</b> directs · <b>${total}</b> team</span></div>`;
      stage.innerHTML = `<svg class="nm-lines" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}" aria-hidden="true">${lines}</svg>${hub}${nodes}`;
      $$(".nm-lines path.draw", stage).forEach((p) => p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1));
      $$("[data-uid]", stage).forEach((el) => {
        el.addEventListener("click", () => pick(byId[el.dataset.uid]));
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(byId[el.dataset.uid]); } });
      });
      $$("[data-more]", stage).forEach((b) => b.addEventListener("click", () => {
        const n = byId[b.dataset.more];
        shown.set(n.uid, visibleOf(n) + LIMIT);
        const k = path.indexOf(n);
        render(k + 1 > 0 ? k : null);
      }));
      renderPath();
      return pos;
    }

    function renderPath() {
      pathEl.innerHTML = '<span class="lbl">Path</span>' + path.map((n, i) => `${i ? '<span class="sep">›</span>' : ""}<button type="button" data-step="${i}" class="${n === selected ? "on" : ""}">${esc(n.isRoot ? "You" : n.name.split(" ")[0])} · ${esc(n.uid)}</button>`).join("");
      $$("[data-step]", pathEl).forEach((b) => b.addEventListener("click", () => pick(path[Number(b.dataset.step)])));
      pathEl.scrollLeft = pathEl.scrollWidth;
    }

    function chainTo(n) { const c = []; let cur = n; while (cur) { c.unshift(cur); cur = parent[cur.uid]; } return c; }

    function pick(n, opts = {}) {
      if (!n) return;
      const prevLen = path.length;
      path = chainTo(n);
      selected = n;
      const pos = render(n.children.length ? path.length - 1 : null);
      showPanel(n);
      // keep the clicked node / new branch in view
      const p = pos.get(n.uid);
      if (p) {
        const targetX = (p.hub ? p.x : p.x + NODE_W) * scale - view.clientWidth * 0.35;
        const targetY = p.y * scale - view.clientHeight / 2;
        view.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY), behavior: reduce || opts.instant ? "auto" : "smooth" });
      }
      if (opts.flash) { const el = $(`[data-uid="${CSS.escape(n.uid)}"]`, stage); if (el) el.classList.add("hit"); }
      void prevLen;
    }

    function showPanel(n) {
      const e = n.earnings || { total: 0, referral: 0, roi: 0, passive: 0 };
      const parts = [["ROI", e.roi, "#a0d0d0"], ["Referral", e.referral, "#dccb9f"], ["Passive", e.passive, "#9080c0"]];
      const tot = e.total || 1;
      const sponsor = parent[n.uid];
      // 30-day earnings histogram (deterministic per member so it does not jump between clicks)
      let seed = Number(n.uid) || 7;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      const daily = Array.from({ length: 32 }, (_, i) => (e.total / 300) * (0.35 + rnd() * 0.9) * (0.7 + i / 60));
      const maxD = Math.max(...daily, 1);
      const recent = daily.slice(-15).reduce((a, b) => a + b, 0), before = daily.slice(-30, -15).reduce((a, b) => a + b, 0);
      const change = before ? ((recent - before) / before) * 100 : 0;
      const refShare = e.total ? (e.referral / e.total) * 100 : 0;
      const activeDirects = n.children.filter((c) => c.active).length;
      const strongest = n.children.slice().sort((a, b) => b.team - a.team)[0];
      const insights = [];
      if (strongest && strongest.team) insights.push(`Strongest branch: <b>${esc(strongest.name)}</b> with ${strongest.children.length} directs and ${strongest.team} in their team.`);
      if (n.children.length) insights.push(`${activeDirects} of ${n.children.length} direct members are active${n.children.length - activeDirects ? `; ${n.children.length - activeDirects} have no package yet` : ""}.`);
      else insights.push("No direct members yet. Share the referral link to start this branch.");
      insights.push(`Referral earnings are ${refShare.toFixed(0)}% of this member's total.`);
      const tile = (icon, v, l) => `<div class="nm-tile"><span class="ti">${ic(icon)}</span><b>${v}</b><span>${l}</span></div>`;
      panel.innerHTML = `<button type="button" class="close" data-nm-close aria-label="Close details">${ic('<path d="M18 6 6 18M6 6l12 12"/>')}</button>
        <div class="nm-cat"><span class="ti">${ic(n.isRoot ? '<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z"/>' : '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>')}</span>${n.isRoot ? "Network owner" : "Team member"} · ${esc(n.package)} package</div>
        <div class="nm-title"><h3>${esc(n.name)}</h3><p>Member ID ${esc(n.uid)}${sponsor ? ` · sponsored by ${esc(sponsor.isRoot ? "you" : sponsor.name.split(" ")[0])}` : ""}</p></div>
        <div class="nm-status"><div><span class="d-status ${n.active ? "ok" : "bad"}">${n.active ? "Active" : "Inactive"}</span><p>Joined on <b>${date(n.joined)}</b></p></div>
          ${n.children.length ? `<button type="button" class="nm-explore" data-nm-open>Open branch ${ic('<path d="m9 18 6-6-6-6"/>')}</button>` : ""}</div>
        <div class="nm-rate"><div class="top"><span>Total earnings</span><span class="pill">${n.active ? "Earning" : "Paused"}</span></div>
          <div class="row"><div><span class="big">${usd(e.total)}</span><span class="chg ${change < 0 ? "down" : ""}">${change < 0 ? "▼" : "▲"} ${Math.abs(change).toFixed(0)}%<small>last 15 days</small></span></div>
          <svg class="hist" viewBox="0 0 160 44" aria-hidden="true">${daily.map((v, i) => `<rect x="${i * 5}" y="${44 - (v / maxD) * 40}" width="2.6" height="${(v / maxD) * 40}" rx="1.3" style="--i:${i}"/>`).join("")}</svg></div>
          <div class="bar">${parts.map(([, v, c]) => `<span data-w="${((v / tot) * 100).toFixed(2)}%" style="background:${c}"></span>`).join("")}</div>
          <div class="keys">${parts.map(([k, v, c]) => `<span><i style="background:${c}"></i>${k} ${usd(v)}</span>`).join("")}</div></div>
        <div class="nm-tiles">
          ${tile('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>', n.children.length, "Direct<br>members")}
          ${tile('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>', n.team, "Team<br>size")}
          ${tile('<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', usd(e.referral, 0), "Referral<br>earnings")}
          ${tile('<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>', usd(e.roi, 0), "ROI<br>earnings")}
          ${tile('<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5"/>', usd(e.passive, 0), "Passive<br>earnings")}
          ${tile('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>', usd(n.investUsd, 0), "Package<br>value")}
        </div>
        <div class="nm-insight"><div class="h">${ic('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>')}Team insight</div><ul>${insights.map((t) => `<li>${t}</li>`).join("")}</ul></div>
        ${sponsor ? `<button type="button" class="nm-up" data-nm-up>${ic('<path d="m15 18-6-6 6-6"/>')} Up to sponsor · ${esc(sponsor.isRoot ? "You" : sponsor.name)}</button>` : ""}`;
      panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
      requestAnimationFrame(() => $$("[data-w]", panel).forEach((b) => (b.style.width = b.dataset.w)));
      $("[data-nm-close]", panel).addEventListener("click", closeSheet);
      const open = $("[data-nm-open]", panel); if (open) open.addEventListener("click", () => { closeSheet(); pick(n); });
      const up = $("[data-nm-up]", panel); if (up) up.addEventListener("click", () => pick(sponsor));
      if (innerWidth < 1240 && n !== root) { panel.classList.add("is-open"); scrim.classList.add("is-open"); }
    }
    function closeSheet() { panel.classList.remove("is-open"); scrim.classList.remove("is-open"); }
    scrim.addEventListener("click", closeSheet);
    addEventListener("keydown", (e) => e.key === "Escape" && closeSheet());

    // Zoom
    const setScale = (s) => { scale = Math.min(1.6, Math.max(0.4, s)); render(null); };
    $("[data-nm-in]").addEventListener("click", () => setScale(scale + 0.15));
    $("[data-nm-out]").addEventListener("click", () => setScale(scale - 0.15));
    $("[data-nm-fit]").addEventListener("click", () => {
      const { W, Hh } = layout();
      setScale(Math.min(1, (view.clientWidth - 16) / W, (view.clientHeight - 16) / Hh));
      view.scrollTo({ left: 0, top: 0 });
    });
    $("[data-nm-home]").addEventListener("click", () => { scale = 1; pick(root); view.scrollTo({ left: 0, top: Math.max(0, layout().Hh / 2 - view.clientHeight / 2) }); });
    view.addEventListener("wheel", (e) => { if (!e.ctrlKey) return; e.preventDefault(); setScale(scale - Math.sign(e.deltaY) * 0.08); }, { passive: false });

    // Drag to pan
    let drag = null;
    view.addEventListener("pointerdown", (e) => { if (e.target.closest("[data-uid]") || e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop }; view.classList.add("dragging"); });
    addEventListener("pointermove", (e) => { if (!drag) return; view.scrollLeft = drag.l - (e.clientX - drag.x); view.scrollTop = drag.t - (e.clientY - drag.y); });
    addEventListener("pointerup", () => { drag = null; view.classList.remove("dragging"); });

    // Search by ID or name
    const form = $("[data-nm-search]");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("input", form).value.trim().toLowerCase();
      if (!q) return;
      const hit = byId[q] || Object.values(byId).find((n) => n.name.toLowerCase().includes(q));
      if (!hit) { H.toast(`No member matches "${q}"`); return; }
      pick(hit, { flash: true });
    });

    function start() {
      render(0);
      showPanel(root);
      view.scrollTop = Math.max(0, layout().Hh / 2 - view.clientHeight / 2);
    }
    // On the dashboard home a loader plays first; build the map once it lifts, like the reference video.
    if (document.querySelector("[data-loader]")) document.addEventListener("dash:loaded", start, { once: true });
    else start();
    addEventListener("resize", () => render(null));
  };
})();
