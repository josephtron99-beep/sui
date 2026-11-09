"use client";

import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase =
  "h-12 w-full rounded-xl border-[1.5px] border-line bg-paper px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 hover:border-ink/40 focus:border-ink focus:shadow-[0_0_0_4px_var(--yellow-soft)] aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_4px_var(--danger-soft)] disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={htmlFor} className="flex items-center justify-between text-sm font-medium">
        {label}
        {optional && <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={cn(fieldBase, className)}
      {...props}
    />
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput({ className, invalid, ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? "text" : "password"}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
        className={cn(fieldBase, "pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-1 my-auto grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  );
});

export function PasswordStrength({ value }: { value: string }) {
  const checks = [value.length >= 8, /[A-Z]/.test(value) && /[a-z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)];
  const score = checks.filter(Boolean).length;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="grid gap-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 rounded-full bg-line transition-colors duration-300", i < score && (score >= 3 ? "bg-ink" : "bg-yellow-2"))}
          />
        ))}
      </div>
      <span className="text-[12px] text-muted">
        {value ? labels[score] : "Use 8+ characters with upper and lower case, a number and a symbol."}
      </span>
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(fieldBase, "cursor-pointer appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
});

/** Six single-digit boxes with paste, arrow keys and backspace support. */
export function OtpInput({
  length = 6,
  value,
  onChange,
  invalid,
  disabled,
  autoFocus,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  // Holds the latest digits between renders so fast typing never loses a keystroke.
  const live = useRef(digits);
  useLayoutEffect(() => {
    live.current = Array.from({ length }, (_, i) => value[i] ?? "");
  }, [value, length]);
  const prevValue = useRef(value);
  useEffect(() => {
    // After a wrong code clears the boxes, put the cursor back in the first box.
    if (prevValue.current && !value) refs.current[0]?.focus();
    prevValue.current = value;
  }, [value]);

  const setAt = (i: number, d: string) => {
    const next = live.current.slice();
    next[i] = d;
    live.current = next;
    onChange(next.join("").slice(0, length));
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={`${id}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          value={d}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) return setAt(i, "");
            if (v.length > 1) {
              const merged = (digits.slice(0, i).join("") + v).slice(0, length);
              onChange(merged);
              refs.current[Math.min(merged.length, length - 1)]?.focus();
              return;
            }
            setAt(i, v);
            refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (/^\d$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              const pos = Math.min(i, live.current.join("").length);
              setAt(pos, e.key);
              refs.current[Math.min(pos + 1, length - 1)]?.focus();
              return;
            }
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              setAt(i - 1, "");
              refs.current[i - 1]?.focus();
            }
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!v) return;
            e.preventDefault();
            onChange(v);
            refs.current[Math.min(v.length, length - 1)]?.focus();
          }}
          className={cn(
            "h-14 w-full min-w-0 max-w-14 rounded-xl border-[1.5px] border-line bg-paper text-center font-mono text-2xl font-medium text-ink outline-none transition focus:border-ink focus:shadow-[0_0_0_4px_var(--yellow-soft)] sm:h-16",
            d && "border-ink bg-yellow-wash",
            invalid && "border-danger",
          )}
        />
      ))}
    </div>
  );
}

export function FormAlert({ tone = "danger", children }: { tone?: "danger" | "success" | "info"; children: ReactNode }) {
  const tones = {
    danger: "border-danger/25 bg-danger-soft text-danger",
    success: "border-success/25 bg-success-soft text-success",
    info: "border-ink/15 bg-yellow-wash text-ink",
  };
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])}>
      {children}
    </div>
  );
}
