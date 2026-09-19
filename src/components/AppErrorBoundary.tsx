import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route rendering failed', error, info);
  }

  render() {
    if (this.state.error) {
      return <div className="max-w-2xl mx-auto bg-white border border-rose-200 rounded-xl p-6"><h1 className="text-xl font-bold text-rose-800">No se ha podido mostrar este módulo</h1><p className="text-sm text-slate-600 mt-2">Recarga la página. Si el problema continúa, conserva este mensaje:</p><code className="block mt-3 p-3 rounded-lg bg-slate-100 text-xs text-slate-800 break-words">{this.state.error.message}</code></div>;
    }
    return this.props.children;
  }
}
