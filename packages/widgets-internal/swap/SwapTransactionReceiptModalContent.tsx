import { CheckCircle } from "@phosphor-icons/react";
import { PropsWithChildren } from "react";

export const SwapTransactionReceiptModalContent: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col items-center space-y-7">
      <CheckCircle size={100} className="text-teal-400" weight="light" />

      {children}
    </div>
  );
};
