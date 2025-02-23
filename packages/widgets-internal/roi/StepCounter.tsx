import { useTranslation } from "@pancakeswap/localization";
import { NumberFormat } from "@pancakeswap/uikit";
import { FeeAmount } from "@pancakeswap/v3-sdk";
import { Minus, Plus } from "@phosphor-icons/react";
import { memo, ReactNode, useCallback, useEffect, useState } from "react";

interface StepCounterProps {
  value: string;
  onUserInput: (value: string) => void;
  decrement: () => string;
  increment: () => string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
  feeAmount?: FeeAmount;
  label?: string;
  width?: string;
  locked?: boolean; // disable input
  title: ReactNode;
  tokenA: string | undefined;
  tokenB: string | undefined;
}

export const StepCounter = memo(
  ({
    value,
    decrement,
    increment,
    decrementDisabled = false,
    incrementDisabled = false,
    // width,
    locked,
    onUserInput,
    title,
    tokenA,
    tokenB,
  }: StepCounterProps) => {
    const { t } = useTranslation();
    //  for focus state, styled components doesnt let you select input parent container
    const [, setActive] = useState(false);

    // let user type value and only update parent value on blur
    const [localValue, setLocalValue] = useState("");
    const [useLocalValue, setUseLocalValue] = useState(false);

    // animation if parent value updates local value
    // const [

    //   pulsing,
    //   setPulsing,
    // ] = useState<boolean>(false)

    const handleOnFocus = () => {
      setUseLocalValue(true);
      setActive(true);
    };

    const handleOnBlur = useCallback(() => {
      setUseLocalValue(false);
      setActive(false);
      onUserInput(localValue); // trigger update on parent value
    }, [localValue, onUserInput]);

    // for button clicks
    const handleDecrement = useCallback(() => {
      setUseLocalValue(false);
      onUserInput(decrement());
    }, [decrement, onUserInput]);

    const handleIncrement = useCallback(() => {
      setUseLocalValue(false);
      onUserInput(increment());
    }, [increment, onUserInput]);

    useEffect(() => {
      if (localValue !== value && !useLocalValue) {
        setTimeout(() => {
          setLocalValue(value); // reset local value to match parent
          // setPulsing(true) // trigger animation
          // setTimeout(() => {
          //   setPulsing(false)
          // }, 1800)
        }, 0);
      }
    }, [localValue, useLocalValue, value]);

    return (
      <div
        className="bg-neutral px-4 py-3 rounded-xl w-full flex items-center justify-between space-x-3"
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
      >
        <div className="flex flex-col items-start space-y-2">
          <span className="text-xs text-on-surface-subtlest">{title}</span>

          <NumberFormat
            disabled={locked}
            className="text-on-surface w-full focus:outline-none font-bold bg-transparent"
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value.replace(/,/g, ""));
            }}
            thousandSeparator
            allowNegative={false}
          />

          <span className="text-xs text-on-surface-subtlest">
            {tokenA && tokenB && t("{{assetA}} per {{assetB}}", { assetA: tokenB, assetB: tokenA })}
          </span>
        </div>
        <div className="flex flex-col items-center space-y-3">
          {!locked && (
            <button
              type="button"
              className="p-1.5 rounded-full bg-surface-raised "
              onClick={handleIncrement}
              disabled={incrementDisabled}
            >
              <Plus className="text-on-surface" size={16} />
            </button>
          )}

          {!locked && (
            <button
              type="button"
              className="p-1.5 rounded-full bg-surface-raised "
              onClick={handleDecrement}
              disabled={decrementDisabled}
            >
              <Minus className="text-on-surface" size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }
);
