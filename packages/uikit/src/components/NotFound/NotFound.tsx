import { useTranslation } from "@pancakeswap/localization";
import clsx from "clsx";
import Link from "next/link";
import { JSXElementConstructor, ReactNode } from "react";
import { COMMON_BUTTON_STYLE, MD_BUTTON_STYLE, PRIMARY_BUTTON_STYLE } from "../Common";

const NotFound = ({
  statusCode = 404,
  children,
}: {
  LinkComp: JSXElementConstructor<any>;
  statusCode?: number;
  children: ReactNode;
}) => {
  const { t } = useTranslation();

  return (
    <>
      {children}
      <div className="flex flex-col items-center justify-center space-y-3 h-[60vh]">
        <p className="font-bold text-4xl text-on-surface">{statusCode}</p>
        <p className="text-on-surface text-lg">{t("Oops, page not found.")}</p>

        <Link href="/" className={clsx(COMMON_BUTTON_STYLE, MD_BUTTON_STYLE, PRIMARY_BUTTON_STYLE)}>
          {t("Back Home")}
        </Link>
      </div>
    </>
  );
};

export default NotFound;
