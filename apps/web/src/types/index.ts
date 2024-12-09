import { ValueOf } from 'type-fest'

export type ButtonProps = JSX.IntrinsicElements['button']
export type ButtonOnClickType = ValueOf<Pick<ButtonProps, 'onClick'>>
