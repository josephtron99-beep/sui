/**
 * Suinance Validator Program: rules, benefits and steps.
 *
 * The thresholds below are program policy, modelled on public validator programs
 * (Solana Foundation Delegation Program, Sui's SIP-39 voting-power rules). The
 * Suinance team can change any number here and the whole site updates.
 */

export const programRules = {
  maxCommissionPct: 10,
  maxVotingPowerPct: 3,
  cleanEpochs: 30,
  upgradeHours: 72,
  graceEpochs: 7,
};

export const programBenefits = [
  {
    title: "A verified place in the directory",
    body: "Members carry a Program badge on the Suinance validators page, right next to their live stake, commission and voting power.",
  },
  {
    title: "Introductions to delegators",
    body: "Suinance points its community of SUI holders to program members first, with the on-chain data they need to choose.",
  },
  {
    title: "Checks every epoch",
    body: "We review each member's on-chain record every epoch and contact the operator early when a number starts to drift.",
  },
  {
    title: "An operator network",
    body: "A private channel for member operators to share upgrade notes, incident reports and lessons from running Sui nodes.",
  },
];

export const eligibility = [
  {
    label: "Active set",
    value: "Mainnet",
    title: "In Sui's active validator set",
    body: "Your validator is active on Sui mainnet. Candidates still building stake toward the joining threshold can apply and are reviewed once active.",
  },
  {
    label: "Commission",
    value: `≤ ${programRules.maxCommissionPct}%`,
    title: "Fair commission",
    body: `Commission at or below ${programRules.maxCommissionPct}%. Changes are announced to the program at least one epoch before they take effect.`,
  },
  {
    label: "Peer reports",
    value: "0",
    title: "A clean tallying record",
    body: `No reports from other validators under Sui's tallying rule in the last ${programRules.cleanEpochs} epochs.`,
  },
  {
    label: "Upgrade window",
    value: `${programRules.upgradeHours}h`,
    title: "Current software",
    body: `Run a supported Sui release and upgrade within ${programRules.upgradeHours} hours of each mainnet release.`,
  },
  {
    label: "Voting power",
    value: `< ${programRules.maxVotingPowerPct}%`,
    title: "Room for decentralisation",
    body: `Voting power under ${programRules.maxVotingPowerPct}% of the network, so the program strengthens mid-sized operators instead of the largest ones.`,
  },
  {
    label: "Identity",
    value: "Public",
    title: "A public operator",
    body: "Name, description, logo and website filled in on-chain, a reachable contact, and one validator per operating entity.",
  },
];

export const programSteps = [
  { title: "Apply", body: "Sign in and submit your validator's Sui address, commission, hosting region and a contact for your operations team." },
  { title: "On-chain review", body: "We check your address against the live validator set and your record over recent epochs against every criterion." },
  { title: "Onboard", body: "Approved validators get the Program badge on the validators page and an invite to the operator channel." },
  {
    title: "Stay in good standing",
    body: `Members are checked every epoch. A validator that falls below a standard gets ${programRules.graceEpochs} epochs to recover before it leaves the program.`,
  },
];

export const programFaqs = [
  {
    q: "What is the Suinance Validator Program?",
    a: "An independent program for Sui validator operators. Members meet public standards for commission, uptime, software and decentralisation, are checked every epoch, and are introduced to the Suinance community of SUI holders.",
  },
  {
    q: "Who can apply?",
    a: `Any operator running a validator on Sui mainnet with commission at or below ${programRules.maxCommissionPct}% and voting power under ${programRules.maxVotingPowerPct}%. Candidates still building stake can apply and are reviewed once they join the active set.`,
  },
  {
    q: "Does it cost anything to join?",
    a: "No. There is no fee to apply or to stay in the program.",
  },
  {
    q: "How do you check validators?",
    a: "From public on-chain data: the active validator set, stake and voting power, commission, reference gas price quotes and tallying-rule reports. Anyone can verify the same numbers on a Sui explorer.",
  },
  {
    q: "How long does a review take?",
    a: "We look at your record over recent epochs, so a review needs a few days of on-chain history. We email you at the address on your account when it is done.",
  },
  {
    q: "What happens if my validator falls below a standard?",
    a: `We contact you first. You then have ${programRules.graceEpochs} epochs to recover. If the issue is still there, the validator leaves the program and can apply again later.`,
  },
  {
    q: "Does Suinance hold anyone's SUI?",
    a: "No. Suinance never takes custody of SUI. Delegators stake from their own wallets, and validators keep full control of their nodes and keys.",
  },
  {
    q: "Is Suinance part of Sui?",
    a: "No. Suinance is not run by or affiliated with Mysten Labs or the Sui Foundation.",
  },
];
