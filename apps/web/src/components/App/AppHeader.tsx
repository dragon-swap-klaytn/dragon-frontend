import { AutoRow, NotificationDot, QuestionHelper } from '@pancakeswap/uikit'
import { useExpertMode } from '@pancakeswap/utils/user'
import { ArrowLeft } from '@phosphor-icons/react'
import clsx from 'clsx'
import GlobalSettings from 'components/Menu/GlobalSettings'
import Link from 'next/link'
import { styled } from 'styled-components'
import { SettingsMode } from '../Menu/GlobalSettings/types'

interface Props {
  title: string | React.ReactNode
  subtitle?: string
  helper?: string
  backTo?: string | (() => void)
  noConfig?: boolean
  IconSlot?: React.ReactNode
  buttons?: React.ReactNode
  filter?: React.ReactNode
  shouldCenter?: boolean
  borderHidden?: boolean
}

const FilterSection = styled(AutoRow)`
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const AppHeader: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  subtitle,
  helper,
  backTo,
  noConfig = false,
  IconSlot = null,
  buttons,
  filter,
  shouldCenter = false,
}) => {
  const [expertMode] = useExpertMode()

  return (
    <div className="px-5 md:px-8 md:pt-8 w-full flex flex-col items-start space-y-7">
      {backTo &&
        (typeof backTo === 'string' ? (
          <Link legacyBehavior passHref href={backTo}>
            <div className="flex items-center space-x-1 cursor-pointer hover:opacity-70">
              <ArrowLeft size={16} className="text-on-surface shrink-0" />

              <span className="text-sm text-on-surface">Back</span>
            </div>
          </Link>
        ) : (
          <button type="button" onClick={backTo} className="hover:opacity-70 flex items-center space-x-1">
            <ArrowLeft size={16} className="text-on-surface" />

            <span className="text-sm text-on-surface ">Back</span>
          </button>
        ))}

      <div className="flex items-center space-x-3 w-full justify-between">
        <div className="flex items-center gap-2 w-full justify-between flex-wrap">
          <div className="flex flex-col items-start">
            <div
              className={clsx('flex items-center space-x-1', {
                'justify-center': shouldCenter,
              })}
            >
              {typeof title === 'string' ? <h2 className="font-bold text-on-surface text-lg">{title}</h2> : title}
              {helper && <QuestionHelper text={helper} ml="4px" placement="top" />}
            </div>

            {subtitle && <h4 className="text-sm text-on-surface-subtlest mt-0.5">{subtitle}</h4>}
          </div>

          {!noConfig && (
            <div className="flex items-center">
              {IconSlot}
              <NotificationDot show={expertMode}>
                <GlobalSettings mode={SettingsMode.SWAP_LIQUIDITY} />
              </NotificationDot>
            </div>
          )}

          {(noConfig && buttons) ||
            (noConfig && IconSlot && (
              <div className="flex items-center space-x-2">
                {noConfig && buttons && <div className="flex items-center space-x-2">{buttons}</div>}
                {noConfig && IconSlot && <div className="flex items-center space-x-2">{IconSlot}</div>}
              </div>
            ))}
        </div>
      </div>

      {filter && (
        <FilterSection justifyContent="space-between" gap="8px">
          {filter}
        </FilterSection>
      )}
    </div>
  )
}

export default AppHeader
