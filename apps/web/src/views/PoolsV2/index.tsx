import { FarmsContext, FarmsV3Context } from './context'
import FarmsV3 from './FarmsV3'

export const PoolsPageLayout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  return <FarmsV3>{children}</FarmsV3>
}

export { FarmsContext, FarmsV3Context }
