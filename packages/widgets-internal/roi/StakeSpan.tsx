import { useTranslation } from "@pancakeswap/localization";
import { memo, useMemo } from "react";

import clsx from "clsx";

export const SPANS = ["1d", "7d", "30d", "1y", "5y"];

interface Props {
  spanIndex?: number;
  onSpanChange?: (spanIndex: number) => void;
}

export const StakeSpan = memo(function StakeSpan({
  spanIndex = 3,
  onSpanChange = () => {
    // default
  },
}: Props) {
  const { t } = useTranslation();
  const SPAN = useMemo(
    () => [
      {
        key: SPANS[0],
        text: t("1D"),
      },
      {
        key: SPANS[1],
        text: t("7D"),
      },
      {
        key: SPANS[2],
        text: t("30D"),
      },
      {
        key: SPANS[3],
        text: t("1Y"),
      },
      {
        key: SPANS[4],
        text: t("5Y"),
      },
    ],
    [t]
  );

  return (
    <div className="w-full grid grid-cols-5 bg-surface-container-highest rounded-2xl overflow-hidden">
      {SPAN.map((span, i) => (
        <button
          key={span.key}
          type="button"
          className={clsx("py-1", {
            "text-on-surface-orange bg-surface-orange": spanIndex === i,
            "text-on-surface-primary bg-transparent": spanIndex !== i,
          })}
          onClick={() => onSpanChange(i)}
        >
          {span.text}
        </button>
      ))}
    </div>
  );
});
