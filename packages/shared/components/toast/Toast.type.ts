import { ToastType } from "./Toast.enums";

export interface ToastProps {
  /** Accepts class  */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Title inside a toast */
  title: string;
  /** Sets the color and icon of the toast */
  type: ToastType;
}

export type TData = {
  response?: { data: { error: { message: string } } };
  statusText?: string;
  message?: string;
};
