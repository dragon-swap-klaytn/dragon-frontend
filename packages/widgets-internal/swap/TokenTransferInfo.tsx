import { Currency } from "@pancakeswap/sdk";
import { ArrowCircleDown } from "@phosphor-icons/react";
import { CurrencyLogo } from "../components/CurrencyLogo";

interface TokenTransferInfoProps {
  symbolA?: string;
  symbolB?: string;
  amountA: string;
  amountB: string;
  currencyA?: Currency;
  currencyB?: Currency;
}

const TokenTransferInfo: React.FC<TokenTransferInfoProps> = ({
  symbolA,
  symbolB,
  amountA,
  amountB,
  currencyA,
  currencyB,
}) => {
  return (
    <div className="flex flex-col items-center space-y-3 w-full max-w-60">
      <TokenAmountRow amount={amountA} currency={currencyA} symbol={symbolA} />
      <ArrowCircleDown size={24} className="text-gray-50" />
      <TokenAmountRow amount={amountB} currency={currencyB} symbol={symbolB} />
    </div>
  );
};

function TokenAmountRow({ amount, currency, symbol }: { amount: string; currency?: Currency; symbol?: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm justify-between w-full rounded-[20px] pl-2 pr-3 py-2 bg-surface-container-highest">
      <div className="flex items-center space-x-2">
        <CurrencyLogo size="20px" currency={currency} />
        <span>{symbol}</span>
      </div>

      <span>{amount}</span>
    </div>
  );
}

export default TokenTransferInfo;
