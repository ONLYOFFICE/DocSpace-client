import { useCallback, useEffect, useState } from "react";
import { isMobileOnly } from "react-device-detect";

export const useMobileViewport = (): number => {
  const [offset, setOffset] = useState(16);

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
      return () => window.removeEventListener("resize", onResize);
    }
  }, [onResize]);

  return offset;
};
