"use client";

import { CheckCircle, AlertCircle, AlertTriangle, InfoCircle, X } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { useToast } from "@/lib/hooks/use-toast";
import type { ToastType } from "@/lib/hooks/use-toast";

const TOAST_STYLES: Record<ToastType, { container: string; icon: string; IconComponent: typeof CheckCircle }> = {
  success: {
    container: "bg-utility-green-50 text-utility-green-700 ring-utility-green-200",
    icon: "text-utility-green-500",
    IconComponent: CheckCircle,
  },
  error: {
    container: "bg-utility-red-50 text-utility-red-700 ring-utility-red-200",
    icon: "text-utility-red-500",
    IconComponent: AlertCircle,
  },
  warning: {
    container: "bg-utility-yellow-50 text-utility-yellow-700 ring-utility-yellow-200",
    icon: "text-utility-yellow-500",
    IconComponent: AlertTriangle,
  },
  info: {
    container: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
    icon: "text-utility-blue-500",
    IconComponent: InfoCircle,
  },
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      role="status"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast, index) => {
        const style = TOAST_STYLES[toast.type];
        const Icon = style.IconComponent;

        return (
          <div
            key={toast.id}
            className={cx(
              "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium shadow-lg ring-1 ring-inset",
              "animate-in fade-in slide-in-from-right-2 duration-200 ease-out",
              "min-w-64 max-w-sm",
              style.container,
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Icon className={cx("size-4 shrink-0", style.icon)} aria-hidden="true" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded p-0.5 opacity-70 transition duration-100 ease-linear hover:opacity-100 focus:outline-2 focus:outline-offset-1 focus:outline-focus-ring"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
