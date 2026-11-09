import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-20 sm:py-28", className)} {...props} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-2 ring-1 ring-ink" aria-hidden />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", align === "center" && "mx-auto max-w-2xl justify-items-center text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold">{title}</h2>
      {description && <p className="max-w-[62ch] text-[17px] text-muted">{description}</p>}
    </div>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border-[1.5px] border-ink bg-paper", className)} {...props} />;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "yellow" | "success" | "danger" | "ink";
  className?: string;
}) {
  const tones = {
    neutral: "bg-paper text-ink border-line",
    yellow: "bg-yellow-soft text-ink border-ink/20",
    success: "bg-success-soft text-success border-success/20",
    danger: "bg-danger-soft text-danger border-danger/20",
    ink: "bg-ink text-paper border-ink",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Stat({ value, label, className }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-1", className)}>
      <span className="font-display text-[clamp(24px,3vw,34px)] font-extrabold tabular leading-none">{value}</span>
      <span className="text-[13px] text-muted">{label}</span>
    </div>
  );
}
