/* Suinance dashboard · settings + data source.
 *
 * demo: true  → the dashboard runs on generated sample data and shows a "Demo data" flag.
 * demo: false → data comes from  GET {api}/api/dashboard  (shape documented at the bottom).
 *
 * Every number a member sees (packages, rates, retention) is set HERE by the Suinance team.
 * Rewards are never guaranteed; the staking page says so on screen. */
window.SUINANCE_DASH = {
  demo: true,
  showDemoFlag: false, // true shows a "Demo data" label in the top bar while demo is on
  api: (window.SUINANCE_CONFIG && window.SUINANCE_CONFIG.api) || "",
  currency: "SUI",
  suiPriceFallbackUsd: 3.2,
  retentionPct: 10,
  adminChargePct: 10,
  withdrawMinSui: 5,
  withdrawFeeSui: 0.1,
  referralBase: "register.html?ref=",
  packages: [
    { id: "tropo", name: "Tropo", amountUsd: 100, dailyPct: 0.68, capX: 2.5 },
    { id: "starto", name: "Starto", amountUsd: 300, dailyPct: 0.85, capX: 2.5 },
    { id: "meso", name: "Meso", amountUsd: 900, dailyPct: 0.7, capX: 2.5 },
    { id: "finance", name: "Finance", amountUsd: 1800, dailyPct: 0.75, capX: 2.5 },
    { id: "exo", name: "Exo", amountUsd: 3000, dailyPct: 0.8, capX: 3.5, featured: true },
  ],
  incomes: [
    { key: "direct", name: "Direct income", note: "Paid when members you introduce activate a package." },
    { key: "roi", name: "ROI income", note: "Daily reward on your active stakes, at the package rate." },
    { key: "passive", name: "Passive income", note: "Share of rewards earned by your team, by level." },
    { key: "global", name: "Global income", note: "Share of the global pool, split among qualified members." },
    { key: "royalty", name: "Royalty income", note: "Paid to members who hold a royalty rank." },
    { key: "onetime", name: "One-time reward", note: "Paid once when you reach a team milestone." },
    { key: "performance", name: "Recurring performance bonus", note: "Paid each cycle while you keep the required team volume." },
  ],
};

(function () {
  "use strict";
  const C = window.SUINANCE_DASH;

  /* Seeded random so demo data stays the same between visits. */
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const r = rng(322455);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const int = (a, b) => Math.floor(r() * (b - a + 1)) + a;
  const first = ["Arun", "Priya", "Karthik", "Divya", "Suresh", "Meena", "Vijay", "Lakshmi", "Rahul", "Anita", "Ganesh", "Kavya", "Manoj", "Deepa", "Sanjay", "Revathi", "Ajith", "Nithya", "Prakash", "Sneha", "Bala", "Harini", "Ravi", "Pooja"];
  const last = ["Kumar", "S", "R", "Raj", "Devi", "M", "Nair", "Iyer", "Pillai", "K", "Babu", "Shankar"];
  const name = () => `${pick(first)} ${pick(last)}`;
  const uid = () => String(int(100000, 999999));
  const day = 864e5;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ago = (d) => new Date(today - d * day).toISOString();
  const hex = (n) => Array.from({ length: n }, () => "0123456789abcdef"[int(0, 15)]).join("");
  const pkgOf = () => (r() < 0.25 ? null : pick(C.packages));

  function demo() {
    const me = { name: "Karthik Raman", uid: "322455", email: "karthik.raman@example.com", phone: "+91 98765 43210", country: "IN", gender: "Male", referralCode: "SUI7K2Q9", joined: ago(420), suiAddress: "0x" + hex(64), security: true };
    const direct = Array.from({ length: 26 }, (_, i) => { const p = pkgOf(); return { uid: uid(), name: name(), joined: ago(int(1, 400)), side: r() < 0.55 ? "Left" : "Right", package: p ? p.name : "Free", investUsd: p ? p.amountUsd : 0, active: !!p }; })
      .sort((a, b) => b.joined.localeCompare(a.joined));
    const indirect = Array.from({ length: 142 }, () => { const p = pkgOf(); return { uid: uid(), name: name(), joined: ago(int(1, 400)), sponsor: pick(direct).uid, level: int(2, 15), package: p ? p.name : "Free", investUsd: p ? p.amountUsd : 0, active: !!p }; })
      .sort((a, b) => b.joined.localeCompare(a.joined));

    const stakes = [
      { id: "STK-1042", package: "Exo", amountUsd: 3000, start: ago(87), status: "Active" },
      { id: "STK-0981", package: "Meso", amountUsd: 900, start: ago(166), status: "Active" },
    ].map((s) => { const p = C.packages.find((x) => x.name === s.package); const days = Math.round((today - new Date(s.start)) / day); return Object.assign(s, { dailyPct: p.dailyPct, capUsd: s.amountUsd * p.capX, earnedUsd: +(s.amountUsd * p.dailyPct / 100 * days).toFixed(2), days }); });
    const unstakes = [{ id: "STK-0712", package: "Tropo", amountUsd: 100, start: ago(390), end: ago(22), returnedUsd: 100, rewardsUsd: 150, status: "Completed" }];

    const ledger = [];
    const add = (d, type, credit, debit, desc) => ledger.push({ date: ago(d), type, credit: +credit.toFixed(4), debit: +debit.toFixed(4), desc });
    add(170, "deposit", 1350, 0, "Deposit from 0x" + hex(4) + "…" + hex(4));
    add(166, "stake", 0, 990, "Stake · Meso package (incl. admin charge)");
    add(92, "deposit", 3400, 0, "Deposit from 0x" + hex(4) + "…" + hex(4));
    add(87, "stake", 0, 3300, "Stake · Exo package (incl. admin charge)");
    for (let d = 1; d <= 120; d++) {
      if (d <= 87) add(d, "roi", 3000 * 0.008, 0, "ROI income · STK-1042");
      if (d % 2 === 0) add(d, "passive", 20 + r() * 110, 0, `Passive income · level ${int(1, 8)}`);
      if (r() < 0.18) add(d, "direct", pick([5, 15, 30, 90, 180]), 0, `Direct income · from ${uid()}`);
      if (d % 7 === 0) add(d, "global", 8 + r() * 30, 0, "Global income · weekly pool");
      if (d % 30 === 0) add(d, "royalty", 60 + r() * 80, 0, "Royalty income · monthly");
      if (d % 14 === 0) add(d, "performance", 40, 0, "Recurring performance bonus");
    }
    add(64, "onetime", 250, 0, "One-time reward · 25 active directs");
    add(31, "withdraw", 0, 500, "Withdrawal to 0x" + hex(4) + "…" + hex(4));
    add(9, "withdraw", 0, 320, "Withdrawal to 0x" + hex(4) + "…" + hex(4));
    ledger.sort((a, b) => b.date.localeCompare(a.date));

    const tickets = [
      { id: "TKT-2291", subject: "Withdrawal not received yet", category: "Wallet", status: "Open", created: ago(1), updated: ago(0) },
      { id: "TKT-2176", subject: "Update my receiving address", category: "Profile", status: "Answered", created: ago(12), updated: ago(10) },
      { id: "TKT-1904", subject: "How is passive income calculated?", category: "Income", status: "Closed", created: ago(48), updated: ago(45) },
    ];

    // Binary tree (depth 4) from the member's own position
    const ranks = ["Free"].concat(C.packages.map((p) => p.name));
    let n = 0;
    function node(depth) {
      if (depth > 3) return null;
      if (depth > 0 && r() < 0.18) return { empty: true };
      n++;
      return { uid: n === 1 ? me.uid : uid(), name: n === 1 ? me.name : name(), rank: n === 1 ? "Exo" : pick(ranks), left: node(depth + 1), right: node(depth + 1) };
    }
    const tree = node(0);
    const leftBiz = 546250, rightBiz = 242870;
    return { me, direct, indirect, stakes, unstakes, ledger, tickets, tree, team: { leftBusinessUsd: leftBiz, rightBusinessUsd: rightBiz, todayLeftUsd: 0, todayRightUsd: 300 }, depositAddress: "0x" + hex(64) };
  }

  /* Price of SUI in USD for the ≈ conversions. */
  async function suiPrice() {
    try {
      const k = "suinance-sui-usd";
      const c = JSON.parse(sessionStorage.getItem(k) || "null");
      if (c && Date.now() - c.t < 10 * 60 * 1000) return c.v;
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd");
      const v = (await res.json()).sui.usd;
      sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v }));
      return v;
    } catch (e) { return C.suiPriceFallbackUsd; }
  }

  async function account() {
    try {
      const res = await fetch(C.api + "/api/account", { credentials: "include", cache: "no-store" });
      if (res.status === 401) return { signedOut: true };
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { return null; }
  }

  let cached = null;
  window.SuinanceData = {
    load() {
      if (cached) return cached;
      cached = Promise.all([account(), suiPrice()]).then(async ([acct, price]) => {
        if (!C.demo) {
          if (acct && acct.signedOut) return { signedOut: true };
          const res = await fetch(C.api + "/api/dashboard", { credentials: "include", cache: "no-store" });
          if (res.status === 401) return { signedOut: true };
          const d = await res.json();
          d.price = price;
          return d;
        }
        const d = demo();
        d.price = price;
        d.demo = true;
        if (acct && acct.user) {
          // Real account details on top of demo numbers
          d.me = Object.assign(d.me, { name: acct.user.name, email: acct.user.email, phone: acct.user.phone, country: acct.user.country, referralCode: acct.user.referralCode, joined: acct.user.createdAt });
          d.signedIn = true;
        }
        return d;
      });
      return cached;
    },
  };
})();

/* GET /api/dashboard response shape (for the backend team):
{
  me: { name, uid, email, phone, country, gender, referralCode, joined, suiAddress, security },
  direct:   [{ uid, name, joined, side: "Left"|"Right", package, investUsd, active }],
  indirect: [{ uid, name, joined, sponsor, level, package, investUsd, active }],
  stakes:   [{ id, package, amountUsd, start, status, dailyPct, capUsd, earnedUsd, days }],
  unstakes: [{ id, package, amountUsd, start, end, returnedUsd, rewardsUsd, status }],
  ledger:   [{ date, type: "deposit"|"withdraw"|"stake"|"unstake"|"direct"|"roi"|"passive"|"global"|"royalty"|"onetime"|"performance", credit, debit, desc }],   // amounts in USD
  tickets:  [{ id, subject, category, status, created, updated }],
  tree:     { uid, name, rank, left: {…}|{empty:true}|null, right: … },
  team:     { leftBusinessUsd, rightBusinessUsd, todayLeftUsd, todayRightUsd },
  depositAddress: "0x…"
} */
