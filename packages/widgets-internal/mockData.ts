import { ERC20Token } from "@pancakeswap/sdk";
import { ChainId } from "@pancakeswap/chains";

// For StoryBook
export const cakeToken = new ERC20Token(
  ChainId.KLAYTN,
  "0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432",
  18,
  "WKLAY",
  "Wrapped Klay",
  "https://klaytn.foundation"
)

export const nativeStable = new ERC20Token(
  ChainId.KLAYTN,
  "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167",
  18,
  "oUSDT",
  "OOrbit Bridge Klaytn USD Tether",
)
