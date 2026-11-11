# Suinance · static HTML edition

The full Suinance website as plain HTML, CSS and JavaScript. No build step and no framework.

## Pages
| File | Page |
|---|---|
| `index.html` | Home |
| `program.html` | Validator Program: benefits, criteria, eligibility checker, apply form, FAQ |
| `validators.html` | Live validator set, decentralisation stats, details drawer |
| `validator.html?address=0x…` | Scorecard for one validator |
| `learn.html` | Sui guide with interactive widgets |
| `ecosystem.html` | Sui projects with category filter |
| `about.html`, `faq.html` | About and FAQ |
| `terms.html`, `privacy.html`, `risk-disclosure.html` | Legal |
| `login.html`, `register.html`, `verify-email.html`, `forgot-password.html`, `reset-password.html`, `account.html` | Accounts |
| `404.html` | Not found |

## How it works
- **Design system:** `assets/css/styles.css` (tokens for light and dark themes, every component).
- **Interactions:** `assets/js/app.js` (theme, header, menu, reveal animations, 3D coin, network sphere, Learn widgets).
- **Live data:** `assets/js/sui.js` reads Sui mainnet GraphQL straight from the browser: validators, stake, commission, peer reports. Program checks run in the browser.
- **Accounts and applications:** `assets/js/forms.js` calls the Suinance API (`/api/auth/*`, `/api/program/apply`, `/api/account`) from the Next.js app. Set the address in `assets/js/config.js`.

## Open it
Double-click `index.html`, or serve the folder:

```bash
npx serve html
```

Live data works anywhere. Login, register and apply need the Suinance API on the same domain (or set `api` in `config.js` to its address, with CORS enabled there).

## Before going live
- Replace `YOUR-DOMAIN` in `sitemap.xml` and `robots.txt`.
- Replace the social links (x.com, telegram.org, medium.com) in every page footer with the Suinance profiles.
- Add approved validator addresses to `partners` in `assets/js/config.js` to show the Program badge.
