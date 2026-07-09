"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    // TODO: Send to Sentry / monitoring service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <div>
              <p className="text-lg font-bold text-red-400">خطایی رخ داد</p>
              <p className="mt-2 text-sm text-[var(--ink-dim)]">
                لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-red-400/10 px-5 py-2 text-sm text-red-400"
              >
                بارگذاری مجدد
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}