import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LogoCoin3D } from "@/components/three/scenes";
import { ThemeToggle } from "@/components/site/theme";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside className="surface-dark relative hidden overflow-hidden bg-ink text-paper lg:grid lg:grid-rows-[auto_1fr_auto] lg:p-10">
        <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
        <Link href="/" className="relative w-fit" aria-label="Suinance home">
          <Logo className="h-9 text-yellow" />
        </Link>
        <LogoCoin3D className="relative mx-auto aspect-square w-full max-w-[460px] self-center" />
        <div className="relative grid gap-3">
          <p className="max-w-md font-display text-3xl font-bold leading-tight">
            Stake SUI from your own wallet. <span className="text-yellow">Keep your keys.</span>
          </p>
          <p className="text-sm text-paper/60">Suinance is independent and not affiliated with Mysten Labs or the Sui Foundation.</p>
        </div>
      </aside>
      <main className="relative flex flex-col bg-paper">
        <div aria-hidden className="bg-grid bg-grid-fade absolute inset-0 -z-0 opacity-60" />
        <header className="relative flex items-center justify-between p-5 sm:p-8">
          <Link href="/" className="lg:invisible" aria-label="Suinance home">
            <Logo className="h-8" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="py-2 text-sm text-muted transition hover:text-ink">
              ← Back to site
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="relative flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
