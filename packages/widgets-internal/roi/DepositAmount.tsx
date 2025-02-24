import { useTranslation } from "@pancakeswap/localization";
import { Currency, CurrencyAmount } from "@pancakeswap/sdk";
import { memo, useCallback } from "react";

import { Box, NumberFormat } from "@pancakeswap/uikit";
import clsx from "clsx";
import { CurrencyLogo } from "../components/CurrencyLogo";

type Props = UsdAmountInputProps & TokenAmountsDisplayProps;

export const DepositAmountInput = memo(function DepositAmountInput({
  value,
  max,
  onChange,
  amountA,
  amountB,
  currencyA,
  currencyB,
  maxLabel,
}: Props) {
  return (
    <div className="flex flex-col items-center w-full space-y-2">
      <DepositUsdAmountInput value={value} max={max} onChange={onChange} maxLabel={maxLabel} />
      <TokenAmountsDisplay amountA={amountA} amountB={amountB} currencyA={currencyA} currencyB={currencyB} />
    </div>
  );
});

interface UsdAmountInputProps {
  value?: string;
  max?: string;
  onChange?: (val: string) => void;
  maxLabel?: string;
}

export const DepositUsdAmountInput = memo(function DepositUsdAmountInput({
  value = "",
  max = "",
  onChange = () => {
    // default
  },
  maxLabel,
}: UsdAmountInputProps) {
  const { t } = useTranslation();

  const onMax = useCallback(() => onChange(max), [max, onChange]);

  return (
    <>
      <Box mb="0.5em" width="100%">
        <div className="border border-gray-700 rounded-[20px] px-4 py-3 w-full flex items-end space-x-2">
          <NumberFormat
            className="text-on-surface text-sm text-right focus:outline-none w-full bg-transparent"
            value={value}
            onChange={(e) => {
              onChange(e.target.value.replace(/,/g, "."));
            }}
            thousandSeparator
            allowNegative={false}
            decimalScale={2}
            placeholder="0"
            pattern="^[0-9]*[.,]?[0-9]{0,2}$"
          />

          <span className="text-sm text-on-surface">{t("USD")}</span>
        </div>
      </Box>

      <div className="w-full grid gap-2 grid-flow-col grid-cols-3">
        <Button isSelected={value === "100"} onClick={() => onChange("100")} className="col-span-1">
          $100
        </Button>
        <Button isSelected={value === "1000"} onClick={() => onChange("1000")} className="col-span-1">
          $1,000
        </Button>
        <div className="flex items-center space-x-2 col-span-1">
          <Button isSelected={value === max} onClick={onMax}>
            {maxLabel || t("Max")}
          </Button>
        </div>
      </div>
    </>
  );
});

interface TokenAmountsDisplayProps {
  currencyA?: Currency | null;
  currencyB?: Currency | null;
  amountA?: CurrencyAmount<Currency>;
  amountB?: CurrencyAmount<Currency>;
}

const TokenDisplayRow = memo(function TokenDisplayRow({
  amount,
  currency,
}: {
  amount?: CurrencyAmount<Currency>;
  currency?: Currency | null;
}) {
  if (!currency) return null;

  return (
    <div className="flex items-center space-x-2 w-full justify-between">
      <div className="flex items-center space-x-2">
        <CurrencyLogo currency={currency} />

        <span className="text-sm text-on-surface">{currency.symbol}</span>
      </div>

      <span className="text-sm text-on-surface">{amount?.toExact() || "0"}</span>
    </div>
  );
});

export const TokenAmountsDisplay = memo(function TokenAmountsDisplay({
  amountA,
  amountB,
  currencyA,
  currencyB,
}: TokenAmountsDisplayProps) {
  if (!currencyA && !currencyB) {
    return null;
  }

  return (
    <div className="rounded-2xl p-4 bg-neutral flex flex-col space-y-4 w-full">
      <TokenDisplayRow amount={amountA} currency={currencyA} />

      <TokenDisplayRow amount={amountB} currency={currencyB} />
    </div>
  );
});

function Button({
  children,
  onClick,
  isSelected,
  className,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isSelected?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("rounded-[20px] hover:opacity-70 px-3 py-2 text-sm w-full", className, {
        "bg-transparent border-gray-700 border text-on-surface": !isSelected,
        "bg-brand text-on-surface-inverse": isSelected,
      })}
    >
      {children}
    </button>
  );
}
