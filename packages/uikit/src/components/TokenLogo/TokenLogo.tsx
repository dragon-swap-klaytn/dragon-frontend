import getTokenIconSrcFromSs from "@pancakeswap/utils/getTokenIconSrcFromSs";
import clsx from "clsx";
import { useState } from "react";

const BAD_SRCS: { [imageSrc: string]: true } = {};

export interface TokenLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
  srcs: string[];
  className?: string;
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
const TokenLogo: React.FC<React.PropsWithChildren<TokenLogoProps>> = ({ srcs, alt, size, className }) => {
  const [, refresh] = useState<number>(0);

  const src = srcs.find((s) => !BAD_SRCS[s]) || (getTokenIconSrcFromSs("0x") as string);

  return (
    <div
      className={clsx("rounded-full overflow-hidden", className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <img
        className="w-full h-full"
        alt={alt}
        src={src}
        onError={() => {
          // eslint-disable-next-line no-param-reassign
          if (src) BAD_SRCS[src] = true;
          refresh((i) => i + 1);
        }}
        loading="lazy"
      />
    </div>
  );
};

export default TokenLogo;
