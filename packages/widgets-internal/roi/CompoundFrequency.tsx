import { useTranslation } from "@pancakeswap/localization";
import { memo, useCallback, useMemo } from "react";

import { CheckboxV2 } from "@pancakeswap/uikit";
import clsx from "clsx";

export const FREQUENCIES = ["12h", "1d", "7d", "30d"];

interface Props {
  on?: boolean;
  onToggleCompound?: (on: boolean) => void;
  compoundIndex?: number;
  onCompoundChange?: (compoundIndex: number) => void;
}

export const CompoundFrequency = memo(function CompoundFrequency({
  on = true,
  compoundIndex = 0,
  onToggleCompound = () => {
    // default
  },
  onCompoundChange = () => {
    // default
  },
}: Props) {
  const { t } = useTranslation();
  const frequencies = useMemo(
    () => [
      {
        key: FREQUENCIES[0],
        text: t("12H"),
      },
      {
        key: FREQUENCIES[1],
        text: t("1D"),
      },
      {
        key: FREQUENCIES[2],
        text: t("7D"),
      },
      {
        key: FREQUENCIES[3],
        text: t("30D"),
      },
    ],
    [t]
  );

  const onToggle = useCallback(() => onToggleCompound(!on), [onToggleCompound, on]);

  return (
    <div className="flex items-center space-x-3">
      <CheckboxV2 checked={on} onChange={onToggle} />

      <div className="w-full grid grid-cols-4 bg-surface-container-highest rounded-2xl overflow-hidden">
        {frequencies.map((frequency, i) => (
          <button
            key={frequency.key}
            type="button"
            className={clsx("py-1", {
              "text-on-surface-orange bg-surface-orange": compoundIndex === i,
              "text-on-surface-primary bg-transparent": compoundIndex !== i,
            })}
            onClick={() => onCompoundChange(i)}
          >
            {frequency.text}
          </button>
        ))}
      </div>
    </div>
  );
});
