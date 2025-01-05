import { ChainId } from '@pancakeswap/chains'
import { masterChefAddresses, masterChefV3Addresses, masterChefV3FinishedAddresses } from '@pancakeswap/farms'
import { GAUGES_ADDRESS, GAUGES_CALC_ADDRESS } from '@pancakeswap/gauges'
import { ICAKE } from '@pancakeswap/ifos'
import { CAKE_VAULT } from '@pancakeswap/pools'
import { V3_QUOTER_ADDRESSES } from '@pancakeswap/smart-router/evm'
import { DEPLOYER_ADDRESSES } from '@pancakeswap/v3-sdk'

// DEV_NOTE [체인설정]_7 : 주요 컨트랙트 주소 설정
export default {
  masterChef: masterChefAddresses,
  masterChefV3: masterChefV3Addresses,
  masterChefV1: {
    [ChainId.KLAYTN_TESTNET]: '0x',
    [ChainId.KLAYTN]: '0x',
  },
  masterChefV3Finished: masterChefV3FinishedAddresses,
  sousChef: {
    [ChainId.KLAYTN_TESTNET]: '0x',
    [ChainId.KLAYTN]: '0x',
  },
  lotteryV2: {
    [ChainId.KLAYTN_TESTNET]: '0x',
    [ChainId.KLAYTN]: '0x',
  },
  multiCall: {
    [ChainId.KLAYTN]: '0x856B344c81f5bf5e6b7f84e1380ef7baC42B2542',
    [ChainId.KLAYTN_TESTNET]: '0x68f762d28CebaD501c090949e4680697e56848fC',
  },
  pancakeProfile: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  pancakeBunnies: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  bunnyFactory: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  claimRefund: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  pointCenterIfo: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  bunnySpecial: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  tradingCompetitionEaster: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  tradingCompetitionFanToken: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  tradingCompetitionMobox: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  tradingCompetitionMoD: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  easterNft: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  cakeVault: CAKE_VAULT,
  cakeFlexibleSideVault: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  predictionsV1: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  bunnySpecialCakeVault: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  bunnySpecialPrediction: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  bunnySpecialLottery: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  bunnySpecialXmas: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  farmAuction: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  nftMarket: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  nftSale: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  pancakeSquad: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  potteryDraw: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  zap: {
    [ChainId.KLAYTN]: '0xdaf882D7456beC8B91F3C02b2d327c6B6Bb44E7d',
    [ChainId.KLAYTN_TESTNET]: '0xd9214E368d3eF8800883Ba2b58E3822E9115590e',
  },
  stableSwapNativeHelper: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  iCake: ICAKE,
  bCakeFarmBooster: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  bCakeFarmBoosterProxyFactory: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  nonBscVault: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  crossFarmingSender: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  crossFarmingReceiver: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  mmLinkedPool: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  tradingReward: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  nftPositionManager: {
    [ChainId.KLAYTN]: '0x68f762d28CebaD501c090949e4680697e56848fC',
    [ChainId.KLAYTN_TESTNET]: '0xf56f7Ca86633B4b3dF9Ba90d4693B454b6D4Bf51',
  },
  v3PoolDeployer: DEPLOYER_ADDRESSES,
  v3Migrator: {
    [ChainId.KLAYTN]: '0xF88764c81F4D56Fc5FfdAA14805CC66C45063fD0',
    [ChainId.KLAYTN_TESTNET]: '0x2f48eC737E05C6813E75d67C949C6b1c8bA8B52b',
  },
  quoter: V3_QUOTER_ADDRESSES,
  v3Airdrop: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  affiliateProgram: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  tradingRewardTopTrades: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  vCake: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  revenueSharingPool: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  anniversaryAchievement: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  fixedStaking: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  veCake: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  gaugesVoting: GAUGES_ADDRESS,
  gaugesVotingCalc: GAUGES_CALC_ADDRESS,
  revenueSharingVeCake: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  revenueSharingCakePool: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
  revenueSharingPoolGateway: {
    [ChainId.KLAYTN]: '0x',
    [ChainId.KLAYTN_TESTNET]: '0x',
  },
} as const satisfies Record<string, Record<number, `0x${string}`>>
