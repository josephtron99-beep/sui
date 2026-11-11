/* Suinance · account and application forms. They talk to the Suinance API (see config.js). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cfg = window.SUINANCE_CONFIG || {};
  const API = cfg.api || "";
  const params = new URLSearchParams(location.search);
  const OFFLINE = "The account service is not reachable from this page. Please try again in a moment.";

  async function post(path, body) {
    try {
      const res = await fetch(API + path, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404 || res.status === 405) return { ok: false, message: OFFLINE };
      return Object.assign({ status: res.status }, data);
    } catch (e) {
      return { ok: false, message: OFFLINE };
    }
  }

  /* Field helpers */
  function clearErrors(form) {
    $$(".error[data-for]", form).forEach((e) => e.remove());
    $$("[aria-invalid]", form).forEach((e) => e.removeAttribute("aria-invalid"));
    const a = $("[data-alert]", form);
    if (a) { a.hidden = true; a.textContent = ""; }
  }
  function showErrors(form, fields, message) {
    Object.entries(fields || {}).forEach(([k, msg]) => {
      const input = form.elements[k];
      const field = input && (input.closest ? input.closest(".field, .check") : null);
      if (!field) return;
      if (input.setAttribute) input.setAttribute("aria-invalid", "true");
      const p = document.createElement("p");
      p.className = "error";
      p.dataset.for = k;
      p.id = k + "-error";
      p.setAttribute("role", "alert");
      p.textContent = msg;
      field.appendChild(p);
      if (input.setAttribute) input.setAttribute("aria-describedby", p.id);
      const hint = $(".hint", field);
      if (hint) hint.hidden = true;
    });
    const a = $("[data-alert]", form);
    if (a && message) { a.hidden = false; a.textContent = message; }
    const first = $("[aria-invalid=true]", form);
    if (first && first.focus) first.focus();
  }
  function busy(form, on) {
    const b = $("button[type=submit]", form);
    if (!b) return;
    b.disabled = on;
    if (on) { b.dataset.label = b.innerHTML; b.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + b.textContent; }
    else if (b.dataset.label) b.innerHTML = b.dataset.label;
  }
  function values(form) {
    const o = {};
    $$("input, select, textarea", form).forEach((el) => {
      if (!el.name) return;
      o[el.name] = el.type === "checkbox" ? el.checked : el.value;
    });
    return o;
  }
  function on(id, handler) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(form);
      busy(form, true);
      try { await handler(form, values(form)); } finally { busy(form, false); }
    });
    return form;
  }
  const safeNext = (n) => (n && /^[a-z0-9-]+\.html(#[a-z-]+)?$/i.test(n) ? n : "account.html");
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  /* Password strength meter */
  $$("[data-strength-for]").forEach((meter) => {
    const input = document.getElementById(meter.dataset.strengthFor);
    const text = $("[data-strength-text]", meter);
    const bars = $$(".bars span", meter);
    const labels = ["Use 8+ characters with upper and lower case letters and a number", "Weak", "Fair", "Good", "Strong"];
    input.addEventListener("input", () => {
      const v = input.value;
      let s = 0;
      if (v.length >= 8) s++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (v.length >= 12 || /[^A-Za-z0-9]/.test(v)) s++;
      if (!v) s = 0;
      bars.forEach((b, i) => b.classList.toggle("on", i < s));
      meter.className = "strength s" + s;
      text.textContent = labels[s];
    });
  });

  /* OTP boxes: typing, paste, backspace */
  $$("[data-otp]").forEach((box) => {
    const inputs = $$("input", box);
    const hidden = document.getElementById(box.dataset.otp);
    const sync = () => (hidden.value = inputs.map((i) => i.value).join(""));
    inputs.forEach((inp, i) => {
      inp.addEventListener("keydown", (e) => {
        if (/^\d$/.test(e.key)) { e.preventDefault(); inp.value = e.key; sync(); if (inputs[i + 1]) inputs[i + 1].focus(); else if (hidden.value.length === 6) box.closest("form").requestSubmit(); }
        else if (e.key === "Backspace") { e.preventDefault(); if (inp.value) inp.value = ""; else if (inputs[i - 1]) { inputs[i - 1].value = ""; inputs[i - 1].focus(); } sync(); }
        else if (e.key === "ArrowLeft" && inputs[i - 1]) inputs[i - 1].focus();
        else if (e.key === "ArrowRight" && inputs[i + 1]) inputs[i + 1].focus();
      });
      inp.addEventListener("input", () => {
        const digits = inp.value.replace(/\D/g, "");
        if (digits.length > 1) {
          // A whole code arrived at once (autofill or fast typing): spread it from this box on.
          for (let k = 0; k < digits.length && i + k < inputs.length; k++) inputs[i + k].value = digits[k];
          sync();
          const next = inputs[Math.min(i + digits.length, inputs.length - 1)];
          next.focus();
          if (hidden.value.length === 6) box.closest("form").requestSubmit();
          return;
        }
        inp.value = digits;
        sync();
        if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
        if (hidden.value.length === 6) box.closest("form").requestSubmit();
      });
      inp.addEventListener("paste", (e) => {
        const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
        if (!d) return;
        e.preventDefault();
        inputs.forEach((x, j) => (x.value = d[j] || ""));
        sync();
        (inputs[Math.min(d.length, 5)]).focus();
      });
    });
  });

  /* Prefill email fields from the URL */
  $$("input[name=email][data-from-url]").forEach((i) => (i.value = params.get("email") || ""));
  $$("[data-email-text]").forEach((e) => (e.textContent = params.get("email") || "your email"));

  /* Login */
  if (params.get("reset")) { const a = $("[data-notice]"); if (a) { a.hidden = false; a.textContent = "Your password was updated. Log in with your new password."; } }
  on("login-form", async (form, v) => {
    if (!emailOk(v.email)) return showErrors(form, { email: "Enter a valid email address" }, "Please check the highlighted fields.");
    if (!v.password) return showErrors(form, { password: "Enter your password" }, "Please check the highlighted fields.");
    const r = await post("/api/auth/login", { email: v.email, password: v.password });
    if (r.ok) return location.replace(safeNext(params.get("next")));
    if (r.needsVerification) return (location.href = `verify-email.html?email=${encodeURIComponent(r.email || v.email)}&sent=1`);
    showErrors(form, r.fields, r.message || "Could not log in.");
  });

  /* Register */
  const country = $("#country");
  if (country) {
    const sel = () => { const o = country.selectedOptions[0]; $("#dial").textContent = o && o.dataset.dial ? "+" + o.dataset.dial : "+"; };
    const ref = params.get("ref");
    if (ref) $("#referralCode").value = ref.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    try {
      const guess = (navigator.language || "").split("-")[1];
      if (guess && $(`option[value="${guess}"]`, country)) country.value = guess;
    } catch (e) {}
    country.addEventListener("change", sel);
    sel();
    $("#phone").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/[^\d\s-]/g, "")));
    $("#referralCode").addEventListener("input", (e) => (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")));
  }
  on("register-form", async (form, v) => {
    const f = {};
    if (v.name.trim().length < 2) f.name = "Enter your full name";
    else if (/[<>{}\[\]\/=;:@#$%^*|~`"]/.test(v.name)) f.name = "Use letters, spaces, hyphens and apostrophes only";
    if (!emailOk(v.email)) f.email = "Enter a valid email address";
    if (!v.country) f.country = "Choose your country";
    if (v.phone.replace(/\D/g, "").length < 4) f.phone = "Enter your mobile number";
    if (v.password.length < 8 || !/[a-z]/.test(v.password) || !/[A-Z]/.test(v.password) || !/\d/.test(v.password)) f.password = "Use at least 8 characters with upper and lower case letters and a number";
    if (!v.acceptTerms) f.acceptTerms = "Please accept the terms to continue";
    if (Object.keys(f).length) return showErrors(form, f, "Please check the highlighted fields.");
    const r = await post("/api/auth/register", v);
    if (r.ok) return (location.href = `verify-email.html?email=${encodeURIComponent(r.email || v.email)}&sent=1`);
    showErrors(form, r.fields, r.message || "Could not create your account.");
  });

  /* Verify email */
  on("verify-form", async (form, v) => {
    if (!emailOk(v.email)) return showErrors(form, { email: "Enter a valid email address" }, "Please check the highlighted fields.");
    if (!/^\d{6}$/.test(v.code)) return showErrors(form, { code: "Enter the 6-digit code" }, "Enter the 6-digit code from the email.");
    const r = await post("/api/auth/verify-email", { email: v.email, code: v.code });
    if (r.ok) return location.replace("account.html?welcome=1");
    showErrors(form, r.fields, r.message || "That code did not work.");
  });

  /* Resend code with cooldown */
  $$("[data-resend]").forEach((b) => {
    let left = params.get("sent") ? 60 : 0;
    const label = b.textContent;
    const tick = () => {
      b.disabled = left > 0;
      b.textContent = left > 0 ? `Resend code in ${left}s` : label;
      if (left > 0) { left--; setTimeout(tick, 1000); }
    };
    tick();
    b.addEventListener("click", async () => {
      const form = b.closest("form");
      const email = form.elements.email.value;
      if (!emailOk(email)) return showErrors(form, { email: "Enter a valid email address" }, "Enter your email first.");
      const r = await post("/api/auth/resend-otp", { email, purpose: b.dataset.resend });
      const a = $("[data-alert]", form);
      if (r.ok) { a.hidden = false; a.className = "alert success"; a.textContent = "A new code is on its way."; left = 60; tick(); }
      else { a.hidden = false; a.className = "alert danger"; a.textContent = r.message || "Could not send a new code."; }
    });
  });

  /* Forgot / reset password */
  on("forgot-form", async (form, v) => {
    if (!emailOk(v.email)) return showErrors(form, { email: "Enter a valid email address" }, "Please check the highlighted fields.");
    const r = await post("/api/auth/forgot-password", { email: v.email });
    if (r.ok) return (location.href = `reset-password.html?email=${encodeURIComponent(r.email || v.email)}&sent=1`);
    showErrors(form, r.fields, r.message || "Could not send a reset code.");
  });
  on("reset-form", async (form, v) => {
    const f = {};
    if (!emailOk(v.email)) f.email = "Enter a valid email address";
    if (!/^\d{6}$/.test(v.code)) f.code = "Enter the 6-digit code";
    if (v.password.length < 8 || !/[a-z]/.test(v.password) || !/[A-Z]/.test(v.password) || !/\d/.test(v.password)) f.password = "Use at least 8 characters with upper and lower case letters and a number";
    if (v.password !== v.confirm) f.confirm = "The passwords do not match";
    if (Object.keys(f).length) return showErrors(form, f, "Please check the highlighted fields.");
    const r = await post("/api/auth/reset-password", { email: v.email, code: v.code, password: v.password });
    if (r.ok) return location.replace("login.html?reset=1");
    showErrors(form, r.fields, r.message || "Could not reset your password.");
  });

  /* Program application */
  const applyBox = $("[data-apply]");
  if (applyBox) {
    fetch(API + "/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .catch(() => ({ user: null }))
      .then((d) => {
        $("[data-apply-loading]").hidden = true;
        if (d && d.user) $("[data-apply-form]").hidden = false;
        else $("[data-apply-login]").hidden = false;
      });
  }
  on("apply-form", async (form, v) => {
    const f = {};
    if (v.validatorName.trim().length < 2) f.validatorName = "Enter your validator's name";
    if (!/^0x[0-9a-f]{64}$/i.test(v.suiAddress.trim())) f.suiAddress = "Enter the full Sui address: 0x followed by 64 hex characters";
    if (v.commissionPct === "" || isNaN(Number(v.commissionPct)) || Number(v.commissionPct) < 0 || Number(v.commissionPct) > 100) f.commissionPct = "Enter a number from 0 to 100";
    if (v.hosting.trim().length < 2) f.hosting = "Tell us where the validator runs";
    if (v.website && !/^https:\/\/\S+\.\S+$/.test(v.website.trim())) f.website = "Enter a full link starting with https://";
    if (!v.confirm) f.confirm = "Please confirm you operate this validator";
    if (Object.keys(f).length) return showErrors(form, f, "Please check the highlighted fields.");
    const r = await post("/api/program/apply", Object.assign({}, v, { suiAddress: v.suiAddress.trim().toLowerCase() }));
    if (r.status === 401) return (location.href = "login.html?next=program.html%23apply");
    if (!r.ok) return showErrors(form, r.fields, r.message || "Could not send your application.");
    form.hidden = true;
    const done = $("[data-apply-done]");
    $("[data-apply-done-text]", done).textContent = r.activeOnChain
      ? "We found your validator in the active set on Sui mainnet. The on-chain review has started, and we will email you when it is done."
      : "This address is not in Sui's active validator set yet. We have saved your application and will review it once the validator is active.";
    done.hidden = false;
    done.focus();
  });
  $$("[data-apply-again]").forEach((b) => b.addEventListener("click", () => {
    const form = $("#apply-form");
    form.reset();
    form.hidden = false;
    $("[data-apply-done]").hidden = true;
  }));

  /* Account page */
  const acct = $("[data-account]");
  if (acct) {
    fetch(API + "/api/account", { credentials: "include", cache: "no-store" })
      .then((r) => (r.status === 401 ? null : r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!d || !d.user) return location.replace("login.html?next=account.html");
        const u = d.user;
        const first = u.name.split(" ")[0];
        const welcome = params.get("welcome");
        $("[data-acct-eyebrow]").textContent = welcome ? "Account created" : "My account";
        $("[data-acct-title]").textContent = (welcome ? "Welcome, " : "Hi, ") + first;
        $("[data-acct-desc]").textContent = welcome ? "Your email is verified and your account is ready. Apply with your validator to join the program." : "Your profile, referral details and program applications.";
        let country = u.country;
        try { country = new Intl.DisplayNames(["en"], { type: "region" }).of(u.country) || u.country; } catch (e) {}
        const rows = [["Name", u.name], ["Email", u.email], ["Mobile", u.phone], ["Country", country], ["Member since", new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })]];
        const dl = $("[data-acct-profile]");
        dl.innerHTML = "";
        rows.forEach(([k, val]) => {
          const div = document.createElement("div");
          div.style.cssText = "display:grid;gap:2px;padding-bottom:12px;border-bottom:1px solid var(--line)";
          const dt = document.createElement("dt"); dt.className = "muted"; dt.style.fontSize = "13px"; dt.textContent = k;
          const dd = document.createElement("dd"); dd.style.cssText = "margin:0;font-weight:500;overflow-wrap:anywhere"; dd.textContent = val;
          div.append(dt, dd); dl.appendChild(div);
        });
        const link = location.origin + location.pathname.replace(/[^/]*$/, "") + "register.html?ref=" + u.referralCode;
        $("[data-acct-code]").textContent = u.referralCode;
        $("[data-acct-link]").textContent = link;
        $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
          const text = b.dataset.copy === "code" ? u.referralCode : link;
          try { await navigator.clipboard.writeText(text); b.textContent = "Copied"; setTimeout(() => (b.textContent = b.dataset.label), 1600); } catch (e) {}
        }));
        const apps = d.applications || [];
        $("[data-acct-apply]").textContent = apps.length ? "Apply with another validator" : "Apply to the program";
        if (apps.length) {
          const box = $("[data-acct-apps]");
          box.hidden = false;
          const ul = $("ul", box);
          const label = { in_review: ["In review", "yellow"], approved: ["Member", "success"], declined: ["Not approved", "danger"] };
          apps.forEach((a) => {
            const li = document.createElement("li");
            li.style.cssText = "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--line);border-radius:12px";
            const s = label[a.status] || [a.status, "neutral"];
            const left = document.createElement("span");
            const n = document.createElement("strong"); n.textContent = a.validatorName;
            const m = document.createElement("small"); m.className = "mono muted"; m.style.display = "block";
            m.textContent = `${a.suiAddress.slice(0, 6)}…${a.suiAddress.slice(-4)} · ${a.activeOnChain ? "active on mainnet" : "not in the active set yet"}`;
            left.append(n, m);
            const b = document.createElement("span"); b.className = "badge " + s[1]; b.textContent = s[0];
            li.append(left, b); ul.appendChild(li);
          });
        }
        $("[data-acct-loading]").hidden = true;
        acct.hidden = false;
      })
      .catch(() => {
        $("[data-acct-loading]").textContent = OFFLINE;
      });
  }
  $$("[data-logout]").forEach((b) => b.addEventListener("click", async () => {
    await post("/api/auth/logout", {});
    location.replace("index.html");
  }));
})();
