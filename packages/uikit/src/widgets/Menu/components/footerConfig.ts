import { ContextApi } from "@pancakeswap/localization";
import { FooterLinkType } from "../../../components/Footer/types";

export const footerLinks: (t: ContextApi["t"]) => FooterLinkType[] = (t) => [
  {
    label: t("Ecosystem"),
    items: [
      {
        label: t("Trade"),
        href: "/swap",
      },
      {
        label: t("Earn"),
        href: "/farms",
      },
    ],
  },
  {
    label: t("Support"),
    items: [
      {
        label: t("Contact"),
        href: "mailto:support@dgswap.io",
      },
    ],
  },
  {
    label: t("ABOUT"),
    items: [
      {
        label: t("Terms Of Service"),
        href: "/terms",
      },
    ],
  },
];
