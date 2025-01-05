import React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

export const NumberFormat = React.forwardRef<HTMLInputElement, NumericFormatProps>((props, ref) => {
  const { ...other } = props;

  return <NumericFormat getInputRef={ref} {...other} />;
});
