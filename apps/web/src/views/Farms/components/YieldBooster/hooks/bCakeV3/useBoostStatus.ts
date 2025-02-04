export enum BoostStatus {
  UpTo,
  farmCanBoostButNot,
  Boosted,
  CanNotBoost,
}

export const useBoostStatus = (pid: number, tokenId?: string) => {
  return {
    status: BoostStatus.CanNotBoost,
    updateStatus: () => {},
  }
}
