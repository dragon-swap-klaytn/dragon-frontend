import { useTranslation } from "@pancakeswap/localization";
import { CheckCircle } from "@phosphor-icons/react";
import { PropsWithChildren } from "react";

export const SwapTransactionReceiptModalContent: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center space-y-7">
      <CheckCircle size={100} className="text-green-400" />

      <div className="flex flex-col space-y-3">
        <p className="text-center font-bold">{t("Transaction receipt")}</p>

        {children}
      </div>
    </div>
  );
};
