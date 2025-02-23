import { useTranslation } from "@pancakeswap/localization";
import { memo } from "react";

import { MILLION } from "@pancakeswap/uikit/components/RoiCalculatorModal/RoiCard";

interface Props {
  usdAmount?: number;
  roiPercent?: number;
}

export const RoiRate = memo(function RoiRate({ usdAmount = 0, roiPercent }: Props) {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-neutral rounded-2xl w-full">
      <h4 className="text-xs text-on-surface-brand">{t("ROI at current rates")}</h4>

      <div className="mt-4 flex flex-col items-start space-y-1 sm:flex-row sm:space-y-0 sm:items-center font-bold sm:space-x-1 text-lg overflow-x-auto">
        <span className="text-on-surface">
          $&nbsp;
          {usdAmount.toLocaleString("en", {
            minimumFractionDigits: usdAmount > MILLION ? 0 : 2,
            maximumFractionDigits: usdAmount > MILLION ? 0 : 2,
          })}
        </span>

        <span className="text-teal-400">
          &nbsp;(
          {roiPercent?.toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) ?? "-"}
          %)
        </span>
      </div>
    </div>
  );
});
