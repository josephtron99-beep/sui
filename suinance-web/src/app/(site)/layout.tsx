import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SmoothScroll } from "@/components/site/smooth-scroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full surface-dark bg-ink px-4 py-2 text-paper transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <Header />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <Footer />
    </>
  );
}
