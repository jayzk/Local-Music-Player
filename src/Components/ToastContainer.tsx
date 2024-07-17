import Toast from "./Toast";

export default function ToastContainer({ toasts }: any) {
  return (
    <div className="fixed right-0 top-[10%] z-50 space-y-2 p-4">
      {toasts.map((toast: any) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
        />
      ))}
    </div>
  );
}
