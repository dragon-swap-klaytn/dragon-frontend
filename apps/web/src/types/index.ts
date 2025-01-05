import { ValueOf } from 'type-fest'

export type ButtonProps = JSX.IntrinsicElements['button']
export type ButtonOnClickType = ValueOf<Pick<ButtonProps, 'onClick'>>
// export type TokenData = {
//   address: string
//   decimals: number
//   symbol: string
//   name: string
// }
