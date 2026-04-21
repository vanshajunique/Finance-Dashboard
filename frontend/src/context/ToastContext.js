import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  const addToast = ({ title, description = "", tone = "info" }) => {
    const id = ++toastId;
    setToasts((currentToasts) => [...currentToasts, { id, title, description, tone }]);
    window.setTimeout(() => removeToast(id), 3500);
  };

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast
    }),
    [toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => useContext(ToastContext);

