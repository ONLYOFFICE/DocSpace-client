import { useState, useEffect, useCallback } from "react";
import { isDesktop } from "react-device-detect";

export const useIsSmallWindow = (windowWidth: number): boolean => {
  const [isSmallWindow, setIsSmallWindow] = useState(false);

  const onCheckView = useCallback(() => {
    if (isDesktop && window.innerWidth < windowWidth) {
      setIsSmallWindow(true);
    } else {
      setIsSmallWindow(false);
    }
  }, [windowWidth]);

  useEffect(() => {
    onCheckView();

    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, [onCheckView]);

  return isSmallWindow;
};
