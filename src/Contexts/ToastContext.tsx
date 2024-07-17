import { createContext, useContext, useReducer } from "react";
import ToastContainer from "../Components/ToastContainer";

export const ACTIONS = {
  ADD_TOAST: "Add_toast",
  DELETE_TOAST: "Delete_toast",
};

function ToastReducer(state: any, action: any) {
  switch (action.type) {
    case ACTIONS.ADD_TOAST: {
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      };
    }
    case ACTIONS.DELETE_TOAST: {
      const updatedToasts = state.toasts.filter(
        (toast: any) => toast.id != action.toast,
      );
      return {
        ...state,
        toasts: updatedToasts,
      };
    }
    default: {
      throw new Error("unhandled action type");
    }
  }
}

type ToastContextType = {
  success: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  error: (message: string) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(ToastReducer, { toasts: [] });

  const addToast = (type: any, message: string) => {
    const id = Date.now();
    dispatch({ type: ACTIONS.ADD_TOAST, toast: { id, message, type } });
  };

  const success = (message: string) => {
    addToast("success", message);
  };

  const warning = (message: string) => {
    addToast("warning", message);
  };

  const info = (message: string) => {
    addToast("info", message);
  };

  const error = (message: string) => {
    addToast("error", message);
  };

  const remove = (id: number) => {
    dispatch({ type: ACTIONS.DELETE_TOAST, toast: id });
  };

  const value = { success, warning, info, error, remove };

  return (
    <ToastContext.Provider value={value}>
      <ToastContainer toasts={state.toasts} />
      {children}
    </ToastContext.Provider>
  );
};

//wrap with custom context hook
export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("Toast context is undefined!");
  }
  return context;
}
