import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-slate-200 bg-white text-slate-800"
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (message, type = "info", duration = 3000) => {
            idRef.current += 1;
            const id = idRef.current;
            setToasts((prev) => [...prev, { id, message, type }]);
            if (duration > 0) {
                setTimeout(() => dismiss(id), duration);
            }
            return id;
        },
        [dismiss]
    );

    const value = useMemo(
        () => ({
            toast: push,
            success: (message, duration) => push(message, "success", duration),
            error: (message, duration) => push(message, "error", duration ?? 4500),
            info: (message, duration) => push(message, "info", duration)
        }),
        [push]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${
                            styles[toast.type] || styles.info
                        }`}
                        role="status"
                    >
                        <span className="flex-1">{toast.message}</span>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            className="text-current/60 hover:text-current"
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
};
