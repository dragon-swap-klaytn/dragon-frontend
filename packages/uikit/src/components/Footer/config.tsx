import { Language } from "../LangSelector/types";
import { GithubIcon, MailIcon, MediumIcon, TelegramIcon, TwitterIcon } from "../Svg";
import { FooterLinkType } from "./types";

export const footerLinks: FooterLinkType[] = [
  {
    label: "Help",
    items: [
      {
        label: "Guides",
        href: "https://docs.dgswap.io/introduction/dragonswap-overview",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        label: "Github",
        href: "https://github.com/dragon-swap-klaytn",
      },
      {
        label: "Documentation",
        href: "https://docs.dgswap.io",
      },
    ],
  },
];

export const socials = [
  {
    label: "Twitter",
    icon: TwitterIcon,
    href: "https://twitter.com/dgswap",
  },
  {
    label: "Telegram",
    icon: TelegramIcon,
    items: [
      {
        label: "English",
        href: "https://t.me/DragonSwap_COMM",
      },
    ],
  },
  {
    label: "Github",
    icon: GithubIcon,
    href: "https://github.com/dragon-swap-klaytn",
  },
  {
    label: "Supprot",
    icon: MailIcon,
    href: "mailto:support@dgswap.io",
  },
  {
    label: "Medium",
    icon: MediumIcon,
    href: "https://dgswap.medium.com/",
  },
];

export const langs: Language[] = [...Array(20)].map((_, i) => ({
  code: `en${i}`,
  language: `English${i}`,
  locale: `Locale${i}`,
}));
