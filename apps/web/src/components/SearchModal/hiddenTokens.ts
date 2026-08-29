const HIDDEN_TOKEN_ADDRESSES = new Set(
  ['0xC16d986585407A74Ab87d17C3d0Dc19822E3EB35'].map((address) => address.toLowerCase()),
)

export const isHiddenTokenAddress = (address?: string | null) => {
  if (!address) {
    return false
  }

  return HIDDEN_TOKEN_ADDRESSES.has(address.toLowerCase())
}
