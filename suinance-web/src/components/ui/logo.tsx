import { cn } from "@/lib/utils";
import { MARK_PATH, WORDMARK_PATH } from "./logo-paths";

type Props = { className?: string; title?: string };

/** Hexagon mark only. Colour follows `currentColor`. */
export function LogoMark({ className, title = "Suinance" }: Props) {
  return (
    <svg viewBox="0 0 1074 1191" className={cn("h-8 w-auto", className)} role="img" aria-label={title}>
      <path d={MARK_PATH} fill="currentColor" />
    </svg>
  );
}

/** Full lockup: mark + "Suinance" wordmark. */
export function Logo({ className, title = "Suinance" }: Props) {
  return (
    <svg viewBox="0 0 3895 1191" className={cn("h-8 w-auto", className)} role="img" aria-label={title}>
      <path d={MARK_PATH} fill="currentColor" />
      <path d={WORDMARK_PATH} fill="currentColor" />
    </svg>
  );
}
