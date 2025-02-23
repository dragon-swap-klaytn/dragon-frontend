import { useDefaultsFromURLSearch } from 'state/swap/hooks'
import { V3SwapForm } from './V3Swap'

export default function Swap() {
  useDefaultsFromURLSearch()

  return <V3SwapForm />
}
