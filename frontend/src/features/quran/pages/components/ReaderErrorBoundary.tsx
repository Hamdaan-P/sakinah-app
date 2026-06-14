/**
 * Error boundary used around alternate reader views in QuranReadingPage.
 * Verbatim from QuranReadingPage — no behavior changes.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ReaderEbProps { mode: string; children: ReactNode }
interface ReaderEbState { error: Error | null }

export class ReaderErrorBoundary extends Component<ReaderEbProps, ReaderEbState> {
  state: ReaderEbState = { error: null };
  static getDerivedStateFromError(error: Error): ReaderEbState { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {

    console.error(`[QuranReader · ${this.props.mode} mode] crashed:`, error, info.componentStack);
  }
  reset = () => this.setState({ error: null });
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 text-center max-w-xl mx-auto">
        <p className="text-base font-semibold text-rose-200 mb-1">
          The {this.props.mode} view hit an error
        </p>
        <p className="text-xs text-rose-100/85 break-words mb-3">
          {this.state.error.message || String(this.state.error)}
        </p>
        <button
          onClick={this.reset}
          className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/85 text-xs"
        >
          Retry
        </button>
      </div>
    );
  }
}
