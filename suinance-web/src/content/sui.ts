/**
 * Facts used across the site. Sources: Sui docs, Sui Foundation, Mysten Labs
 * announcements and the Suinance research pack (Nov 2026). Network figures that
 * change every epoch (APY, stake, validators) are fetched live, not stored here.
 */

export const keyFacts = [
  { value: "May 2023", label: "Mainnet launch" },
  { value: "10B", label: "Fixed maximum SUI supply" },
  { value: "~0.5s", label: "Time to finality with Mysticeti" },
  { value: "~24h", label: "Length of one epoch" },
];

export const techCards = [
  {
    title: "Mysticeti consensus",
    short: "Orders transactions in about half a second.",
    long: "Mysticeti went live on mainnet in 2024, replacing Narwhal and Bullshark. Validators commit blocks straight from a shared graph of proposals, with no extra certificate rounds, which removes latency.",
  },
  {
    title: "Programmable transaction blocks",
    short: "Up to 1,024 actions in one atomic transaction.",
    long: "A PTB can split coins, call several contracts and transfer the results in one step. Either every action succeeds, or none of them do.",
  },
  {
    title: "zkLogin",
    short: "Sign in with Google, Apple and other accounts.",
    long: "Zero-knowledge proofs link a familiar web login to a Sui address without revealing the account, so new users can start without managing a seed phrase.",
  },
  {
    title: "Sponsored transactions",
    short: "Apps can pay gas for their users.",
    long: "A sponsor signs alongside the user and covers the fee, so someone can use an app before they own any SUI.",
  },
  {
    title: "Epochs",
    short: "The network works in cycles of about 24 hours.",
    long: "The validator set, stake weights and reference gas price are fixed for each epoch. Staking changes and rewards are applied at epoch boundaries.",
  },
  {
    title: "Storage fund",
    short: "On-chain data is paid for up front.",
    long: "Storage fees go into a fund that pays future validators for keeping data available. Deleting data refunds 99% of the storage fee that was paid for it.",
  },
];

export const founders = [
  { initials: "EC", name: "Evan Cheng", role: "Co-founder & CEO", bio: "Led research and development for Novi at Meta. Earlier ran compiler and developer-tools teams at Apple." },
  { initials: "SB", name: "Sam Blackshear", role: "Co-founder & CTO", bio: "Created the Move programming language while at Meta." },
  { initials: "AA", name: "Adeniyi Abiodun", role: "Co-founder & CPO", bio: "Led product development at Novi." },
  { initials: "GD", name: "George Danezis", role: "Co-founder & Chief Scientist", bio: "Professor of security and privacy engineering at University College London. Co-designed Sui's consensus research." },
  { initials: "KC", name: "Kostas Chalkias", role: "Co-founder & Chief Cryptographer", bio: "Former lead cryptographer at Novi. Works on Sui's cryptography, including zkLogin." },
];

export const tokenomics = [
  { name: "Community reserve", pct: 50, note: "Funds grants, research, the validator stake subsidy and other community programs." },
  { name: "Early contributors", pct: 20, note: "For the Mysten Labs team and early contributors, unlocking over several years." },
  { name: "Investors", pct: 14, note: "Series A and Series B investors, roughly 7% each, with vesting schedules." },
  { name: "Mysten Labs treasury", pct: 10, note: "Held by Mysten Labs to fund continued development of Sui." },
  { name: "Community access & testers", pct: 6, note: "Sold through the Community Access Program and given to early app testers." },
];

export const useCases = [
  {
    key: "gas",
    title: "Gas fees",
    heading: "Pay for transactions",
    points: [
      "Every transaction pays a gas fee in SUI, split into computation and storage.",
      "Validators set a reference gas price each epoch, which keeps fees low and predictable.",
      "Apps can sponsor gas so their users don't need SUI to get started.",
    ],
  },
  {
    key: "stake",
    title: "Staking",
    heading: "Secure the network",
    points: [
      "Holders delegate SUI to validators and earn a share of the rewards the protocol pays.",
      "The more SUI staked with a validator, the more weight it has in consensus.",
      "Staked SUI stays owned by the holder. Validators can never spend it.",
    ],
  },
  {
    key: "gov",
    title: "Protocol decisions",
    heading: "Who decides upgrades",
    points: [
      "Validators adopt protocol upgrades and set the reference gas price, weighted by stake.",
      "There is no on-chain token-holder vote. Delegators shape the validator set by choosing who to stake with.",
    ],
  },
  {
    key: "store",
    title: "Storage fund",
    heading: "Pay for data kept on-chain",
    points: [
      "Storing data costs SUI, which goes into a shared storage fund.",
      "The fund pays future validators for keeping that data available.",
      "Deleting data refunds 99% of its storage fee.",
    ],
  },
  {
    key: "defi",
    title: "DeFi & payments",
    heading: "A base asset for apps",
    points: [
      "SUI is used as collateral, in liquidity pools and for lending across Sui DeFi.",
      "Fast finality makes it practical for everyday payments and in-game purchases.",
    ],
  },
];

export const stakingBasics = [
  { title: "Stake", body: "You send SUI to a validator's staking pool. You receive a StakedSui object in your own wallet that proves your position." },
  { title: "Activate", body: "Your stake becomes active at the start of the next epoch, roughly within 24 hours." },
  { title: "Earn", body: "Rewards are added at the end of every epoch you are active, minus the validator's commission. They compound automatically inside the pool." },
  { title: "Withdraw", body: "Unstake at any time. Your SUI and earned rewards come back in the same transaction. Rewards for the epoch in progress are not paid." },
];

/** Comparison with other fast Layer 1 networks (research pack, Nov 2026). */
export const chainComparison = [
  { chain: "Sui", model: "Objects, Move", consensus: "Mysticeti (DAG)", apy: "Live on this site" },
  { chain: "Aptos", model: "Accounts, Move", consensus: "AptosBFT + Block-STM", apy: "Variable, single digits" },
  { chain: "Solana", model: "Accounts, Rust", consensus: "Tower BFT, moving to Alpenglow", apy: "About 5–6.5%" },
  { chain: "Sei", model: "Parallel EVM", consensus: "Twin-turbo, moving to Autobahn", apy: "Variable" },
  { chain: "Monad", model: "Parallel EVM", consensus: "MonadBFT", apy: "Variable" },
];

export type EcoProject = { name: string; category: string; description: string; url: string };

export const ecosystem: EcoProject[] = [
  { name: "Slush", category: "Wallets", description: "The wallet from Mysten Labs, formerly Sui Wallet. Browser extension, mobile app and web wallet with zkLogin and native staking.", url: "https://slush.app" },
  { name: "Walrus", category: "Infrastructure", description: "Decentralised storage for large files such as images, video and AI data, coordinated by Sui. Mainnet since March 2025.", url: "https://walrus.xyz" },
  { name: "Seal", category: "Infrastructure", description: "Encryption and access control. Apps write who can decrypt data as Move policies, and independent key servers enforce them.", url: "https://github.com/MystenLabs/seal" },
  { name: "Nautilus", category: "Infrastructure", description: "Verifiable off-chain computation in secure enclaves, with results checked by Sui smart contracts.", url: "https://docs.sui.io/concepts/cryptography/nautilus" },
  { name: "SuiNS", category: "Identity", description: "Readable names like alice.sui that point to your wallet, profile or a Walrus-hosted site.", url: "https://suins.io" },
  { name: "DeepBook", category: "DeFi", description: "A fully on-chain central limit order book that other Sui apps can build on.", url: "https://deepbook.tech" },
  { name: "Cetus", category: "DeFi", description: "Concentrated-liquidity exchange and liquidity protocol on Sui.", url: "https://www.cetus.zone" },
  { name: "Suilend", category: "DeFi", description: "Lending and borrowing protocol. Also issues SpringSui liquid staking tokens.", url: "https://suilend.fi" },
  { name: "NAVI Protocol", category: "DeFi", description: "Lending and liquidity protocol on Sui.", url: "https://naviprotocol.io" },
  { name: "Scallop", category: "DeFi", description: "Money market for lending and borrowing on Sui.", url: "https://scallop.io" },
  { name: "Aftermath", category: "Liquid staking", description: "Exchange and liquid staking protocol behind afSUI.", url: "https://aftermath.finance" },
  { name: "Haedal", category: "Liquid staking", description: "Liquid staking protocol behind haSUI.", url: "https://haedal.xyz" },
  { name: "Volo", category: "Liquid staking", description: "Liquid staking protocol behind vSUI.", url: "https://www.volosui.com" },
  { name: "Suiscan", category: "Explorers", description: "Block explorer for transactions, objects, validators and staking.", url: "https://suiscan.xyz" },
  { name: "SuiVision", category: "Explorers", description: "Block explorer and analytics for the Sui network.", url: "https://suivision.xyz" },
];

export const faqs = [
  { q: "What is Suinance?", a: "Suinance is an independent staking hub for Sui. You delegate SUI natively from your own wallet to the validators you choose, and track your on-chain stakes and rewards in one place." },
  { q: "Do I give Suinance my SUI?", a: "No. Staking happens from your own wallet. Your SUI moves into the validator's staking pool and you receive a StakedSui object that only your wallet controls. Neither Suinance nor the validator can spend it." },
  { q: "When do rewards start?", a: "Your stake becomes active at the start of the next epoch, about 24 hours later. Rewards are added at the end of every epoch after that." },
  { q: "How much can I earn?", a: "Sui staking rewards are variable. They depend on total network stake, the stake subsidy, gas fees and the validator's commission. The current network rate is shown live on the Stake and Validators pages." },
  { q: "How do I withdraw?", a: "Choose a stake on the Stake page and unstake it. Your SUI and earned rewards return to your wallet in the same transaction. Rewards for the epoch in progress are not paid." },
  { q: "Can I lose my staked SUI?", a: "Sui does not slash staked principal today. A validator that performs badly can be reported by other validators, which reduces the rewards paid to its pool. The value of SUI itself can go up or down." },
  { q: "Is there a minimum amount?", a: "Native staking on Sui requires at least 1 SUI per stake, plus a small amount for gas." },
  { q: "Why do I need an account?", a: "You can stake without one. An account lets you verify your email, keep your referral code and receive program updates." },
  { q: "Is Suinance part of Sui?", a: "No. Suinance is not run by or affiliated with Mysten Labs or the Sui Foundation." },
];
