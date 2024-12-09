import { BoxProps } from "../../components/Box";

export interface ModalTheme {
  background: string;
}

export type Handler = () => void;
export type HandlerWithArgs = (...args: any[]) => void;

export interface InjectedProps {
  onDismiss?: Handler;
  mode?: string;
}

export interface ModalWrapperProps extends InjectedProps, Omit<BoxProps, "title" | "content"> {
  hideCloseButton?: boolean;
  className?: string;
}

export interface ModalProps extends ModalWrapperProps {
  title: React.ReactNode;
  hideCloseButton?: boolean;
  onBack?: () => void;
  headerPadding?: string;
  bodyPadding?: string;
  headerBackground?: string;
  headerRightSlot?: React.ReactNode;
  bodyAlignItems?: string;
  headerBorderColor?: string;
  bodyTop?: string;
}
