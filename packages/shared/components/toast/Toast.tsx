import React, { useCallback, useEffect, useState } from "react";
import { ToastClassName, cssTransition } from "react-toastify";
import { isMobileOnly } from "react-device-detect";

import StyledToastContainer from "./Toast.styled";
import { ToastProps } from "./Toast.type";

const Slide = cssTransition({
  enter: "SlideIn",
  exit: "SlideOut",
});

const Toast = (props: ToastProps) => {
  const [offset, setOffset] = useState(0);

  const onToastClick = () => {
    const documentElement = document.getElementsByClassName("Toastify__toast");
    if (documentElement.length > 1)
      for (let i = 0; i < documentElement.length; i += 1) {
        const el = documentElement[i] as HTMLElement;
        el.style.setProperty("position", "static");
      }
  };

  const onResize = useCallback((event: Event) => {
    if (window.visualViewport) {
      const target = event.target as Window;
      const topOffset = target.innerHeight - window.visualViewport.height;

      setOffset(topOffset);
    }
  }, []);

  const toastClassName: ToastClassName = (context) => {
    switch (context?.type) {
      case "success":
        return "Toastify__toast Toastify__toast--success";
      case "error":
        return "Toastify__toast Toastify__toast--error";
      case "info":
        return "Toastify__toast Toastify__toast--info";
      case "warning":
        return "Toastify__toast Toastify__toast--warning";
      default:
        return "Toastify__toast";
    }
  };

  useEffect(() => {
    if (isMobileOnly) {
      window.addEventListener("resize", onResize);
    }

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const { className, style } = props;

  return (
    <StyledToastContainer
      className={className}
      draggable
      position="top-right"
      toastClassName={toastClassName}
      rtl
      hideProgressBar
      newestOnTop
      pauseOnFocusLoss={false}
      style={style}
      transition={Slide}
      icon={false}
      onClick={onToastClick}
      $topOffset={offset}
      data-testid="toast"
    />
  );
};

export { Toast };
