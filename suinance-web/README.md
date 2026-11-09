# Suinance website

Multi-page Next.js site for Suinance: learn Sui, compare live validators, stake SUI from your own wallet, and create an account with email OTP verification.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Design system | Tailwind CSS v4 tokens in `src/app/globals.css` + components in `src/components/ui` |
| Motion & 3D | `motion` (scroll reveals, layout animations), `lenis` (smooth scroll), React Three Fiber + drei (3D logo coin, validator network) |
| Sui data | Sui GraphQL (`graphql.mainnet.sui.io`) for epoch, validators, rewards. Public JSON-RPC is deprecated. |
| Wallet & staking | `@mysten/dapp-kit-react` + `@mysten/sui` gRPC client. Native `request_add_stake` / `request_withdraw_stake`. |
| Auth | Email + password, 6-digit email OTP, JWT session cookie (`jose`), bcrypt, Drizzle ORM on Postgres |
| Email | Resend |

## Pages

`/` · `/learn` · `/stake` · `/validators` · `/ecosystem` · `/about` · `/faq` · `/risk-disclosure` · `/terms` · `/privacy`
Auth: `/login` · `/register` · `/verify-email` · `/forgot-password` · `/reset-password` · `/account`

## Run locally

```bash
npm install
npm run dev
```

No setup is needed for local development:
- Without `DATABASE_URL`, an embedded Postgres (PGlite) is created in `.pglite/`.
- Without `RESEND_API_KEY`, OTP codes are printed in the terminal (`[dev email] code: 123456`).

Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Deploy on Vercel

1. Push this folder to GitHub and import it in Vercel (framework: Next.js; set **Root Directory** to `suinance-web` if the repo contains the parent folder).
2. Add a Postgres database: Vercel → Storage → **Neon** (or any Postgres). This sets `DATABASE_URL`.
3. Create the tables once, from your machine:
   ```bash
   DATABASE_URL="postgres://..." npm run db:push
   ```
4. Create a [Resend](https://resend.com) account, verify your sending domain, and create an API key.
5. In Vercel → Settings → Environment Variables, add the variables from `.env.example`:
   - `DATABASE_URL`, `SESSION_SECRET` (32+ random characters), `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`
   - optional: `NEXT_PUBLIC_SUPPORT_EMAIL`, social links, custom Sui endpoints
6. Deploy. The register page uses Vercel's `x-vercel-ip-country` header to pre-select the visitor's country.

## Things to fill in

- **Partner validators:** add their Sui addresses to `src/config/validators.ts`. Until then the site shows the full live validator set and labels no one as a partner.
- **Contact & socials:** set the `NEXT_PUBLIC_*` variables. Empty values are hidden.
- **Legal pages:** `terms`, `privacy` and `risk-disclosure` describe how this build actually works, but have them reviewed by a lawyer for your jurisdiction before launch.

## Security notes

- Passwords: bcrypt (cost 12). OTPs: SHA-256 hashed, 10-minute expiry, 5 attempts, 60-second resend cooldown, single use.
- Login lockout: 15 minutes after 5 failed attempts. Password reset signs out all existing sessions.
- Forgot-password and resend endpoints give the same answer whether or not an email exists.
- The per-IP rate limiter is in memory (best effort on serverless). For stronger protection, add Vercel WAF rate-limit rules or Upstash Redis.
