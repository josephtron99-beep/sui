import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ForgotPasswordForm } from "@/components/auth/otp-forms";

export const metadata: Metadata = pageMeta("/forgot-password", "Forgot password", "Suinance account: forgot password.", { index: false });

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
