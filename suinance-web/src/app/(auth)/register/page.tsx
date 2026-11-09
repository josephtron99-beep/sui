import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { headers } from "next/headers";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { RegisterForm, type CountryOption } from "@/components/auth/register-form";

export const metadata: Metadata = pageMeta("/register", "Create account", "Suinance account: create account.", { index: false });

// Built on the server so names are identical in the HTML and after hydration.
function countryOptions(): CountryOption[] {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return getCountries()
    .map((c) => ({ code: c, name: names.of(c) ?? c, dial: getCountryCallingCode(c) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const country = (await headers()).get("x-vercel-ip-country") ?? "";
  const referral = (ref ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return <RegisterForm countries={countryOptions()} defaultCountry={country.toUpperCase()} defaultReferral={referral} />;
}
