import { useAccount } from 'wagmi'
import { useContext } from 'react'
import { useCakePrice } from 'hooks/useCakePrice'
import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { FarmsV3Context, FarmsV3PageLayout } from 'views/Farms'
import FarmCard from 'views/Farms/components/FarmCard/FarmCard'
import { getDisplayApr } from 'views/Farms/components/getDisplayApr'
import { FarmV3Card } from 'views/Farms/components/FarmCard/V3/FarmV3Card'
import { V3Farm } from 'views/Farms/FarmsV3'

const FarmsFinishedPage = () => {
  const { address: account } = useAccount()
  const { chosenFarmsMemoized } = useContext(FarmsV3Context)
  const cakePrice = useCakePrice()

  return (
    <>
      {chosenFarmsMemoized?.map((farm) => {
        if (farm.version === 2) {
          <FarmCard
            key={`${farm.pid}-${farm.version}`}
            farm={farm}
            displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
            cakePrice={cakePrice}
            account={account}
            removed={false}
          />
        }

        return (
          <FarmV3Card
            key={`${farm.pid}-${farm.version}`}
            farm={farm as V3Farm}
            cakePrice={cakePrice}
            account={account}
            removed={false}
          />
        )
      })}
    </>
  )
}

FarmsFinishedPage.Layout = FarmsV3PageLayout
FarmsFinishedPage.chains = SUPPORT_FARMS

export default FarmsFinishedPage