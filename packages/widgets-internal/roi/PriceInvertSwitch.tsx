import { useTranslation } from "@pancakeswap/localization";
import { Currency } from "@pancakeswap/sdk";
import { memo } from "react";

import { ArrowsLeftRight } from "@phosphor-icons/react";

interface Props {
  baseCurrency?: Currency | null;
  onSwitch?: () => void;
}

export const PriceInvertSwitch = memo(function PriceInvertSwitch({ baseCurrency, onSwitch }: Props) {
  const { t } = useTranslation();

  if (!baseCurrency) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 justify-end mb-2">
      <span className="text-xs text-on-surface-secondary">{t("View prices in")}</span>

      <button
        type="button"
        onClick={onSwitch}
        className="flex items-center space-x-1 text-on-surface-primary px-3 py-1 rounded-2xl bg-surface-container-highest hover:opacity-70 text-sm"
      >
        <ArrowsLeftRight size={16} />
        <span>{baseCurrency.symbol}</span>
      </button>
    </div>
  );
});
