import { useTranslation } from "@pancakeswap/localization";
import { XCircle } from "@phosphor-icons/react";
import { ReactElement } from "react";

export function TransactionErrorContent({
  message,
  onDismiss,
}: {
  message: ReactElement | string;
  onDismiss?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <div className="flex flex-col items-center space-y-7">
        <XCircle size={100} className="text-red-400" />

        <p className="text-center break-keep">{message}</p>

        {onDismiss ? (
          // TODO: need to replace with Button component in web
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-[20px] text-sm bg-surface-orange text-on-surface-orange px-4 h-10 hover:opacity-70 w-full"
          >
            {t("Dismiss")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
