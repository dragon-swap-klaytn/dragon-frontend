export const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  return ((cakeRewardsApr ?? 0) + (lpRewardsApr ?? 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })
}