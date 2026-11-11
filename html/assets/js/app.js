/* Suinance · shared interactions (header, theme, menu, motion, widgets). No dependencies. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

  /* ── Theme ── */
  const root = document.documentElement;
  function currentTheme() {
    return root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  $$("[data-theme-toggle]").forEach((b) => {
    const label = () => b.setAttribute("aria-label", currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme");
    label();
    b.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("suinance-theme", next); } catch (e) {}
      $$("[data-theme-toggle]").forEach((x) => x.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme"));
      document.dispatchEvent(new CustomEvent("themechange"));
    });
  });

  /* ── Header: solid after scroll, hides on scroll down ── */
  const header = $(".site-header");
  const menu = $("#mobile-menu");
  const menuBtn = $("[data-menu-btn]");
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 12);
      const open = menu && menu.classList.contains("is-open");
      header.classList.toggle("is-hidden", y > 240 && y > lastY && !open);
    }
    lastY = y;
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    $(".i-menu", menuBtn).style.display = open ? "none" : "";
    $(".i-close", menuBtn).style.display = open ? "" : "none";
    root.style.overflow = open ? "hidden" : "";
    $$(".m-link", menu).forEach((a, i) => (a.style.transitionDelay = open ? 0.15 + i * 0.05 + "s" : "0s"));
    if (open) setTimeout(() => { const a = $("a", menu); if (a) a.focus(); }, 350);
  }
  if (menuBtn) menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu && menu.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
  if (menu) $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ── Reveal on scroll ── */
  const io = "IntersectionObserver" in window && !reduce
    ? new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" })
    : null;
  window.SuinanceReveal = function (scope) {
    $$("[data-reveal]", scope || document).forEach((el) => (io ? io.observe(el) : el.classList.add("is-in")));
  };
  window.SuinanceReveal();

  /* ── Count up ── */
  window.SuinanceCount = function (el, value, opts) {
    opts = opts || {};
    const decimals = opts.decimals || 0;
    const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + (opts.suffix || "");
    if (reduce) { el.textContent = fmt(value); return; }
    const start = performance.now();
    const dur = 1400;
    (function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(value * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  };

  /* ── Tilt cards ── */
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    $$("[data-tilt]").forEach((el) => {
      el.classList.add("tilt");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ── 3D coin follows the pointer ── */
  $$("[data-coin]").forEach((stage) => {
    const coin = $(".coin", stage);
    if (reduce || !coin) return;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.classList.add("is-tilting");
      coin.style.transform = `rotateY(${x * 70}deg) rotateX(${8 - y * 40}deg)`;
    });
    stage.addEventListener("pointerleave", () => { stage.classList.remove("is-tilting"); coin.style.transform = ""; });
  });

  /* ── Steps: progress line follows the scroll ── */
  const steps = $$(".steps");
  if (steps.length) {
    const upd = () => steps.forEach((s) => {
      const r = s.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.2)));
      s.style.setProperty("--p", p.toFixed(3));
    });
    addEventListener("scroll", upd, { passive: true });
    upd();
  }

  /* ── Password visibility ── */
  $$("[data-pw-toggle]").forEach((b) => {
    b.addEventListener("click", () => {
      const input = b.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      b.setAttribute("aria-label", show ? "Hide password" : "Show password");
      b.setAttribute("aria-pressed", String(show));
    });
  });

  /* ── Ecosystem filter ── */
  $$("[data-filter-group]").forEach((group) => {
    const cards = $$("[data-cat]", document);
    $$("button", group).forEach((b) =>
      b.addEventListener("click", () => {
        $$("button", group).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        const cat = b.dataset.value;
        cards.forEach((c) => c.classList.toggle("is-hidden", cat !== "All" && c.dataset.cat !== cat));
      }),
    );
  });

  /* ── Learn: account vs object model ── */
  $$("[data-model]").forEach((box) => {
    const lanes = $(".lanes", box);
    const text = $("[data-model-text]", box);
    const render = (mode) => {
      const count = mode === "acct" ? 1 : 4;
      const per = mode === "acct" ? 8 : 2;
      lanes.innerHTML = "";
      for (let l = 0; l < count; l++) {
        const lane = document.createElement("div");
        lane.className = "lane" + (mode === "acct" ? " acct" : "");
        for (let i = 0; i < per; i++) {
          const b = document.createElement("i");
          b.style.setProperty("--d", (mode === "acct" ? 8 : 2.4) + "s");
          b.style.setProperty("--delay", (mode === "acct" ? i : i * 1.2 + l * 0.2) + "s");
          lane.appendChild(b);
        }
        lanes.appendChild(lane);
      }
      text.textContent = mode === "acct"
        ? "Account model: every transaction waits in one queue, even when two of them have nothing to do with each other."
        : "Object model: transactions that touch different objects run side by side, so the network can process far more at once.";
    };
    $$("[role=radio]", box).forEach((b) => b.addEventListener("click", () => {
      $$("[role=radio]", box).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      render(b.dataset.mode);
    }));
    render("obj");
  });

  /* ── Learn: Mysticeti DAG stepper ── */
  $$("[data-dag]").forEach((box) => {
    const V = 4, R = 5;
    const msgs = [
      "Press “Next round” to watch validators propose blocks.",
      "Round 1: each validator proposes a block of transactions.",
      "Round 2: new blocks link back to blocks from round 1. Together the links form a graph (a DAG).",
      "Round 3: once enough validators link to the round 1 leader, it and its history are committed. No extra voting messages are needed.",
      "Round 4: commits keep following about two rounds behind the newest blocks.",
      "Round 5: the graph keeps growing while earlier rounds are finalised, which is how Mysticeti reaches sub-second finality.",
    ];
    const svg = $(".scroll svg", box);
    const msg = $("[data-dag-msg]", box);
    const ns = "http://www.w3.org/2000/svg";
    const pos = (r, v) => [70 + r * 120, 34 + v * 50];
    let round = 2;
    function draw() {
      svg.innerHTML = "";
      for (let v = 0; v < V; v++) { const t = document.createElementNS(ns, "text"); t.setAttribute("x", 8); t.setAttribute("y", 38 + v * 50); t.textContent = "V" + (v + 1); svg.appendChild(t); }
      for (let r = 0; r < R; r++) { const t = document.createElementNS(ns, "text"); t.setAttribute("x", pos(r, 0)[0]); t.setAttribute("y", 222); t.setAttribute("text-anchor", "middle"); t.textContent = "Round " + (r + 1); svg.appendChild(t); }
      for (let r = 1; r < round; r++) for (let v = 0; v < V; v++) for (let p = 0; p < V; p++) {
        if ((v + p + r) % 4 === 3) continue;
        const [x1, y1] = pos(r - 1, p), [x2, y2] = pos(r, v);
        const l = document.createElementNS(ns, "line");
        l.setAttribute("x1", x1 + 14); l.setAttribute("y1", y1); l.setAttribute("x2", x2 - 14); l.setAttribute("y2", y2);
        svg.appendChild(l);
      }
      for (let r = 0; r < round; r++) for (let v = 0; v < V; v++) {
        const [x, y] = pos(r, v);
        const leader = r % 2 === 0 && v === r % V;
        const committed = r <= round - 3;
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", x - 14); rect.setAttribute("y", y - 11); rect.setAttribute("width", 28); rect.setAttribute("height", 22); rect.setAttribute("rx", 5);
        rect.setAttribute("class", committed ? "done" : leader ? "leader" : "on");
        svg.appendChild(rect);
      }
      svg.setAttribute("aria-label", `Validators proposing blocks, round ${round} of ${R}`);
      msg.textContent = msgs[round];
    }
    $("[data-dag-next]", box).addEventListener("click", () => { round = round >= R ? 1 : round + 1; draw(); });
    $("[data-dag-reset]", box).addEventListener("click", () => { round = 0; draw(); });
    draw();
  });

  /* ── Learn: tokenomics donut ── */
  $$("[data-donut]").forEach((box) => {
    const paths = $$("path", box);
    const items = $$(".legend button", box);
    const note = $("[data-donut-note]", box);
    const select = (i) => {
      paths.forEach((p, j) => { p.classList.toggle("active", j === i); p.classList.toggle("dim", j !== i); });
      items.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
      note.textContent = items[i].dataset.note;
    };
    paths.forEach((p, i) => p.addEventListener("click", () => select(i)));
    items.forEach((b, i) => b.addEventListener("click", () => select(i)));
    select(0);
  });

  /* ── Learn: use-case tabs and tech cards ── */
  $$("[data-tabs]").forEach((box) => {
    const tabs = $$("[role=tab]", box);
    const panels = $$("[role=tabpanel]", box);
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((x, j) => { x.setAttribute("aria-selected", String(i === j)); x.setAttribute("aria-pressed", String(i === j)); x.tabIndex = i === j ? 0 : -1; });
      panels.forEach((p, j) => (p.hidden = i !== j));
    }));
  });
  $$(".tech-card").forEach((c) => c.addEventListener("click", () => c.setAttribute("aria-expanded", String(c.getAttribute("aria-expanded") !== "true"))));

  /* ── Network sphere (canvas) ── */
  $$("canvas[data-network]").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    const N = 110;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r, hot: i % 5 === 0 };
    });
    const edges = [];
    pts.forEach((a, i) => pts.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.36) edges.push([i, j]); }));
    let rotY = 0, rotX = 0.35, targetX = 0.35, targetY = 0, visible = true;
    const css = () => getComputedStyle(document.documentElement);
    let ink = "#111", yellow = "#ffd400";
    const readColors = () => { ink = css().getPropertyValue("--ink").trim() || "#111"; yellow = "#ffd400"; };
    readColors();
    document.addEventListener("themechange", readColors);
    new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      targetY = ((e.clientX - r.left) / r.width - 0.5) * 1.2;
      targetX = 0.35 + ((e.clientY - r.top) / r.height - 0.5) * 0.8;
    });
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);
    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!reduce) rotY += 0.0035;
      rotX += (targetX - rotX) * 0.05;
      const ry = rotY + targetY;
      const R = Math.min(w, h) * 0.38;
      const proj = pts.map((p) => {
        const x1 = p.x * Math.cos(ry) + p.z * Math.sin(ry);
        const z1 = -p.x * Math.sin(ry) + p.z * Math.cos(ry);
        const y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);
        const s = 1 / (1.9 - z2 * 0.6);
        return { x: w / 2 + x1 * R * s * 1.4, y: h / 2 + y2 * R * s * 1.4, z: z2, hot: p.hot };
      });
      ctx.lineWidth = 1;
      edges.forEach(([a, b]) => {
        const pa = proj[a], pb = proj[b];
        const depth = (pa.z + pb.z) / 2;
        ctx.globalAlpha = 0.08 + (depth + 1) * 0.12;
        ctx.strokeStyle = ink;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      });
      proj.slice().sort((a, b) => a.z - b.z).forEach((p) => {
        const size = (p.hot ? 5.5 : 3) * (0.7 + (p.z + 1) * 0.3);
        ctx.globalAlpha = 0.35 + (p.z + 1) * 0.32;
        ctx.fillStyle = p.hot ? yellow : ink;
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill();
        if (p.hot) { ctx.strokeStyle = "#111"; ctx.lineWidth = 1.2; ctx.stroke(); }
      });
      ctx.globalAlpha = 1;
    }
    frame();
  });

  /* ── Signed-in state in the header ── */
  const cfg = window.SUINANCE_CONFIG || {};
  if (cfg.api !== null && $("[data-auth-slot]")) {
    fetch((cfg.api || "") + "/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (!d || !d.user) return;
        const first = String(d.user.name).split(" ")[0];
        $$("[data-auth-slot]").forEach((a) => { a.href = "account.html"; a.textContent = a.dataset.authSlot === "mobile" ? "My account" : first; });
      })
      .catch(() => {});
  }

  /* ── Year ── */
  $$("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));
})();
