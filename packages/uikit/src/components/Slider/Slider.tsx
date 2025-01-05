import clsx from "clsx";
import React, { ChangeEvent, useCallback } from "react";
import { SliderLabel, SliderLabelContainer } from "./styles";
import SliderProps from "./types";

const Slider: React.FC<React.PropsWithChildren<SliderProps>> = ({
  min,
  max,
  value,
  onValueChanged,
  valueLabel,
  step = "any",
  disabled = false,
  className,
}) => {
  const handleChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      onValueChanged(parseFloat(target.value));
    },
    [onValueChanged]
  );

  const progressPercentage = (value / max) * 100;
  const isMax = value === max;

  const labelProgress = isMax ? "calc(100% - 12px)" : `${progressPercentage}%`;
  const displayValueLabel = isMax ? "MAX" : valueLabel;
  return (
    <div className={clsx("w-full relative min-h-10 flex items-center", className)}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={handleChange}
        disabled={disabled}
        className="w-full accent-on-surface-accent"
      />

      {valueLabel && (
        <SliderLabelContainer>
          <SliderLabel progress={labelProgress}>{displayValueLabel}</SliderLabel>
        </SliderLabelContainer>
      )}
    </div>
  );
};

export default Slider;
