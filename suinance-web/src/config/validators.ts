/**
 * Suinance partner validators.
 *
 * Add the Sui address (`sui_address`) of each validator in the Suinance program.
 * While this list is empty, the site shows the full live Sui validator set and
 * does not label anyone as a partner.
 */
export const PARTNER_VALIDATORS: string[] = [];

export function isPartner(address: string) {
  return PARTNER_VALIDATORS.some((a) => a.toLowerCase() === address.toLowerCase());
}
