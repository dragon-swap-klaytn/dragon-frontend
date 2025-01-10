import { useTranslation } from "@pancakeswap/localization";
import clsx from "clsx";
import { Slider } from "../Slider";
import { ButtonV2 } from "./ButtonV2";

export function PercentageSlider({
  percentForSlider,
  handleChangePercent,
  onPercentSelect,
  className,
}: {
  percentForSlider: number;
  handleChangePercent: (value: any) => void;
  onPercentSelect: (percent: number | string) => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx("p-4 rounded-2xl bg-neutral", className)}>
      <span className="text-2xl font-bold text-on-surface">{percentForSlider}%</span>

      <Slider
        name="lp-amount"
        min={0}
        max={100}
        value={percentForSlider}
        onValueChanged={handleChangePercent}
        className="mt-1 mb-2"
      />

      <div className="grid grid-cols-4 gap-2">
        {[25, 50, 75, "Max"].map((p) => (
          <ButtonV2
            key={`PercentageSlider:${p}`}
            fullWidth
            onClick={() => onPercentSelect(p)}
            variant="blank"
            scale="sm"
          >
            {typeof p === "number" ? `${p}%` : t("Max")}
          </ButtonV2>
        ))}
      </div>
    </div>
  );
}
