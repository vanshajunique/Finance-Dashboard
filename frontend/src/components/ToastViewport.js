import { useToast } from "../context/ToastContext";

const toneClasses = {
  info: "border-cyan-100 bg-cyan-50 text-cyan-900 dark:border-cyan-900/50 dark:bg-cyan-950/60 dark:text-cyan-100",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-100",
  error:
    "border-rose-100 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-100"
};

const ToastViewport = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-3xl border px-4 py-4 shadow-soft ${toneClasses[toast.tone] || toneClasses.info}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-full px-2 py-1 text-xs opacity-70 transition hover:opacity-100"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastViewport;

