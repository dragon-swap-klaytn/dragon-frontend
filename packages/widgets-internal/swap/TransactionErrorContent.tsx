import { useTranslation } from "@pancakeswap/localization";
import { ButtonV2 } from "@pancakeswap/uikit";
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
        <XCircle size={100} className="text-red-400" weight="light" />

        <p className="text-center break-keep text-on-surface">{message}</p>

        {onDismiss ? (
          // TODO: need to replace with Button component in web
          <ButtonV2 onClick={onDismiss} variant="subtle" fullWidth>
            {t("Dismiss")}
          </ButtonV2>
        ) : null}
      </div>
    </div>
  );
}
