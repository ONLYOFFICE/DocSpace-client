import { useState, useLayoutEffect } from "react";
import { size } from "@docspace/shared/utils";

export const useIsMobileView = () => {
  const [isMobileView, setIsMobileView] = useState(false);

  const onCheckView = () => {
    window.innerWidth <= size.mobile
      ? setIsMobileView(true)
      : setIsMobileView(false);
  };

  useLayoutEffect(() => {
    onCheckView();

    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  return isMobileView;
};
