import { ToastClassName } from "react-toastify";
import { ToastType } from "../Toast.enums";

export const getToastClassName: ToastClassName = (context) => {
  const baseClass = "Toastify__toast";
  const type = context?.type as ToastType;

  if (!type) return baseClass;

  return `${baseClass} ${baseClass}--${type}`;
};
