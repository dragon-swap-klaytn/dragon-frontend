import { ExternalLink } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { CoingeckoLogo, GithubLogo, MediumLogo, TelegramLogo, TwitterLogo } from 'components/Vector'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

const EXTERNAL_LINKS = [
  {
    id: 'twitter',
    icon: <TwitterLogo />,
    href: 'https://twitter.com/dgswap',
  },
  {
    id: 'github',
    icon: <GithubLogo />,
    href: 'https://github.com/dragon-swap-klaytn',
  },
  {
    id: 'telegram',
    icon: <TelegramLogo />,
    href: 'https://t.me/DragonSwap_ANN',
  },
  {
    id: 'medium',
    icon: <MediumLogo />,
    href: 'https://dgswap.medium.com/',
  },
  {
    id: 'coingecko',
    icon: <CoingeckoLogo />,
    href: 'https://www.coingecko.com/en/exchanges/dragonswap-v3',
  },
]

export function ExternalLinks({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center gap-6 flex-wrap', className)}>
      {EXTERNAL_LINKS.map((link) => (
        <ExternalLink key={`footer:${link.id}`} href={link.href} hideIcon>
          {link.icon}
        </ExternalLink>
      ))}
    </div>
  )
}

export default function Footer() {
  const pathName = usePathname()
  const { locale } = useRouter()

  return (
    <div
      className={clsx('px-4 md:px-[60px] py-10 bg-transparent w-full max-w-layout mx-auto', {
        'mt-32 md:mt-52': pathName !== '/',
      })}
    >
      <div className="w-full flex flex-col space-y-10 md:space-y-2 md:flex-row-reverse md:items-start md:space-x-2 md:justify-between">
        <ExternalLinks />

        <div className="flex items-start space-x-12">
          <div className="flex flex-col items-start space-y-5">
            <h4 className="font-bold text-on-surface">Ecosystem</h4>

            <Link href="/swap" className="text-on-surface-subtlest hover:opacity-70">
              Swap
            </Link>

            <Link href="/pools" className="text-on-surface-subtlest hover:opacity-70">
              Pools
            </Link>

            <Link href="/dashboard/v3" className="text-on-surface-subtlest hover:opacity-70">
              Dashboard
            </Link>
          </div>
          <div className="flex flex-col items-start space-y-5">
            <h4 className="font-bold text-on-surface">Support</h4>

            <a
              href={
                locale === 'ko'
                  ? 'https://docs.dgswap.io/ko/community/contact-us'
                  : 'https://docs.dgswap.io/community/contact-us'
              }
              target="_blank"
              rel="noreferrer noopener"
              className="text-on-surface-subtlest hover:opacity-70"
            >
              Contact
            </a>
          </div>
          <div className="flex flex-col items-start space-y-5">
            <h4 className="font-bold text-on-surface">About</h4>
            <a
              href={locale === 'ko' ? 'https://docs.dgswap.io/ko' : 'https://docs.dgswap.io'}
              target="_blank"
              rel="noreferrer noopener"
              className="text-on-surface-subtlest hover:opacity-70"
            >
              Docs
            </a>

            <Link href="/terms" className="text-on-surface-subtlest hover:opacity-70">
              Terms Of Service
            </Link>
          </div>
        </div>
      </div>

      <p className="text-sm text-on-surface-subtlest py-4 border-t border-border mt-20">Ⓒ2024 - present DragonSwap</p>
    </div>
  )
}
