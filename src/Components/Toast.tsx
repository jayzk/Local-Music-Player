import React, { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  duration: number; // duration in milliseconds
  logo: any;
  color: any;
};

function Toast({ message, duration, logo, color }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      className={`flex items-center justify-center ${color} rounded-lg p-4 text-white shadow-lg transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {logo}
      {message}
    </div>
  );
}

export const useToast = () => {
  const [toasts, setToasts] = useState<
    { id: number; message: string; duration: number; logo: any; color: any }[]
  >([]);

  const addToast = (
    message: string,
    duration: number,
    logo: any,
    color: any,
  ) => {
    const id = Date.now();
    setToasts([...toasts, { id, message, duration, logo, color }]);
    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id),
      );
    }, duration + 2000); // Extra time for fade-out animation
  };

  const ToastContainer = () => (
    <div className="fixed right-0 top-[15%] space-y-2 p-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          duration={toast.duration}
          logo={toast.logo}
          color={toast.color}
        />
      ))}
    </div>
  );

  return { addToast, ToastContainer };
};
