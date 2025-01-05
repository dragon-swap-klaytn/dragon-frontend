import { ButtonProps } from '@pancakeswap/uikit'
import Button from 'components/Common/Button'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetworkLoading } from 'hooks/useSwitchNetworkLoading'
import { useSetAtom } from 'jotai'
import { hideWrongNetworkModalAtom } from './NetworkModal'

export const CommitButton = (props: ButtonProps) => {
  const { isWrongNetwork } = useActiveChainId()
  const [switchNetworkLoading] = useSwitchNetworkLoading()
  const setHideWrongNetwork = useSetAtom(hideWrongNetworkModalAtom)

  return (
    <Button
      variant="primary"
      onClick={(e) => {
        if (isWrongNetwork) {
          setHideWrongNetwork(false)
        } else {
          props.onClick?.(e)
        }
      }}
      disabled={props.disabled || switchNetworkLoading}
      fullWidth
    >
      {props.children}
    </Button>
  )
}
