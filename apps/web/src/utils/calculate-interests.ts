/**
 * Number of milliseconds in one day.
 */
const MS_IN_DAY = 24 * 60 * 60 * 1000

/**
 * Number of milliseconds in one year (assuming 365 days).
 */
const MS_IN_YEAR = 365 * MS_IN_DAY

export type CalculateInterestParams = {
  /** Total interest earned (same unit as principal) */
  interest: number
  /** Principal amount invested */
  principal: number
  /** Duration over which the interest was earned (in milliseconds) */
  duration: number
}

export interface APYParams extends CalculateInterestParams {
  /**
   * Base duration in milliseconds used for compounding.
   * If provided, the calculation first computes the rate per this period and then annualizes it.
   * Otherwise, the APY is computed directly.
   */
  baseDuration?: number
}

/**
 * Calculates the annual percentage yield (APY) based on compound interest.
 *
 * If `baseDuration` is provided, the function computes the periodic rate and then compounds
 * it for a year. Otherwise, it directly annualizes the observed return.
 *
 * @param {APYParams} params - The parameters for the APY calculation.
 * @returns {number} The APY as a decimal (e.g., 0.05 represents 5%).
 * @throws {Error} If the principal is zero or the duration is non-positive.
 */
export const calculateAPY = ({ interest, principal, duration, baseDuration }: APYParams): number => {
  if (principal === 0) {
    return NaN
  }
  if (duration <= 0) {
    return NaN
  }

  const totalReturn = 1 + interest / principal

  if (baseDuration) {
    // Compute the periodic rate per baseDuration period and then compound it for a year.
    const periodsInDuration = duration / baseDuration
    const periodicRate = totalReturn ** (1 / periodsInDuration) - 1
    const periodsInYear = MS_IN_YEAR / baseDuration
    return (1 + periodicRate) ** periodsInYear - 1
  }
  // Direct annualization: APY = (totalReturn)^(year/duration) - 1.
  return totalReturn ** (MS_IN_YEAR / duration) - 1
}

/**
 * Calculates the annual percentage rate (APR) based on simple interest.
 *
 * @param {CalculateInterestParams} params - The parameters for the APR calculation.
 * @returns {number} The APR as a decimal (e.g., 0.05 represents 5%).
 * @throws {Error} If the principal is zero or the duration is non-positive.
 */
export const calculateAPR = ({ interest, principal, duration }: CalculateInterestParams): number => {
  if (principal === 0) {
    return NaN
  }
  if (duration <= 0) {
    return NaN
  }

  return (interest / principal) * (MS_IN_YEAR / duration)
}
