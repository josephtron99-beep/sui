import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-grid relative grid min-h-dvh place-items-center px-6">
      <div className="grid justify-items-center gap-6 text-center">
        <LogoMark className="h-20 text-ink" />
        <p className="font-mono text-sm text-muted">Error 404</p>
        <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold">This page isn&apos;t on-chain.</h1>
        <p className="max-w-md text-muted">The page you are looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className={buttonClasses("primary", "lg")}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
