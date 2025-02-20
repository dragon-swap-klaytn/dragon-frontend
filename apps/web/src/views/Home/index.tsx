import { useTranslation } from '@pancakeswap/localization'
import { COMMON_BUTTON_STYLE, DragonSwapLogo, MD_BUTTON_STYLE } from '@pancakeswap/uikit'
import { ArrowsClockwise, ArrowUpRight, SwimmingPool } from '@phosphor-icons/react'
import clsx from 'clsx'
import Link from 'next/link'
import Background from 'views/Home/components/Background'

const Home: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-[1200px] mx-auto pt-[80px] pb-[200px] px-4 relative">
      <div className="flex flex-col items-start space-y-8">
        <DragonSwapLogo size={100} className="hidden md:block" />

        <div>
          <Title>{t('main-first-header-1')}</Title>
          <Title>{t('main-first-header-2')}</Title>
        </div>

        <div>
          <Description>{t('main-first-content-1')}</Description>
          <Description>{t('main-first-content-2')}</Description>
        </div>

        <Link
          href="/swap"
          className={clsx(COMMON_BUTTON_STYLE, MD_BUTTON_STYLE, 'bg-bold text-on-surface-inverse whitespace-nowrap')}
        >
          {t('Trade Now')}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
          {/* TODO: */}
          <HomeCard title={t('DragonSwap TVL')} value="$00M" />
          <HomeCard title={t('Kaia Ecosystem TVL')} value="$00M" />
          <HomeCard title={t('DragonSwap TVL Share')} value="00.0%" />
        </div>
      </div>

      <div className="flex flex-col items-start space-y-8 mt-[320px]">
        <div>
          <Title>{t('main-second-header-1')}</Title>
          <Title>{t('main-second-header-2')}</Title>
        </div>

        <div>
          <Description>{t('main-second-content-1')}</Description>
          <Description>{t('main-second-content-2')}</Description>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
          {/* TODO: */}
          <HomeCard title={t('DragonSwap Volume')} value="$00M" />
          <HomeCard title={t('Kaia Ecosystem Volume')} value="$00M" />
          <HomeCard title={t('DragonSwap Volume Share')} value="00.0%" />
        </div>
      </div>

      <div className="flex flex-col items-start space-y-8 mt-[320px]">
        <Title>{t('main-third-header-1')}</Title>

        <div>
          <Description>{t('main-third-content-1')}</Description>
          <Description>{t('main-third-content-2')}</Description>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
          <LinkCard type="swap" />
          <LinkCard type="pools" />
        </div>
      </div>

      <Background />
    </div>
  )
}

function HomeCard({ title, value, subValue }: { title: string; value: string; subValue?: string }) {
  return (
    <div className="p-5 md:p-7 flex space-x-3 md:flex-col justify-between items-start md:space-x-0 md:space-y-4 text-on-surface rounded-2xl border border-[#ffffff1a] bg-[#ffffff05] w-full backdrop-blur-[40px]">
      <h4 className="text-sm">{title}</h4>
      <span className="text-[32px] md:text-[60px]">{value}</span>
      {subValue && <span className="text-sm">{subValue}</span>}
    </div>
  )
}

function LinkCard({ type }: { type: 'swap' | 'pools' }) {
  const { t } = useTranslation()

  return (
    <Link
      href={type === 'swap' ? '/swap' : '/pools'}
      className="p-5 md:p-7 flex flex-col justify-between space-y-[72px] text-on-surface rounded-2xl border border-[#ffffff1a] bg-[#ffffff05] w-full backdrop-blur-[40px] hover:opacity-70"
    >
      <div className="flex items-start space-x-2 w-full justify-between">
        <div className="p-3 rounded-lg bg-white">
          {type === 'swap' ? (
            <ArrowsClockwise size={24} className="text-black" />
          ) : (
            <SwimmingPool size={24} className="text-black" />
          )}
        </div>

        <ArrowUpRight size={24} className="text-white" />
      </div>

      <span className="text-[40px] text-on-surface">{type === 'swap' ? t('Swap') : t('Pools')}</span>
    </Link>
  )
}

const Title = ({ children }: { children: string }) => (
  <h2 className="text-[40px] md:text-[72px] text-on-surface">{children}</h2>
)

const Description = ({ children }: { children: string }) => <p className="text-lg text-on-surface">{children}</p>

export default Home
