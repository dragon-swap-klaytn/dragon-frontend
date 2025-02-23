export enum BoostStatus {
  UpTo,
  farmCanBoostButNot,
  Boosted,
  CanNotBoost,
}

export const useBoostStatus = (pid: number, tokenId?: string | number) => {
  return {
    status: BoostStatus.CanNotBoost,
    updateStatus: () => {},
  }
}
