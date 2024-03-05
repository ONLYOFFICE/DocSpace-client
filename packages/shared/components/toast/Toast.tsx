import React, { useCallback, useEffect, useState } from "react";
import { cssTransition } from "react-toastify";
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
      hideProgressBar
      newestOnTop
      pauseOnFocusLoss={false}
      style={style}
      transition={Slide}
      onClick={onToastClick}
      $topOffset={offset}
      data-testid="toast"
    />
  );
};

export { Toast };
