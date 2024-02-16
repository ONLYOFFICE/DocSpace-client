"use client";

import { DeviceType } from "@docspace/shared/enums";
import { isMobile, isTablet } from "@docspace/shared/utils";
import React from "react";

const useDeviceType = () => {
  const [currentDeviceType, setCurrentDeviceType] = React.useState(
    DeviceType.desktop,
  );

  const onResize = React.useCallback(() => {
    if (isMobile()) return setCurrentDeviceType(DeviceType.mobile);
    if (isTablet()) return setCurrentDeviceType(DeviceType.tablet);

    setCurrentDeviceType(DeviceType.desktop);
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined")
      window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return { currentDeviceType };
};

export default useDeviceType;
