import { useEffect } from "react";

const Modal = ({ open, title, description, onClose, children, footer, size = "md" }) => {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
            if (event.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    const widthClass =
        size === "lg" ? "max-w-3xl" : size === "sm" ? "max-w-sm" : "max-w-xl";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-gray-900/50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`relative w-full ${widthClass} max-h-[90vh] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg`}
            >
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {title}
                        </h2>
                        {description ? (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <span className="block h-5 w-5 text-lg leading-5">
                            ×
                        </span>
                    </button>
                </div>
                <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-5 py-5">
                    {children}
                </div>
                {footer ? (
                    <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Modal;
