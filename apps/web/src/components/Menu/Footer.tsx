import { ExternalLink } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { EmailLogo, GithubLogo, MediumLogo, TelegramLogo, TwitterLogo } from 'components/Vector'
import Link from 'next/link'

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
    href: 'https://t.me/DragonSwap_COMM',
  },
  {
    id: 'support',
    icon: <EmailLogo />,
    href: 'mailto:support@dgswap.io',
  },
  {
    id: 'medium',
    icon: <MediumLogo />,
    href: 'https://dgswap.medium.com/',
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
  return (
    <div className="px-4 md:px-[60px] py-10 bg-transparent w-full mt-32 md:mt-52 max-w-layout mx-auto">
      <div className="w-full flex flex-col space-y-10 md:space-y-2 md:flex-row md:items-start md:space-x-2 md:justify-between">
        <ExternalLinks />

        <div className="flex items-start space-x-12">
          <div className="flex flex-col items-start space-y-5">
            <h4 className="font-bold text-on-surface">Ecosystem</h4>

            <Link href="/swap" className="text-on-surface-subtlest">
              Swap
            </Link>

            <Link href="/pools" className="text-on-surface-subtlest">
              Pools
            </Link>

            <Link href="/dashboard/v3" className="text-on-surface-subtlest">
              Dashboard
            </Link>
          </div>
          <div className="flex flex-col items-start space-y-5">
            <h4 className="font-bold text-on-surface">Support</h4>

            <a
              href="mailto:support@dgswap.io"
              target="_blank"
              rel="noreferrer noopener"
              className="text-on-surface-subtlest"
            >
              Contact
            </a>
          </div>
          <div className="flex flex-col items-start space-y-5">
            <h4 className="font-bold text-on-surface">About</h4>
            {/* TODO: add ko docs */}
            <a
              href="https://docs.dgswap.io/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-on-surface-subtlest"
            >
              Docs
            </a>

            <Link href="/terms" className="text-on-surface-subtlest">
              Terms Of Service
            </Link>
          </div>
        </div>
      </div>

      <p className="text-sm text-on-surface-subtlest py-4 border-t border-border mt-20">Ⓒ2025 - present Dragonswap</p>
    </div>
  )
}
