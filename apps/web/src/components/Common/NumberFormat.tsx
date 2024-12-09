import React from 'react'
import { NumericFormatProps, NumericFormat } from 'react-number-format'

const NumberFormat = React.forwardRef<HTMLInputElement, NumericFormatProps>((props, ref) => {
  const { ...other } = props

  return <NumericFormat getInputRef={ref} {...other} />
})

export default NumberFormat
