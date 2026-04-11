"use client";

import { useCallback, useSyncExternalStore } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastEntry {
  id: string;
  message: string;
  type: ToastType;
  createdAt: number;
}

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 5000;

let toasts: ToastEntry[] = [];
let listeners: Array<() => void> = [];
let nextId = 0;

// Track timer IDs for cleanup (Fix 21)
const timerMap = new Map<string, ReturnType<typeof setTimeout>>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): ToastEntry[] {
  return toasts;
}

function getServerSnapshot(): ToastEntry[] {
  return [];
}

function addToast(message: string, type: ToastType): void {
  const id = `toast-${++nextId}`;
  const entry: ToastEntry = { id, message, type, createdAt: Date.now() };

  toasts = [...toasts, entry];

  // Trim to max visible
  if (toasts.length > MAX_VISIBLE) {
    // Clear timers for removed toasts
    const removed = toasts.slice(0, toasts.length - MAX_VISIBLE);
    for (const t of removed) {
      const timer = timerMap.get(t.id);
      if (timer) {
        clearTimeout(timer);
        timerMap.delete(t.id);
      }
    }
    toasts = toasts.slice(toasts.length - MAX_VISIBLE);
  }

  emitChange();

  // Auto-dismiss with tracked timer
  const timerId = setTimeout(() => {
    timerMap.delete(id);
    dismissToast(id);
  }, AUTO_DISMISS_MS);
  timerMap.set(id, timerId);
}

function dismissToast(id: string): void {
  const before = toasts;
  toasts = toasts.filter((t) => t.id !== id);
  // Clear timer on manual dismiss
  const timer = timerMap.get(id);
  if (timer) {
    clearTimeout(timer);
    timerMap.delete(id);
  }
  if (toasts !== before) {
    emitChange();
  }
}

export function useToast() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    addToast(message, type);
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return { toasts: currentToasts, toast, dismiss };
}

export type { ToastEntry, ToastType };
