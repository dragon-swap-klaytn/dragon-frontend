import { ButtonProps, ButtonV2 } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetworkLoading } from 'hooks/useSwitchNetworkLoading'

export const CommitButton = (props: ButtonProps) => {
  const { isWrongNetwork } = useActiveChainId()
  const [switchNetworkLoading] = useSwitchNetworkLoading()

  return (
    <ButtonV2
      variant="primary"
      onClick={(e) => {
        if (isWrongNetwork) {
          return
        }

        props.onClick?.(e)
      }}
      disabled={props.disabled || switchNetworkLoading}
      fullWidth
      className={props.className}
    >
      {props.children}
    </ButtonV2>
  )
}
