import { useTranslation } from "@pancakeswap/localization";
import { Percent, ZERO_PERCENT } from "@pancakeswap/sdk";
import { ExpandableLabel, Flex } from "@pancakeswap/uikit";
import { formatPercent } from "@pancakeswap/utils/formatFractions";
import { formatAmount } from "@pancakeswap/utils/formatInfoNumbers";
import { ReactNode, memo, useState } from "react";

interface Props {
  totalYield?: number | string;
  farmReward?: number | string;
  lpReward?: number | string;
  lpApr?: Percent;
  lpApy?: Percent;
  farmApy?: Percent;
  farmApr?: Percent;
  externalLink?: ReactNode;
  compoundIndex?: number;
  compoundOn?: boolean;
  isFarm?: boolean;
}

export const Details = memo(function Details({
  totalYield = 0,
  externalLink,
  lpReward = 0,
  farmReward = 0,
  lpApy = ZERO_PERCENT,
  farmApr = ZERO_PERCENT,
  farmApy = ZERO_PERCENT,
  lpApr = ZERO_PERCENT,
  isFarm = false,
  compoundIndex = 0,
  compoundOn = true,
}: Props) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const compoundIndexToReadableText: { [key: number]: string | undefined } = {
    0: t("2x daily compound"),
    1: t("1x daily compound"),
    2: t("1x weekly compound"),
    3: t("1x monthly compound"),
  };
  const compoundText = compoundIndexToReadableText[compoundIndex] || "";

  const details = isExpanded ? (
    <div className="p-4">
      <div className="flex flex-col items-center w-full justify-between text-sm text-on-surface-primary">
        <div className="w-full flex items-center space-x-2 justify-between">
          <h4>{t("Yield")}</h4>
          <b className="text-base">${formatAmount(+totalYield)}</b>
        </div>

        <div className="w-full flex items-center space-x-2 justify-between mt-2 pl-2">
          <h5>{t("LP Fee Yield")}</h5>
          <span>${formatAmount(+lpReward)}</span>
        </div>

        {isFarm && (
          <div className="w-full flex items-center space-x-2 justify-between mt-2 pl-2">
            <h5>{t("Farm Yield")}</h5>
            <span>${formatAmount(+farmReward)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center w-full justify-between mt-4 text-sm text-on-surface-primary">
        <div className="w-full flex items-center space-x-2 justify-between">
          <h4>{t("APR")}</h4>
          <b className="text-base">{`${formatPercent(lpApr.add(farmApr), 5) || "0"}%`}</b>
        </div>

        <div className="w-full flex items-center space-x-2 justify-between mt-2 pl-2">
          <h5>{t("LP Fee APR")}</h5>
          <span>{`${formatPercent(lpApr, 5) || "0"}%`}</span>
        </div>

        <div className="w-full flex items-center space-x-2 justify-between mt-2 pl-2">
          {isFarm && farmApr && (
            <>
              <h5>{t("Farm APR")}</h5>
              <span>{formatPercent(farmApr, 5) || "0"}%</span>
            </>
          )}
        </div>
      </div>

      {compoundOn && (
        <div className="w-full flex items-center space-x-2 justify-between mt-4 text-sm text-on-surface-primary">
          <h4>
            {t("APY")} {compoundText && `(${compoundText})`}
          </h4>
          <b className="text-base">{`${formatPercent(lpApy.add(farmApy), 5) || "0"}%`}</b>
        </div>
      )}

      <ul
        className="text-sm text-on-surface-tertiary mt-6 px-4"
        style={{
          listStyleType: "disc",
        }}
      >
        <li>
          {t(
            "Yields and rewards are calculated at the current rates and subject to change based on various external variables."
          )}
        </li>
        <li>
          {t(
            "LP Fee Rewards: 0.01% ~ 1% per trade according to the specific fee tier of the trading pair, claimed and compounded manually."
          )}
        </li>
        <li>{t("LP Fee APR figures are calculated using Subgraph and may subject to indexing delays.")}</li>
        <li>
          {t(
            "All figures are estimates provided for your convenience only, and by no means represent guaranteed returns."
          )}
        </li>
      </ul>
      {externalLink && (
        <Flex justifyContent="center" mt="24px">
          {externalLink}
        </Flex>
      )}
    </div>
  ) : null;

  return (
    <div className="w-full flex flex-col space-y-3 mt-3">
      <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)}>
        {isExpanded ? t("Hide") : t("Details")}
      </ExpandableLabel>
      {details}
    </div>
  );
});
