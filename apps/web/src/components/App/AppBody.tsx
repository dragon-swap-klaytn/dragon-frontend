import { Card } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'
import { styled } from 'styled-components'

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  max-width: 436px;
  width: 100%;
  z-index: 1;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({
  children,
  className,
  maxWidth = 'max-w-md',
}: PropsWithChildren<{ className?: string; maxWidth?: string }>) {
  return (
    <div className={clsx('rounded-2xl mx-auto w-full z-10 bg-surface-container overflow-hidden', maxWidth, className)}>
      {children}
    </div>
  )
}
