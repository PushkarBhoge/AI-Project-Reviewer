import { X, AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
        onClick={isLoading ? undefined : onClose} 
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up z-10">
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-start gap-4 mt-2">
          {/* Icon */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isDanger 
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450" 
              : "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
          }`}>
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>

          {/* Texts */}
          <div className="space-y-1.5 flex-1 pr-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer disabled:opacity-50 ${
              isDanger 
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/10" 
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/10"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
