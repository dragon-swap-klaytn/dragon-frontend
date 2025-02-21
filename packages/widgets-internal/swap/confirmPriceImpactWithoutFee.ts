import { TFunction } from "@pancakeswap/localization";
import { Percent } from "@pancakeswap/swap-sdk-core";

/**
 * Given the price impact, get user confirmation.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 * @param t Translation
 */
export function confirmPriceImpactWithoutFee(
  priceImpactWithoutFee: Percent,
  priceImpactWithoutFeeConfirmMin: Percent,
  allowedPriceImpactHigh: Percent,
  t: TFunction
): boolean {
  if (!priceImpactWithoutFee.lessThan(priceImpactWithoutFeeConfirmMin)) {
    const confirmWord = "confirm";
    return (
      // eslint-disable-next-line no-alert
      window.prompt(
        t(
          'This swap has a price impact of at least {{amount}}%. Please type the word "{{word}}" to continue with this swap.',
          {
            amount: priceImpactWithoutFeeConfirmMin.toFixed(0),
            word: confirmWord,
          }
        )
      ) === confirmWord
    );
  }
  if (!priceImpactWithoutFee.lessThan(allowedPriceImpactHigh)) {
    // eslint-disable-next-line no-alert
    return window.confirm(
      t(
        "This swap has a price impact of at least {{amount}}%. Please confirm that you would like to continue with this swap.",
        {
          amount: allowedPriceImpactHigh.toFixed(0),
        }
      )
    );
  }
  return true;
}
