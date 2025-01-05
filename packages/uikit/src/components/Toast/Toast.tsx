import { CheckCircle, Info, Warning } from "@phosphor-icons/react";
import { useCallback } from "react";
import { ToastProps } from "./types";

export const Toast: React.FC<React.PropsWithChildren<ToastProps>> = ({ toast, onRemove }) => {
  const { id, title, description, type } = toast;

  const handleRemove = useCallback(() => onRemove(id), [id, onRemove]);

  return (
    <button
      type="button"
      className="max-w-80 flex items-center space-x-3 bg-surface-container-high rounded-xl px-4 py-3"
      onClick={handleRemove}
    >
      <div className="shrink-0 w-4 h-4">
        {
          {
            success: <CheckCircle size={20} weight="fill" className="text-teal-500" />,
            danger: <Warning size={20} weight="fill" className="text-rose-500" />,
            warning: <Warning size={20} weight="fill" className="text-yellow-500" />,
            info: <Info size={20} weight="fill" className="text-on-surface-primary" />,
          }[type]
        }
      </div>

      <div className="flex flex-col items-start">
        {typeof title === "string" ? <p className="font-bold break-keep text-on-surface-primary">{title}</p> : title}

        {typeof description === "string" ? (
          <p className="break-keep mt-2 text-on-surface-primary">{description}</p>
        ) : (
          description
        )}
      </div>
    </button>
  );
};
