import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Award, BookOpen, Dumbbell, FileText, Headphones, Home as HomeIcon, Menu, Mic, PenTool, TrendingUp, Type, X } from 'lucide-react';
import { AppErrorBoundary } from '../components/AppErrorBoundary';

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Inicio' },
  { to: '/entrenar', icon: Dumbbell, label: 'Entrenar' },
  { to: '/vocabulario', icon: Type, label: 'Vocabulario' },
  { to: '/gramatica', icon: BookOpen, label: 'Gramática' },
  { to: '/reading', icon: FileText, label: 'Reading' },
  { to: '/listening', icon: Headphones, label: 'Listening' },
  { to: '/speaking', icon: Mic, label: 'Speaking' },
  { to: '/writing', icon: PenTool, label: 'Writing' },
  { to: '/linguaskill', icon: Award, label: 'Linguaskill' },
  { to: '/progreso', icon: TrendingUp, label: 'Progreso' },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-8 place-items-center rounded-lg bg-primary-600 text-[11px] font-bold tracking-tight text-white">V2</div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-[-0.015em] text-slate-950">Lingua Skill</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Study workspace</p>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, mobile = false, onClick }: { to: string; icon: React.ElementType; label: string; mobile?: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        mobile
          ? `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`
          : `group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`
      }
    >
      <Icon className="size-[17px] shrink-0" strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );
}

export const MainLayout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isExamSession = location.pathname.startsWith('/linguaskill/session/');
  const currentItem = useMemo(() => [...navItems].reverse().find((item) => location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(`${item.to}/`))), [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  if (isExamSession) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <AppErrorBoundary key={location.pathname}><Outlet /></AppErrorBoundary>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--app-sidebar-width)] flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-[var(--app-topbar-height)] items-center border-b border-slate-200 px-5"><Brand /></div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegación principal">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
          <div className="space-y-0.5">{navItems.map((item) => <NavItem key={item.to} {...item} />)}</div>
        </nav>
        <div className="border-t border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400"><span className="size-1.5 rounded-full bg-primary-600" aria-hidden="true" /><span>Datos guardados localmente</span></div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 md:pl-[var(--app-sidebar-width)]">
        <header className="sticky top-0 z-20 flex h-[var(--app-topbar-height)] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Abrir navegación"><Menu className="size-5" /></button>
            <div className="md:hidden"><Brand /></div>
            <div className="hidden min-w-0 items-center gap-2 md:flex"><span className="text-sm font-medium text-slate-950">{currentItem?.label ?? 'V2 Lingua Skill'}</span><span className="text-slate-300">/</span><span className="truncate text-xs text-slate-400">Espacio de estudio</span></div>
          </div>
          <div className="hidden items-center gap-2 sm:flex"><span className="status-pill"><span className="size-1.5 rounded-full bg-primary-600" />Local-first</span></div>
        </header>

        <main className="min-h-[calc(100vh-var(--app-topbar-height))] pb-24 md:pb-0">
          <div className="mx-auto w-full max-w-[var(--app-content-width)] px-4 py-6 sm:px-6 md:px-8 md:py-8">
            <AppErrorBoundary key={location.pathname}><Outlet /></AppErrorBoundary>
          </div>
        </main>
      </div>

      <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileMenuOpen}>
        <button type="button" className={`absolute inset-0 bg-black/35 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar navegación" />
        <aside className={`absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-white shadow-md transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} role="dialog" aria-modal="true" aria-label="Navegación">
          <div className="flex h-[var(--app-topbar-height)] items-center justify-between border-b border-slate-200 px-5"><Brand /><button type="button" onClick={() => setMobileMenuOpen(false)} className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Cerrar navegación"><X className="size-5" /></button></div>
          <nav className="flex-1 overflow-y-auto p-3">{navItems.map((item) => <NavItem key={item.to} {...item} mobile onClick={() => setMobileMenuOpen(false)} />)}</nav>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-slate-200 bg-white/96 px-1 backdrop-blur-md md:hidden" aria-label="Navegación rápida">
        {navItems.filter((item) => ['/', '/entrenar', '/vocabulario', '/progreso'].includes(item.to)).map(({ to, icon: Icon, label }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium ${isActive ? 'text-primary-700' : 'text-slate-500'}`}><Icon className="size-5" strokeWidth={1.8}/><span className="truncate">{label}</span></NavLink>)}
        <button type="button" onClick={() => setMobileMenuOpen(true)} className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-500"><Menu className="size-5"/><span>Más</span></button>
      </nav>
    </div>
  );
};
