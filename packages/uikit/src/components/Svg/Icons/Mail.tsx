import * as React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 32 32" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm.223-16.898c1.31 0 7.68-3.582 7.68-3.582l.01-.64c0-.707-.573-1.28-1.282-1.28H9.815c-.708 0-1.282.573-1.282 1.28v.57s6.44 3.652 7.69 3.652zm0 1.76c-1.25 0-7.68-3.422-7.68-3.422l-.01 7.68c0 .707.574 1.28 1.282 1.28H22.63c.709 0 1.282-.573 1.282-1.28l-.01-7.68s-6.31 3.422-7.68 3.422z"
        transform="translate(-1308 -2846) translate(1308 2846)"
      />
    </Svg>
  );
};

export default Icon;
