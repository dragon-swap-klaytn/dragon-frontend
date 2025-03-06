import { Trans, useTranslation } from '@pancakeswap/localization'
import { COMMON_BUTTON_STYLE, DragonSwapLogo, MD_BUTTON_STYLE } from '@pancakeswap/uikit'
import { ArrowUpRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { getDefaultStaticProps } from 'utils/pageUtils'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import Background from 'views/Main/Background'

const DATA = {
  tvlUSD: {
    date: '2024-11-29',
    dragonSwap: 33052156.384173766,
    kaia: 65887029.28620768,
  },
  volumeUSD: {
    date: '2024-12-15',
    dragonSwap: 25256180.28793001,
    kaia: 30206565.982980352,
  },
} as const

const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-hidden relative">
      <Background />

      <div className="max-w-[1200px] mx-auto px-5">
        {/* Hero Section */}
        <div className="pt-20 pb-[120px]">
          <DragonSwapLogo size={100} className="hidden md:block" />

          <Title>{t('main-first-header-1')}</Title>
          <Title>{t('main-first-header-2')}</Title>

          <p className="mt-8 text-sm leading-6">{t('main-first-content-1')}</p>
          <p className="text-sm leading-6">{t('main-first-content-2')}</p>

          <div className="mt-8">
            <Link
              href="/swap"
              className={clsx(
                COMMON_BUTTON_STYLE,
                MD_BUTTON_STYLE,
                'bg-bold text-on-surface-inverse whitespace-nowrap',
              )}
            >
              {t('Trade Now')}
            </Link>
          </div>
        </div>

        {/* Volume Section */}
        <div className="py-[120px]">
          <Title>{t('main-second-header-1')}</Title>
          <Title>{t('main-second-header-2')}</Title>

          <p className="mt-8 text-sm leading-6 text-white/60">{t('main-second-content-1')}</p>

          <div className="mt-10">
            <Link href="/dashboard/v3" className="hover:opacity-70">
              <div className="relative px-4 py-5 bg-white bg-opacity-[0.02] rounded-[14px] border border-white/10 backdrop-blur-2xl">
                <DottedBackground />
                <div className="flex justify-between">
                  <div>
                    <div className="h-5">
                      <Image src="/images/home/logo_landscape.png" alt="DragonSwap" width={138} height={22} />
                    </div>
                    <p className="mt-2.5 text-sm">Volume Share</p>
                  </div>
                  <p className="text-4xl font-medium">
                    {((DATA.volumeUSD.dragonSwap / DATA.volumeUSD.kaia) * 100).toFixed(1)}
                    <span className="text-[28px]">%</span>
                  </p>
                </div>
                <Image
                  className="mx-auto -my-3"
                  src="/images/home/volume_chart.png"
                  alt={`Pie Chart: ${((DATA.volumeUSD.dragonSwap / DATA.volumeUSD.kaia) * 100).toFixed(1)}%`}
                  width={240}
                  height={240}
                />
                <div aria-hidden="true" className="mt-3 h-px w-full bg-white/20" />
                <div className="flex">
                  <div className="pt-2.5 pr-2.5 flex-1">
                    <p className="text-[10px]">DragonSwap Volume</p>
                    <p className="mt-2.5 text-2xl font-medium">
                      {formatDollarAmountV2({
                        num: DATA.volumeUSD.dragonSwap,
                        digits: 1,
                        withDollarSign: true,
                      })}
                    </p>
                  </div>
                  <div aria-hidden="true" className="w-px h-[68px] bg-white/20" />
                  <div className="pt-2.5 pl-4 flex-1">
                    <p className="text-[10px]">Kaia Ecosystem Volume</p>
                    <p className="mt-2.5 text-2xl font-medium">
                      {formatDollarAmountV2({
                        num: DATA.volumeUSD.kaia,
                        digits: 1,
                        withDollarSign: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Liquidity Section */}
        <div className="py-[120px]">
          <Title>{t('main-third-header-1')}</Title>

          <p className="mt-8 text-sm leading-6 text-white/60">{t('main-third-content-1')}</p>

          <div className="mt-5 flex flex-col space-y-8">
            <TvlCard
              title="DragonSwap TVL"
              value={formatDollarAmountV2({
                num: DATA.tvlUSD.dragonSwap,
                digits: 1,
                withDollarSign: true,
              })}
            />
            <TvlCard
              title="Kaia Ecosystem TVL"
              value={formatDollarAmountV2({
                num: DATA.tvlUSD.kaia,
                digits: 1,
                withDollarSign: true,
              })}
            />
            <TvlCard
              title="DragonSwap TVL Share"
              value={`${((DATA.tvlUSD.dragonSwap / DATA.tvlUSD.kaia) * 100).toFixed(2)}%`}
              valueClassName="text-green-400"
              chart={
                <Image
                  src="/images/home/tvl_chart.png"
                  alt={`Pie Chart: ${((DATA.tvlUSD.dragonSwap / DATA.tvlUSD.kaia) * 100).toFixed(2)}%`}
                  width={90}
                  height={90}
                />
              }
            />
          </div>
          <p className="mt-3 text-xs text-on-surface-subtlest text-right">{t('Dec, 2024')}</p>
        </div>
      </div>
    </div>
  )
}

function DottedBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 h-full w-full bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:14px_14px]"
    />
  )
}

function TvlCard({
  title,
  value,
  valueClassName,
  chart,
}: {
  title: string
  value: string
  valueClassName?: string
  chart?: ReactNode
}) {
  return (
    <div className="relative px-7 py-6 flex justify-between rounded-2xl border bg-white bg-opacity-[0.02] border-white/10 backdrop-blur-2xl">
      <DottedBackground />
      <div>
        <p className="text-sm text-white/70">{title}</p>
        <p className={clsx('mt-3 text-[40px] md:text-[60px] font-medium', valueClassName)}>{value}</p>
      </div>
      <div className="shrink-0">{chart}</div>
    </div>
  )
}

function LinkCard({
  href,
  title,
  icon,
  descriptionKey,
  screenshot,
}: {
  href: string
  title: string
  icon: ReactNode
  descriptionKey: string
  screenshot: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <Link href={href}>
      <div className="relative p-5 md:p-7 w-full rounded-[20px] bg-white bg-opacity-[0.04] border border-white/10 backdrop-blur-2xl hover:opacity-70">
        <ArrowUpRight className="absolute top-4 right-4" size={24} />

        <div className="flex items-center space-x-5">
          <div className="p-3 rounded-xl bg-white">{icon}</div>
          <p className="text-[32px]">{title}</p>
        </div>

        <span className="text-sm">
          <Trans t={t} i18nKey={descriptionKey} />
        </span>

        <div className="mt-5">{screenshot}</div>
      </div>
    </Link>
  )
}

const Title = ({ children, className }: { children: string; className?: string }) => (
  <h2 className={clsx('text-[32px] leading-normal md:text-[72px] break-keep', className)}>{children}</h2>
)

export const getStaticProps = getDefaultStaticProps(['common'])

export default HomePage
