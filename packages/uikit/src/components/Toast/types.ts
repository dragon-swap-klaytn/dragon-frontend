import { ReactNode } from "react";

export const types = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
  INFO: "info",
} as const;

export type Types = (typeof types)[keyof typeof types];

export interface ToastData {
  id: string | number;
  type: Types;
  title: ReactNode | string;
  description?: ReactNode | string;
}

export interface ToastProps {
  toast: ToastData;
  onRemove: (id: string | number) => void;
}
