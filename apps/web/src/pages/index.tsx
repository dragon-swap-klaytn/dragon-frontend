import { Trans, useTranslation } from '@pancakeswap/localization'
import { COMMON_BUTTON_STYLE, DragonSwapLogo, MD_BUTTON_STYLE } from '@pancakeswap/uikit'
import { ArrowsCounterClockwise, ArrowUpRight, SwimmingPool } from '@phosphor-icons/react'
import clsx from 'clsx'
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

const PARTNERS = ['kaia', 'swapscanner', 'knight_fury', 'smart_layer', 'superwalk', 'fusionist']

const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-hidden">
      <div
        className="absolute top-14 -left-1/2 translate-x-1/2 w-full h-[700px] lg:h-[880px] bg-center bg-cover"
        style={{ backgroundImage: 'url(/images/home/background_waves_2.webp)' }}
      />
      <div className="relative z-10 bg-black/30 bg-blend-color-dodge">
        <div className="relative max-w-[1200px] mx-auto px-5 md:px-8 lg:px-12">
          <Background />
          {/* Hero Section */}
          <div className="pt-20 pb-[120px] lg:pb-[160px] xl:pb-[200px]">
            <DragonSwapLogo size={100} className="mb-8 hidden h-16 w-16 md:block xl:h-[100px] xl:w-[100px]" />

            <Title>
              {t('main-first-header-1')}
              <br />
              {t('main-first-header-2')}
            </Title>

            <Description className="mt-8 xl:!max-w-5xl">
              {t('main-first-content-1')}
              <br />
              {t('main-first-content-2')}
            </Description>

            <div className="mt-8">
              <Link
                href="/swap"
                className={clsx(
                  COMMON_BUTTON_STYLE,
                  MD_BUTTON_STYLE,
                  'inline-block bg-bold text-on-surface-inverse whitespace-nowrap',
                )}
              >
                {t('Trade Now')}
              </Link>
            </div>
          </div>

          {/* Volume Section */}
          <div className="py-[60px] lg:py-[70px] xl:py-[80px] lg:flex justify-between items-center gap-12">
            <div>
              <Title>
                {t('main-second-header-1')}
                <br />
                {t('main-second-header-2')}
              </Title>

              <Description className="mt-8 text-white/60">
                <Trans
                  t={t}
                  i18nKey="main-second-content-1"
                  components={{
                    w: <span className="text-on-surface" />,
                  }}
                />
              </Description>
            </div>

            <div className="mt-10 flex-1">
              <div className="max-w-xs xl:max-w-[480px] mx-auto">
                <div className="relative px-4 py-5 xl:px-6 xl:py-6 bg-white bg-opacity-[0.02] rounded-[14px] border border-white/10 backdrop-blur-2xl">
                  <DottedBackground />
                  <div className="flex justify-between items-center">
                    <div>
                      <img
                        className="h-5 w-auto xl:h-8"
                        src="/images/home/logo_landscape.png"
                        alt="DragonSwap"
                        width={138}
                        height={22}
                      />
                      <p className="mt-2.5 text-sm xl:text-xl">Volume Share</p>
                    </div>
                    <p className="text-4xl xl:text-[52px] font-medium">
                      {((DATA.volumeUSD.dragonSwap / DATA.volumeUSD.kaia) * 100).toFixed(1)}
                      <span className="text-[28px] xl:text-[40px]">%</span>
                    </p>
                  </div>
                  <img
                    className="relative mx-auto -my-3 xl:my-4 w-60 xl:w-72"
                    src="/images/home/volume_chart.png"
                    alt={`Pie Chart: ${((DATA.volumeUSD.dragonSwap / DATA.volumeUSD.kaia) * 100).toFixed(1)}%`}
                    width={240}
                    height={240}
                  />
                  <div aria-hidden="true" className="mt-3 h-px w-full bg-white/20" />
                  <div className="flex">
                    <div className="pt-2.5 xl:pt-4 pr-2.5 xl:pr-4 flex-1">
                      <p className="text-[10px] xl:text-sm">DragonSwap Volume</p>
                      <p className="mt-2.5 xl:mt-3 text-2xl xl:text-4xl font-medium">
                        {formatDollarAmountV2({
                          num: DATA.volumeUSD.dragonSwap,
                          digits: 1,
                          withDollarSign: true,
                        })}
                      </p>
                    </div>
                    <div aria-hidden="true" className="w-px self-stretch bg-white/20" />
                    <div className="pt-2.5 xl:pt-4 pl-4 xl:pl-6 flex-1">
                      <p className="text-[10px] xl:text-sm">Kaia Ecosystem Volume</p>
                      <p className="mt-2.5 xl:mt-3 text-2xl xl:text-4xl font-medium">
                        {formatDollarAmountV2({
                          num: DATA.volumeUSD.kaia,
                          digits: 1,
                          withDollarSign: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liquidity Section */}
          <div className="py-[120px] lg:py-[160px] xl:py-[200px]">
            <Title className="max-w-lg">{t('main-third-header-1')}</Title>

            <Description className="mt-8 text-white/60">
              <Trans t={t} i18nKey="main-third-content-1" components={{ w: <span className="text-on-surface" /> }} />
            </Description>

            <div className="mt-5 lg:mt-8 flex flex-col gap-8 lg:grid grid-cols-10 xl:grid-cols-3 lg:gap-4 xl:gap-8">
              <TvlCard
                className="col-span-3 xl:col-span-1"
                title="DragonSwap TVL"
                value={formatDollarAmountV2({
                  num: DATA.tvlUSD.dragonSwap,
                  digits: 1,
                  withDollarSign: true,
                })}
              />
              <TvlCard
                className="col-span-3 xl:col-span-1"
                title="Kaia Ecosystem TVL"
                value={formatDollarAmountV2({
                  num: DATA.tvlUSD.kaia,
                  digits: 1,
                  withDollarSign: true,
                })}
              />
              <TvlCard
                className="col-span-4 xl:col-span-1"
                title="DragonSwap TVL Share"
                value={`${((DATA.tvlUSD.dragonSwap / DATA.tvlUSD.kaia) * 100).toFixed(2)}%`}
                valueClassName="text-green-400"
                chart={
                  <img
                    className="relative"
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

          {/* Features Section */}
          <div className="py-[120px] lg:pb-[160px] xl:pb-[200px]">
            <div className="flex flex-col lg:grid grid-cols-2 gap-8 lg:gap-4 xl:gap-8">
              <FeatureCard
                href="/swap"
                title={t('Swap')}
                icon={<ArrowsCounterClockwise size={24} className="text-black" />}
                descriptionKey="main-swap-description"
                screenshot={
                  <div className="h-[300px] lg:h-[400px] pt-[46px] lg:pt-[56px] bg-[#050404] rounded-xl overflow-hidden">
                    <img
                      className="mx-auto w-56 lg:w-[360px]"
                      src="/images/home/screenshot_swap.png"
                      alt="Swap page screenshot"
                      width={215}
                      height={330}
                    />
                  </div>
                }
              />
              <FeatureCard
                href="/pools"
                title={t('Pools')}
                icon={<SwimmingPool size={24} className="text-black" />}
                descriptionKey="main-pools-description"
                screenshot={
                  <div className="h-[300px] lg:h-[400px] flex justify-center items-center bg-[#050404] rounded-xl overflow-hidden">
                    <img
                      className="h-64 w-auto max-w-[80%] lg:h-auto lg:w-96 object-contain"
                      src="/images/home/screenshot_pools.png"
                      alt="Pools page screenshot"
                      width={234}
                      height={164}
                    />
                  </div>
                }
              />
            </div>
          </div>

          {/* Partners Section */}
          <div className="py-[120px] lg:pb-[160px] xl:pb-[200px]">
            <Title>{t('Partnership')}</Title>

            <Description className="mt-8 text-white/60">{t('main-partnership-content')}</Description>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-y-20">
              {PARTNERS.map((partner) => (
                <div
                  key={`partner-${partner}`}
                  className="px-2 s:px-4 sm:px-8 lg:px-12 py-3 flex justify-center items-center"
                >
                  <img className="object-contain" src={`/images/home/partners/partner_${partner}.png`} alt={partner} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={clsx('text-[32px] !leading-normal md:text-4xl xl:text-6xl md:!leading-snug break-keep', className)}>
      {children}
    </h2>
  )
}

function Description({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={clsx('text-sm leading-6 max-w-lg md:!leading-normal md:text-base xl:text-lg break-keep', className)}>
      {children}
    </p>
  )
}

function DottedBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 h-full w-full bg-[radial-gradient(#ffffff14_1px,transparent_1px)] [background-size:12px_12px]"
    />
  )
}

function TvlCard({
  className,
  title,
  value,
  valueClassName,
  chart,
}: {
  className?: string
  title: string
  value: string
  valueClassName?: string
  chart?: ReactNode
}) {
  return (
    <div
      className={clsx(
        'relative px-7 py-6 flex justify-between items-center rounded-2xl border bg-white bg-opacity-[0.03] border-white/10 backdrop-blur-2xl',
        className,
      )}
    >
      <DottedBackground />
      <div>
        <p className="text-sm text-white/70 whitespace-nowrap">{title}</p>
        <p className={clsx('mt-3 text-[40px] lg:text-4xl xl:text-5xl font-medium', valueClassName)}>{value}</p>
      </div>
      <div className="shrink-0">{chart}</div>
    </div>
  )
}

function FeatureCard({
  className,
  href,
  title,
  icon,
  descriptionKey,
  screenshot,
}: {
  className?: string
  href: string
  title: string
  icon: ReactNode
  descriptionKey: string
  screenshot: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <Link href={href} className={className}>
      <div className="relative p-5 md:p-7 flex flex-col w-full h-full rounded-[20px] bg-white bg-opacity-[0.04] border border-white/10 backdrop-blur-2xl hover:bg-opacity-[0.08] transition-colors duration-200">
        <ArrowUpRight className="absolute top-4 right-4" size={24} />

        <div className="flex items-center space-x-5">
          <div className="p-3 rounded-xl bg-white">{icon}</div>
          <p className="text-[32px] lg:text-[40px]">{title}</p>
        </div>

        <p className="mt-5 text-sm lg:text-base text-white/60 leading-6">
          <Trans
            t={t}
            i18nKey={descriptionKey}
            components={{
              w: <span className="text-on-surface" />,
            }}
          />
        </p>

        <div aria-hidden="true" className="flex-grow" />

        <div className="mt-5">{screenshot}</div>
      </div>
    </Link>
  )
}

export const getStaticProps = getDefaultStaticProps(['common'])

export default HomePage
