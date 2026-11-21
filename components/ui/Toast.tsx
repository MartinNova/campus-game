"use client";

import { CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast>(() => {});

/**
 * Short confirmations ("Request sent ✓") that slide in above the tab bar and go away
 * after 2.5 seconds. One at a time: a new one replaces the old one.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((message) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4"
      >
        {toast && (
          <p
            key={toast.id}
            role="status"
            className="toast-in flex items-center gap-2 rounded-full bg-[#1c1c1e] px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-[#1c1c1e]"
          >
            <CircleCheck className="size-4 text-green-400 dark:text-green-600" aria-hidden />
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}

/** `const toast = useToast(); toast("Saved")` */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}
