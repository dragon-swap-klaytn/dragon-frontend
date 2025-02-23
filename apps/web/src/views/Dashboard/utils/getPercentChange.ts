/**
 * Get increase/decrease of value compared to the previous value as a percentage
 * @param valueNow - more recent value
 * @param valueBefore - value to compare with
 */
export default function getPercentChange(valueNow?: number, valueBefore?: number) {
  if (valueNow && valueBefore) {
    return ((valueNow - valueBefore) / valueBefore) * 100
  }
  return 0
}
