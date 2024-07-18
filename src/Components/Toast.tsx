import { useEffect, useState } from "react";
import { useToastContext } from "../Contexts/ToastContext";

import {
  CheckBadgeIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

type ToastProps = {
  message: string;
  type: any;
  id: number;
};

const toastTypes: any = {
  success: {
    icon: <CheckBadgeIcon className="mr-2 size-5" />,
    color: "bg-green-600",
  },
  error: {
    icon: <ShieldExclamationIcon className="mr-2 size-5" />,
    color: "bg-red-600",
  }
}

export default function Toast({id, message, type}: ToastProps) {
  const {icon, color} = toastTypes[type];
  const toast = useToastContext();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    const removeTimer = setTimeout(() => {
      handleDismiss();
    }, 5000); //give extra time for the fade out animation

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    }
    
  }, []);

  const handleDismiss = () => {
    console.log("Removing toast: ", id);
    toast.remove(id);
  }

  return (
    <div
      className={`flex items-center justify-center ${color} rounded-lg p-3 text-white text-sm shadow-lg transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {icon}
      {message}
      <button className="ml-1 p-1 rounded-full hover:bg-slate-400" onClick={handleDismiss}>
        <XMarkIcon className="size-5" />
      </button>
    </div>
  );
}
