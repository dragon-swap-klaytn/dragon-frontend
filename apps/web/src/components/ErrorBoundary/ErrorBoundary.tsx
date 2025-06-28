import { ButtonV2 } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import { Component, PropsWithChildren, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  PropsWithChildren<{ fallback?: ((error: Error) => ReactNode) | ReactNode }>,
  { error: Error | undefined }
> {
  constructor(props) {
    super(props)
    this.state = { error: undefined }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      if (typeof this.props.fallback === 'function') return this.props.fallback(this.state.error)
      return (
        <>
          <Page>
            <div className="flex flex-col items-center justify-center space-y-3 h-[60vh]">
              <p className="text-on-surface text-lg">{this.props.fallback || 'Oops, something wrong.'}</p>

              <ButtonV2 variant="primary" onClick={() => window.location.reload()}>
                Reload
              </ButtonV2>
            </div>
          </Page>
        </>
      )
    }

    return this.props.children
  }
}
