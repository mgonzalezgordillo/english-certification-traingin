import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, icon, action, eyebrow }: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode; eyebrow?: string }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-600">{eyebrow}</p>}
        <div className="flex items-center gap-3">{icon && <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">{icon}</span>}<h1 className="page-heading">{title}</h1></div>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-950">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}</div>{action}</div>;
}

export function MetricCard({ label, value, detail, attention = false }: { label: string; value: ReactNode; detail?: string; attention?: boolean }) {
  return <section className={`panel-section min-w-0 ${attention ? 'border-accent-200' : ''}`}><p className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${attention ? 'text-accent-600' : 'text-slate-500'}`}>{label}</p><div className="metric-value line-clamp-2">{value}</div>{detail && <p className="mt-1.5 text-xs leading-5 text-slate-400">{detail}</p>}</section>;
}

export function SegmentedControl<T extends string>({ items, value, onChange, getLabel }: { items: readonly T[]; value: T; onChange: (value: T) => void; getLabel?: (value: T) => string }) {
  return <div className="inline-flex max-w-full gap-1 rounded-[10px] border border-slate-200 bg-slate-100/70 p-1" role="group">{items.map((item) => <button key={item} type="button" onClick={() => onChange(item)} className={`min-h-8 rounded-md px-3 text-xs font-semibold transition-colors ${value === item ? 'bg-white text-primary-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}>{getLabel ? getLabel(item) : item}</button>)}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">{children}</div>;
}

export function LoadingState({ label }: { label: string }) {
  return <div className="space-y-4 py-6" aria-live="polite"><span className="sr-only">{label}</span><div className="h-8 w-48 animate-pulse rounded-md bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"/>)}</div></div>;
}
