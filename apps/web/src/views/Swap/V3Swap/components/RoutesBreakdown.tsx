import { useTranslation } from '@pancakeswap/localization'
import { Route } from '@pancakeswap/smart-router/evm'
import { useModalV2 } from '@pancakeswap/uikit'
import { memo } from 'react'

import { useDebounce } from '@pancakeswap/hooks'
import SwapRoute from 'views/Swap/components/SwapRoute'
import { DetailContent } from 'views/Swap/V3Swap/containers'
import { useWallchainStatus } from 'views/Swap/V3Swap/hooks/useWallchain'
import { RouteDisplayModal } from './RouteDisplayModal'

interface Props {
  routes?: Route[]
}

export const RoutesBreakdown = memo(function RoutesBreakdown({ routes = [] }: Props) {
  const [wallchainStatus] = useWallchainStatus()
  const { t } = useTranslation()
  const routeDisplayModal = useModalV2()
  const deferWallchainStatus = useDebounce(wallchainStatus, 500)

  if (!routes.length) {
    return null
  }

  const count = routes.length

  return (
    <>
      <DetailContent
        title={deferWallchainStatus === 'found' ? t('Bonus Route') : t('Route')}
        questionHelperText={
          <p>
            {deferWallchainStatus === 'found'
              ? t(
                  'A Bonus route provided by API is automatically selected for your trade to achieve the best price for your trade.',
                )
              : t(
                  'Route is automatically calculated based on your routing preference to achieve the best price for your trade.',
                )}
          </p>
        }
        content={
          <button
            onClick={routeDisplayModal.onOpen}
            type="button"
            className="hover:opacity-70 text-[13px] flex items-center space-x-1"
          >
            {count > 1 ? <span>{t('%count% Separate Routes', { count })}</span> : <RouteComp route={routes[0]} />}
            <span className="text-on-surface-accent">More</span>
          </button>
        }
      />

      <RouteDisplayModal {...routeDisplayModal} routes={routes} />
    </>
  )
})

interface RouteProps {
  route: Route
}

function RouteComp({ route }: RouteProps) {
  const { path } = route

  return <SwapRoute path={path} />
}
