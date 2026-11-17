import { createContext, useContext, useState, ReactNode } from "react";

interface ToastContextType {
  showToast: (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);

  const showToast = (message: string, durationMs = 3000) => {
    const id = Date.now();
    setToast({ message, id });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, durationMs);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-white/10 text-white text-xs shadow-2xl animate-fade-in pointer-events-none">
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
