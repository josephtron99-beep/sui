# Suinance Website: Full Audit

**Date:** 9 November 2026 · **Build audited:** `suinance-web` (Next.js 16), local dev and production build
**Method:** every page checked in **light + dark** theme at **375px (mobile)** and **1440px (desktop)**. The checks combined scripted DOM tests (contrast, tap targets, labels, headings, overflow, duplicate IDs), HTML/SEO parsing of every route, API attack tests with curl and the browser, and visual review.
**Review lenses:** UI/UX & design lead, content writer, SEO, frontend, backend, QA/tester.

---

## 1. Scorecard

| Area | Before | After fixes | Notes |
|---|---|---|---|
| Visual design / brand | 8.5 | **9.5** | Dark theme added. Yellow hard-shadows in dark mode keep the brand. |
| Responsive / mobile | 8 | **9.5** | 0px horizontal overflow on every page, both themes. |
| Accessibility (WCAG 2.2 AA) | 7 | **9** | Contrast passes in both themes. Tap targets ≥ 24px, heading order and focus handling fixed. |
| SEO | 6 | **9** | og:image restored, canonicals, per-page titles/descriptions, JSON-LD, manifest. |
| Content | 8 | **8.5** | Clear and honest. Two claims depend on information only you can provide (§6). |
| Frontend quality | 8.5 | **9.5** | 0 type errors, 0 lint errors, 0 hydration errors, clean build. |
| Backend / security | 8 | **9** | Origin checks, OTP hourly cap, stricter validation, image proxy closed. |
| Performance | 8 | 8 | 3D is lazy-loaded and pauses off-screen. No Lighthouse run yet (§7). |

---

## 2. Dark theme (new)

- **Toggle** in the header on every page (sun/moon, animated) and on the login/register screens. The choice is saved per browser; the first visit follows the OS setting.
- **No flash:** a tiny script in `<head>` applies the theme before first paint.
- **Design rules:**
  - Black panels (footer, tickers, table heads, code blocks) stay black in both themes.
  - Solid yellow surfaces always carry black text.
  - "Hard" shadows turn **yellow** in dark mode.
  - Glows are softened.
  - Light cards inside dark bands keep the light palette, so they stay readable.
- **3D scenes follow the theme:** the validator network lines and the orbiting coins switch to light colours in dark mode.
- Mobile browser bar colour (`theme-color`) is set for both themes.

---

## 3. Page-by-page results

Legend: ✅ pass · 🔧 found and fixed · ⚠️ open (needs your input or a later step)

### Home `/`
- ✅ One H1, logical headings, 0 overflow, live data correct (epoch 1306, 125 validators, 1.23%).
- 🔧 The "Use live rate" chip, rewards sliders and text links were smaller than the tap-target minimum. Enlarged.
- 🔧 Dark mode: the estimator card inside the black band had light-grey text on white. Fixed through palette scoping.
- 🔧 SEO title rewritten (60 chars) and description (154 chars). og:image restored.
- ⚠️ Copy says "a curated group of validators", but `PARTNER_VALIDATORS` is still empty, so the site currently shows the full network set (§6).

### Learn Sui `/learn`
- ✅ Interactive chapters work. The tabs use the correct ARIA pattern with arrow keys. Deep links (`/learn#consensus`) scroll correctly.
- 🔧 Earlier fix kept: donut chart rounding caused a hydration mismatch.
- ✅ Contrast passes in both themes. (The toggle-pill report is a false positive of the scanner: the pill is a sibling element.)

### Stake `/stake`
- ✅ Wallet list loads only in the browser (Slush detected). Stake/unstake builds native `request_add_stake` / `request_withdraw_stake`.
- 🔧 Heading order skipped from H1 to H3. "Connect a Sui wallet" and "My stakes" are now H2.
- ⚠️ A real mainnet stake and unstake has **not** been signed in testing. That needs your wallet and real SUI (§7).

### Validators `/validators`
- ✅ 125 validators live, search, sort, detail drawer, Suiscan links.
- 🔧 Sort buttons were 18px tall. Now ≥ 36px.
- 🔧 The drawer now returns keyboard focus to the row that opened it (Escape already closed it).

### Ecosystem `/ecosystem`
- 🔧 Missing H2 between the H1 and the project cards. Added "Projects on Sui" (screen-reader heading).
- 🔧 Orbit illustration hydration mismatch (percent rounding). Fixed.
- ✅ All 15 project links open in a new tab with `rel="noopener noreferrer"`.

### About `/about`
- 🔧 The title read "About Suinance · Suinance". Now "About Us · Suinance".
- ⚠️ No team, roadmap or "how Suinance earns" section yet. Content needed from you (§6).

### FAQ `/faq`
- 🔧 Added **FAQPage structured data** (eligible for Google FAQ rich results) and a hidden H2.

### Legal `/terms` `/privacy` `/risk-disclosure`
- ✅ Content matches how the product really works.
- ⚠️ Needs review by a lawyer for your jurisdiction before launch.

### Auth `/login` `/register` `/verify-email` `/forgot-password` `/reset-password` `/account`
- ✅ All `noindex`. Labels on every field. OTP boxes support paste, arrow keys and fast typing.
- 🔧 "Back to site" link enlarged. Theme toggle added.
- 🔧 Technical error text ("Too big: expected string…") replaced with plain messages.
- 🔧 Names containing HTML/script characters are now rejected.

### Global
- 🔧 Mobile menu: **Escape closes it** and focus moves into the menu when it opens.
- 🔧 Added a branded **error page** (`error.tsx`) and a **web app manifest**.
- 🔧 Header logo link tap area enlarged.

---

## 4. SEO details

| Check | Result |
|---|---|
| Unique `<title>` per page (≤ 60 chars) | ✅ All 13 public routes |
| Meta description 120–160 chars | ✅ All public pages (auth pages are noindex) |
| Self-referencing canonical | 🔧 Added per page. A root-level canonical would have pointed every page to `/`, so it was deliberately avoided. |
| Open Graph / Twitter image | 🔧 Was **missing on every page**. Now set everywhere (1200×630). |
| Structured data | 🔧 Organization + WebSite (all pages), FAQPage (`/faq`) |
| `robots.txt` / `sitemap.xml` | ✅ Private routes disallowed. 10 public URLs listed. |
| Images without `alt` | ✅ 0 |
| One H1 per page | ✅ All pages |
| Manifest / theme-color | 🔧 Added |

---

## 5. Backend & security tests (all run against the live dev server)

| Test | Result |
|---|---|
| 6 wrong passwords | ✅ 401 ×5, then **423 locked for 15 min**. The correct password is also refused while locked. |
| 20 rapid logins from one IP | ✅ 429 after the limit |
| Malformed JSON body | ✅ Rejected (422) |
| 300-character email | 🔧 Rejected, now with a friendly message |
| Invalid phone for the chosen country | ✅ Rejected |
| HTML in the name field | 🔧 Now rejected |
| Cross-site POST (`Origin: evil.example`) | 🔧 **Now rejected** (login 422, logout 403) |
| OTP brute force | ✅ 5 attempts per code. 🔧 **Added a cap of 5 codes per hour** per account (before, 60-second resends allowed ~7,000 guesses a day). |
| Reused reset code | ✅ Rejected |
| Password reset signs out old sessions | ✅ Verified |
| `/_next/image` open proxy | 🔧 `remotePatterns: "**"` removed. The proxy now returns 400. |
| Security headers | ✅ nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy. HSTS is added automatically by Vercel. |
| Session cookie | ✅ httpOnly, SameSite=Lax, Secure in production, 7-day expiry, versioned |

---

## 6. Content: what only you can supply

1. **Partner validator addresses** go in `src/config/validators.ts`. Until then, the words "curated group" are a promise the site can't show.
2. **How Suinance earns**: the most important trust item for a staking product (About page).
3. **Team, support email and social links**: hidden automatically while empty.
4. **Legal review** of the Terms, Privacy and Risk pages.
5. **Logo trademark check**: the hexagon-and-drop mark is close to Sui's own drop mark.

## 7. Not yet verified (recommended next)

- A real **mainnet stake and unstake** with your wallet (small amount, e.g. 1 SUI).
- **Lighthouse / Core Web Vitals** on the deployed Vercel URL. The 3D scenes are the main cost; they lazy-load and pause off-screen.
- **Real email delivery** through Resend with your domain (SPF/DKIM).
- **Cross-browser** pass on Safari iOS and Firefox. Testing so far was in Chromium.
- Optional hardening:
  - A Content-Security-Policy header.
  - Upstash/Vercel WAF rate limits (the current limiter is per server instance).
  - An explicit 403 instead of 422 for cross-origin auth posts.

---

**Final technical status:** TypeScript 0 errors · ESLint 0 errors / 0 warnings · production build ✅ (30 routes) · 0 console or hydration errors on audited pages · 0px horizontal overflow at 375px in both themes.
