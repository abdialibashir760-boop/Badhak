import Link from "next/link";
import type { Register } from "@/data";

const registerStyles: Record<Register, string> = {
  casual: "bg-amber-100 text-amber-900",
  neutral: "bg-forest-100 text-forest-800",
  formal: "bg-slate-200 text-slate-800",
};

export function RegisterChip({ register }: { register: Register }) {
  return <span className={`chip capitalize ${registerStyles[register]}`}>{register}</span>;
}

export function PageHeader({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <header className="mb-6 animate-rise">
      {eyebrow && <p className="mb-1 text-sm font-semibold text-forest-600">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-base text-ink-soft">{subtitle}</p>}
    </header>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="h-2.5 w-full overflow-hidden rounded-full bg-forest-100"
    >
      <div className="h-full rounded-full bg-forest-600 transition-all duration-500" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <h3 className="font-display text-xl font-bold text-forest-900">{title}</h3>
      <p className="max-w-md text-sm text-ink-soft">{body}</p>
      {href && action && (
        <Link href={href} className="btn-primary mt-3">
          {action}
        </Link>
      )}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-xl font-bold text-forest-900">{children}</h2>
      {action}
    </div>
  );
}
