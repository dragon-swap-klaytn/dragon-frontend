const HIDDEN_TOKEN_ADDRESSES = new Set()

export const isHiddenTokenAddress = (address?: string | null) => {
  if (!address) {
    return false
  }

  return HIDDEN_TOKEN_ADDRESSES.has(address.toLowerCase())
}
