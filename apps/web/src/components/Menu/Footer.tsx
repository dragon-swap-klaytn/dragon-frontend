import { ExternalLink } from '@pancakeswap/uikit'
import { Envelope, GithubLogo, MediumLogo, TelegramLogo, TwitterLogo } from '@phosphor-icons/react'
import clsx from 'clsx'
import Link from 'next/link'

const EXTERNAL_LINKS = [
  {
    id: 'twitter',
    icon: <TwitterLogo size={24} weight="fill" className="text-on-surface" />,
    href: 'https://twitter.com/dgswap',
  },
  {
    id: 'github',
    icon: <GithubLogo size={24} weight="fill" className="text-on-surface" />,
    href: 'https://github.com/dragon-swap-klaytn',
  },
  {
    id: 'telegram',
    icon: <TelegramLogo size={24} weight="fill" className="text-on-surface" />,
    href: 'https://t.me/DragonSwap_COMM',
  },
  {
    id: 'support',
    icon: <Envelope size={24} weight="fill" className="text-on-surface" />,
    href: 'mailto:support@dgswap.io',
  },
  {
    id: 'medium',
    icon: <MediumLogo size={24} weight="fill" className="text-on-surface" />,
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
    <div className="px-4 md:px-[60px] py-10 bg-transparent w-full mt-32 md:mt-52">
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
        </div>
      </div>

      <p className="text-sm text-on-surface-subtlest py-4 border-t border-border mt-20">Ⓒ2025 - present Dragonswap</p>
    </div>
  )
}
