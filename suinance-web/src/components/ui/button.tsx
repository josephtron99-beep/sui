import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,box-shadow,background-color,color] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

const variants = {
  primary:
    "bg-ink text-paper border-[1.5px] border-ink hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgb(17_17_17/0.6)]",
  yellow:
    "bg-yellow text-ink border-[1.5px] border-ink shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard",
  outline: "bg-paper text-ink border-[1.5px] border-ink hover:bg-yellow-soft",
  ghost: "text-ink hover:bg-ink/5",
  link: "text-ink underline-offset-4 hover:underline px-0!",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
  icon: "h-10 w-10",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...props },
  ref,
) {
  return (
    <button ref={ref} className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

type LinkButtonProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  external?: boolean;
};

export function LinkButton({ href, variant = "primary", size = "md", className, children, external }: LinkButtonProps) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses(variant, size, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
