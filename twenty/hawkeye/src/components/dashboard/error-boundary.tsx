"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "@untitledui/icons";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class DashboardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard widget error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-secondary bg-primary p-6 text-center">
          <AlertTriangle className="size-6 text-fg-warning-primary" />
          <p className="text-sm font-medium text-secondary">
            {this.props.fallbackTitle ?? "Widget failed to load"}
          </p>
          <p className="text-xs text-tertiary">{this.state.errorMessage}</p>
          <button
            onClick={() =>
              this.setState({ hasError: false, errorMessage: null })
            }
            className="mt-1 text-xs font-medium text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
