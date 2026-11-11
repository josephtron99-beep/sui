/* Suinance settings for the static HTML edition.
 * api: where the Suinance account API lives. "" means the same site (deploy next to the Next.js app).
 *      Set it to null to hide account features entirely.
 * rules: program thresholds (keep in sync with the Next.js site).
 * partners: Sui addresses of approved program members (they get the Program badge). */
window.SUINANCE_CONFIG = {
  "api": "",
  "graphqlUrl": "https://graphql.mainnet.sui.io/graphql",
  "rules": {
    "maxCommissionPct": 10,
    "maxVotingPowerPct": 3,
    "cleanEpochs": 30,
    "upgradeHours": 72,
    "graceEpochs": 7
  },
  "partners": []
};
