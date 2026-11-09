# Suinance Website: Research & Sitemap

**Date:** 2026-11-09 · **Logo:** `assets/suinance-logo.png` (taken from the "SuiNance Overview of Sui" artifact)

---

## 1. Research: top 10 Sui-type blockchains

"Sui-type" here means fast, parallel-execution Layer 1 chains that compete with Sui. Websites in this space follow a similar pattern, so these are the benchmarks.

Researched 2026-11-09 with one web search per chain. Most sources are third-party blogs, exchanges and staking aggregators, and they **disagree on numbers**. Treat every figure as approximate and check live dashboards before putting it on the site.

| # | Chain | Type / language | Consensus & speed (reported) | Native staking APY (reported, 2026) | Validators (reported) | Notes |
|---|---|---|---|---|---|---|
| 1 | **Sui** | Object model, Move | Mysticeti DAG, sub-second finality | **~1.2–1.7%** (suistaking.io, Stacky). Some guides still claim 3–7%. | ~126–128 active; ~7.5B SUI staked (~75% of supply) | Largest validator ~2.9% of stake (mid-2025). Liquid staking: afSUI, haSUI, vSUI, SpringSui. |
| 2 | **Aptos** | Account model, Move | AptosBFT + Block-STM parallel execution; Raptr consensus on the roadmap | 2.6% (KuCoin, Apr 2026) up to 5–13% (sources conflict) | not found | Same Diem/Move roots as Sui. Rewards compound about every 2h. |
| 3 | **Solana** | Rust, Sealevel parallel | Alpenglow upgrade (testnet Sep 2026, mainnet later in 2026); Firedancer client rolling out | ~5.3–6.5% | ~650–800 (down from ~2,500 in 2023) | ~69% of SOL staked. The big benchmark for staking UX. |
| 4 | **Sei** | Parallel EVM | ~400–500ms finality today; Giga upgrade targets 200k TPS (rolling out in 2026) | no reliable figure found | not found | Trading/finance focus. |
| 5 | **Monad** | Parallel EVM | MonadBFT, ~0.4s blocks, ~0.6–0.8s finality, 10k TPS target | ~13% (Everstake, variable) | ~186–200 | Mainnet live 24 Nov 2025. Epoch ≈ 5.5h. |
| 6 | **Avalanche** | EVM, multi-L1 | Fast finality (no measured figure found) | ~6% (provider snapshot) | min 2,000 AVAX to validate; 2% min commission | APY adjusts with total stake. |
| 7 | **NEAR** | Sharded (Nightshade) | 8–9 shards (sources conflict) | ~4.7–11% (sources conflict), ~5% inflation | not found | Focus on chain abstraction and AI (NEAR Intents). |
| 8 | **TON** | Auto-sharding | Catchain 2.0 (2026 upgrade) | ~4.5–5% | ~350–421 | Telegram became the largest validator in Apr 2026. Staking inside Telegram at 4.7%. |
| 9 | **Movement** | Move (Aptos-style) | Pivoted from Ethereum L2 to its own L1; M1 mainnet Dec 2025 | staking status unclear (sources conflict) | not found | Stablecoin/remittance focus. |
| 10 | **Injective** | Cosmos + MultiVM (EVM) | 2/3-stake finality | ~6.4–7.9% | top 50 active; top 10 hold ~58% of stake | Deflation focus (IIP-617, Jan 2026). |

**Key takeaway for Suinance:** Sui's native staking APY (~1.5%) is **lower** than most rival chains (Solana ~6%, TON ~5%, Injective ~7%). So the site should **not** sell on high APY. Sell on **safety (non-custodial), validator quality and diversification, simplicity, and transparency**. Also lower the artifact's estimator default (3%) to the live network APY.

### What the best of these sites do (patterns to copy)
1. **4–6 top-level menu items, max.** Usually Learn / Build / Ecosystem / Community, plus one primary button.
2. **One clear primary CTA** in the header ("Start building", "Stake now", "Get wallet").
3. **Live numbers on the home page** (TPS, validators, total staked, APY) build credibility.
4. **Staking pages are data-first:** a validator table with commission, APY and stake, linked to explorers.
5. **Short beginner learning paths** instead of long docs.
6. **Legal and risk pages live in the footer**, not the main menu.

### What Suinance needs that chain sites don't
Suinance is **not a blockchain**. It's a staking program on Sui (20+ validators). The site's job is:
**explain Sui → build trust → get the visitor to stake with Suinance validators.**
So the "Build/Developers" menu that chain sites use is **not needed**.

### How Sui stakers choose today (from research)
- Native staking APY is roughly **2–4%** and changes every epoch. Sources disagree, so always show live data.
- Liquid staking alternatives exist (afSUI, haSUI, vSUI, SpringSui). We should explain why to stake with Suinance.
- People check validators on **Suiscan / SuiVision**, so we link every validator there.

---

## 2. Final menu (6 items, no dropdowns)

```
[Logo] Suinance   Home   Learn Sui   Stake   Validators   Ecosystem   About        [ Start Staking ]
```

Footer only (not in the main menu): FAQ · Risk Disclosure · Terms · Privacy · Contact · Socials

---

## 3. Page-by-page sections

### 1. Home `/`
1. **Hero:** logo, headline ("Stake SUI with 20+ trusted validators"), sub-line, buttons **Start Staking** + **Learn Sui**, short trust line ("Your SUI never leaves your wallet").
2. **Live stats bar:** network APY, total staked with Suinance, number of validators, current epoch.
3. **What is Suinance:** 3 cards (Non-custodial · Diversified validators · Rewards every epoch).
4. **How it works:** 4 steps: Connect → Choose validators → Stake → Earn/Withdraw.
5. **Rewards calculator (preview):** a simple version that links to the Stake page.
6. **Why Sui:** 3–4 highlights (speed, low fees, object model, zkLogin), linking to Learn Sui.
7. **Featured validators:** top 4–6 cards, linking to Validators.
8. **FAQ preview:** 4–5 questions, linking to the full FAQ.
9. **Final CTA band.**

### 2. Learn Sui `/learn`
Built from the existing artifact (one long page with in-page anchors, no submenu).
1. **What is Sui:** object model vs account model (interactive toggle).
2. **Consensus & technology:** Mysticeti DAG animation + tech cards (PTBs, zkLogin, sponsored tx, epochs).
3. **SUI tokenomics:** donut chart + unlock note + MIST unit.
4. **What SUI is used for:** gas, staking, governance, storage fund, DeFi.
5. **Sui vs other chains:** a comparison table (Sui, Aptos, Solana, Sei, Monad) using the research above.
6. **Founders & team:** Mysten Labs, Sui Foundation.
7. **Staking basics:** epochs, when rewards start, compounding, withdrawals. This bridges to the Stake page.
8. **Sources & "as of" date.**

### 3. Stake `/stake` (main conversion page)
1. **Connect wallet:** Slush and other Sui wallets, with an optional zkLogin path.
2. **Stake form:** amount, choose validator(s) (or "Auto-split across Suinance validators"), gas estimate, confirm.
3. **Rewards calculator:** compounding, net APY, one-epoch warm-up, with a disclaimer next to the numbers.
4. **My stakes dashboard:** active stakes, rewards earned, pending, and an **Unstake** button.
5. **Staking timeline:** stake → active next epoch → rewards → withdraw.
6. **Safety box:** non-custodial, what can and can't be lost, link to Risk Disclosure.

### 4. Validators `/validators`
1. **Intro:** how Suinance selects validators (criteria: uptime, commission, stake, track record).
2. **Validator table:** name, logo, commission, APY, total stake, voting power, uptime, explorer link, **Stake** button. Sortable and filterable.
3. **Validator detail (modal or drawer, not a separate menu):** description, location, performance history chart.
4. **Become a partner validator:** requirements + application form.

### 5. Ecosystem `/ecosystem`
1. **Intro:** what you can do with SUI after staking.
2. **Category filter + project cards:** DeFi (DeepBook, DEXs, lending), Liquid staking, Storage (Walrus), Identity (SuiNS), Wallets (Slush), Infra (Seal, Nautilus, Hashi).
3. **Each card:** short description, status (live/testnet), official link.
4. **Explorers & tools:** Suiscan, SuiVision.

### 6. About `/about`
1. **Mission:** why Suinance exists.
2. **How Suinance earns:** a transparent business model. This is critical for trust.
3. **Team** (with socials).
4. **Independence statement:** not affiliated with Mysten Labs or the Sui Foundation.
5. **Roadmap:** 3–4 milestones.
6. **Contact & community:** X, Telegram, Discord, email.

### Footer pages (simple, not in the menu)
- **FAQ:** staking, rewards, withdrawals, safety, fees.
- **Risk Disclosure:** price risk, variable APY, validator performance, no guarantees.
- **Terms of Use** · **Privacy Policy**
- **Contact** (can reuse the About contact section)

---

## 4. Why only 6 menus
- Learn Sui, Ecosystem and About are for **understanding and trust**. Stake and Validators are for **action**. Home ties them together.
- There's no Blog, Docs or Community menu yet. Add **Blog** later only if content is published regularly.
- Legal and help pages go in the footer, as on every benchmark site.

## 5. Notes before design
- **Logo check:** the extracted logo (blue hexagon with a water-drop "S") is very close to Sui's own drop mark. Get it checked for trademark/brand-confusion risk with Sui's brand guidelines before launch.
- **Brand colours:** the artifact uses black + yellow, but the logo is blue. We need to decide on one palette for the site.
- Fix the staking facts flagged in `SuiNance-Overview-Analysis.md` (withdrawal timing, reward start, calculator) before reusing that content.

---

**Reference:** `SuiNance-Overview-of-Sui (1).pdf` (5 pages, same content as the artifact). Use it as the content source for **Learn Sui**, after the P0 fixes.

**Sources**
- Sui: [suistaking.io APY](https://suistaking.io/learn/sui-staking-apy) · [suistaking.io validators](https://suistaking.io/validators) · [Stacky Sui](https://stacky.fi/how-to-stake/sui) · [Everstake Sui H1 2025](https://everstake.one/crypto-reports/sui-and-walrus-staking-insights-and-analysis-first-half-of-2025)
- Aptos: [Everstake](https://everstake.one/resources/blog/how-to-choose-aptos-validator) · [KuCoin](https://www.kucoin.com/blog/aptos-staking-yield-drops) · [OneKey](https://onekey.so/blog/ecosystem/why-does-apt-staking-apy-change/)
- Solana: [Coinbase Q2 2026](https://coinbase.com/blog/q2-2026-solana-validator-performance-report) · [Datawallet](https://www.datawallet.com/crypto/solana-staking-statistics-and-trends) · [Solana Compass](https://solanacompass.com/news/bitwise-staking-report-solana-ends-q3-with-69-staked-a-599-gross-yield-and-659-validators)
- Sei: [Messari Giga](https://messari.io/report/inside-sei-giga-autobahn-architecture-and-ecosystem-outlook) · [BlockEden](https://blockeden.xyz/blog/2026/05/07/sei-v2-parallel-evm-12500-tps-mainnet-monad-giga-roadmap/)
- Monad: [BlockEden](https://blockeden.xyz/blog/2026/01/21/monad-mainnet-high-performance-evm-layer-1-solana-killer/) · [Everstake](https://everstake.one/resources/blog/monad-staking-institutional-guide) · [Figment](https://www.figment.io/insights/monad-mainnet-is-live-stake-mon-with-figment/)
- Avalanche: [Avalanche blog](https://www.avax.network/about/blog/how-do-avalanche-validators-actually-think-about-staking-rewards/) · [Kraken](https://www.kraken.com/learn/avalanche-staking-rewards-explained)
- NEAR: [Nansen Q2 2026](https://nansen.ai/post/nansen-near-quarterly-report-q2-2026) · [DexTools](https://www.dextools.io/tutorials/what-is-near-protocol-sharding-guide)
- TON: [CoinShares](https://coinshares.com/insights/research-data/the-open-network-ton-an-institutional-research-note/) · [BlockEden](https://blockeden.xyz/blog/2026/05/01/telegram-ton-validator-catchain-2-mini-app-settlement-layer/) · [Coin Bureau](https://coinbureau.com/review/the-open-network-review)
- Movement: [The Block](https://www.theblock.co/post/371011/movement-plans-transition-layer-1) · [Newswire](https://www.newswire.ca/news-releases/movement-evolves-to-an-l1-unlocking-better-performance-native-staking-and-move-2-0-805696781.html)
- Injective: [Staking Rewards](https://www.stakingrewards.com/earn/injective-protocol/overview) · [Kraken](https://www.kraken.com/learn/injective-staking-rewards-explained)
- [Solana vs Sui vs Aptos 2026 (DexTools)](https://www.dextools.io/tutorials/solana-vs-sui-vs-aptos-l1-comparison-2026)
- [Competitors eye a slice of Solana's pie (Blockworks)](https://blockworks.com/news/competitors-eye-a-slice-of-solanas-pie)
- [Sei parallel EVM vs Monad (BlockEden)](https://blockeden.xyz/blog/tags/sei/)
- [Sui ecosystem](https://ecosystem.sui.io) · [Build on Sui](https://sui.io/developers)
- [How to stake on Sui (Sui blog)](https://blog.sui.io/how-to-stake-on-sui/) · [Liquid staking explained](https://www.sui.io/blog/liquid-staking-explained)
- [Sui validators (suistaking.io)](https://suistaking.io/validators) · [Staking Rewards: SUI](https://www.stakingrewards.com/earn/sui/)
