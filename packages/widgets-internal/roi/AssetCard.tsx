import { useTranslation } from "@pancakeswap/localization";
import { Currency, Percent } from "@pancakeswap/sdk";
import { formatAmount } from "@pancakeswap/utils/formatInfoNumbers";
import { memo, MouseEvent, PropsWithChildren, ReactNode, Ref, useCallback } from "react";
import { styled } from "styled-components";
import { SpaceProps } from "styled-system";

import { NumberFormat, RowBetween, Tag, TagProps, useMatchBreakpoints } from "@pancakeswap/uikit";
import { Pencil } from "@phosphor-icons/react";
import clsx from "clsx";
import { CurrencyLogo } from "../components/CurrencyLogo";

import { toSignificant } from "./utils";

// export function CardSection({ header, children, ...rest }: { header?: ReactNode } & PropsWithChildren & SpaceProps) {
//   return (
//     <Box mb="24px" {...rest}>
//       <RowBetween mb="12px">{header}</RowBetween>
//       {children}
//     </Box>
//   );
// }

export function SectionTitle({ children }: PropsWithChildren) {
  return <h4 className="text-xs text-on-surface-brand">{children}</h4>;
}

export interface AssetCardProps extends SpaceProps {
  assets?: Asset[];
  header?: ReactNode;
  showPrice?: boolean;
  priceEditable?: boolean;
  isActive?: boolean;
  onChange?: (assets: Asset[], info: { indexes: number[] }) => void;
  extraRows?: ReactNode;
  firstPriceInputRef?: Ref<HTMLInputElement>;
}

export interface Asset {
  // price in usd
  price: string;

  currency: Currency;

  value: number | string;

  amount: number | string;

  priceChanged?: boolean;

  // Used to identify item in list
  key?: string;
}

export const CurrencyLogoDisplay = memo(function CurrencyLogoDisplay({
  logo,
  name,
}: {
  logo?: ReactNode;
  name?: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      {logo}

      <span className="text-sm text-on-surface">{name}</span>
    </div>
  );
});

export function AssetCardHeader({ children }: PropsWithChildren) {
  return <RowBetween>{children}</RowBetween>;
}

export const AssetCard = memo(function AssetCard({
  header,
  showPrice = true,
  priceEditable = true,
  isActive = false,
  assets = [],
  extraRows,
  onChange,
  firstPriceInputRef,
  ...rest
}: AssetCardProps) {
  const { t } = useTranslation();
  const { isMobile } = useMatchBreakpoints();

  const onAssetPriceChange = useCallback(
    (price: string, index: number) => {
      const updatedAsset = assets[index];
      const indexes: number[] = [];
      // Update all prices with same currency
      const newAssets = updatedAsset
        ? assets.map((a, i) => {
            if (a.currency.equals(updatedAsset.currency)) {
              indexes.push(i);
              return { ...a, price, priceChanged: true };
            }
            return a;
          })
        : assets;
      return onChange?.(newAssets, { indexes });
    },
    [onChange, assets]
  );

  const assetNodes = assets.map(({ price, value, amount, currency, priceChanged, key = "" }, index) => (
    <AssetRow
      key={currency.symbol + key}
      priceInputRef={index === 0 ? firstPriceInputRef : undefined}
      price={price}
      value={value}
      amount={amount}
      showPrice={showPrice}
      decimals={18}
      priceEditable={priceEditable}
      priceChanged={priceChanged}
      name={<CurrencyLogoDisplay logo={<CurrencyLogo currency={currency} />} name={currency.symbol} />}
      onPriceChange={(newPrice) => onAssetPriceChange(newPrice, index)}
    />
  ));

  return (
    <div>
      {header}

      {/* <Card isActive={isActive} style={{ overflowX: "auto" }}> */}
      <div className="rounded-2xl border">
        <table className="w-full">
          {/* <colgroup>
            <col />
            {showPrice && <col width="30%" />}
            <col />
            <col />
          </colgroup> */}
          <thead>
            <tr>
              <th className="text-left font-bold text-on-surface px-3 pt-2 pb-4 text-sm">{t("Asset")}</th>
              {showPrice && (
                <th className="text-left font-bold text-on-surface px-3 pt-2 pb-4 text-sm">{t("Price")}</th>
              )}
              <th className="text-left font-bold text-on-surface px-3 pt-2 pb-4 text-sm">{t("Balance")}</th>
              <th className="text-left font-bold text-on-surface px-3 pt-2 pb-4 text-sm">{t("Value")}</th>
            </tr>
          </thead>
          <tbody>
            {assetNodes}
            {extraRows}
          </tbody>
        </table>
      </div>
    </div>
  );
});

interface AssetRowProps {
  name: ReactNode;
  priceInputRef?: Ref<HTMLInputElement>;
  amount?: string | number;
  price?: string;
  priceChanged?: boolean;
  priceEditable?: boolean;
  decimals?: number;
  value?: string | number;
  showPrice?: boolean;
  onPriceChange?: (price: string) => void;
}

export const AssetRow = memo(function AssetRow({
  price = "0",
  value = 0,
  amount,
  decimals = 6,
  name,
  showPrice = true,
  priceChanged = false,
  priceEditable = true,
  onPriceChange,
  priceInputRef,
}: AssetRowProps) {
  const onPriceUpdate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        onPriceChange?.(e.currentTarget.value.replace(/,/g, ".") || "0");
      }
    },
    [onPriceChange]
  );
  const onMouseDown = useCallback((e: MouseEvent<HTMLInputElement>) => {
    if (e.currentTarget !== document.activeElement) {
      e.preventDefault();
      e.currentTarget.focus();
      e.currentTarget.select();
    }
  }, []);

  const textColor = priceChanged ? "primary" : "textSubtle";

  return (
    <tr>
      <td className="px-3 pb-3">{name}</td>
      {showPrice && (
        <td className="px-3">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-on-surface">$</span>

            <NumberFormat
              ref={priceInputRef}
              className="text-on-surface w-16 text-sm bg-transparent text-left focus:outline-none"
              value={price}
              onChange={onPriceUpdate}
              onMouseDown={onMouseDown}
              thousandSeparator
              allowNegative={false}
              placeholder="0"
              pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
              min={0}
              disabled={!priceEditable}
            />

            {priceChanged && <Pencil size={12} className="text-on-surface" />}
          </div>
        </td>
      )}
      <td className="px-3">{amount && <span className="text-sm text-on-surface">{formatAmount(+amount)}</span>}</td>
      <td className="px-3">
        <span className="text-sm text-on-surface">${formatAmount(+value)}</span>
      </td>
    </tr>
  );
});

interface InterestDisplayProps {
  amount?: number | string;
  interest?: Percent | typeof Infinity;
}

export const InterestDisplay = memo(function InterestDisplay({ amount, interest }: InterestDisplayProps) {
  return (
    <div className="flex items-center space-x-1 text-sm">
      {amount && <span className="text-on-surface">${toSignificant(amount)}</span>}

      {interest && (
        <span
          className={clsx(typeof interest === "number" || !interest.lessThan(0) ? "text-teal-400" : "text-red-400")}
        >
          (
          {typeof interest === "number"
            ? formatAmount(interest)
            : parseFloat(interest.toSignificant(18)).toLocaleString("en", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
          %)
        </span>
      )}
    </div>
  );
});

interface CardTagProps extends TagProps {
  isActive?: boolean;
}

const ActiveTag = styled(Tag)`
  background: ${({ theme }) => theme.colors.gradientBold};
`;

export const CardTag = memo(function CardTag({ isActive, children, ...rest }: PropsWithChildren<CardTagProps>) {
  // if (isActive) {
  //   return <ActiveTag {...rest} />;
  // }
  // return <Tag variant="textSubtle" outline {...rest} />;

  return (
    <div
      className={clsx("text-xs font-bold", {
        "text-on-surface-subtle": !isActive,
        "bg-gradient-to-br from-surface-orange via-on-surface-accentSubtle to-surface-orange text-on-surface text-transparent bg-clip-text":
          isActive,
      })}
    >
      {children}
    </div>
  );
});
