"use client";

import React from "react";

import { DeviceType } from "@docspace/shared/enums";

type SidebarContextType = {
  showText: boolean;
  currentDeviceType: DeviceType;
  toggleShowText: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

const SHOW_SIDEBAR_TEXT_KEY = "docs_showSidebarText";

export const SidebarProvider = ({
  children,
  currentDeviceType,
}: {
  children: React.ReactNode;
  currentDeviceType: DeviceType;
}) => {
  const [showText, setShowText] = React.useState(() => {
    if (typeof window === "undefined") return true;
    if (currentDeviceType === DeviceType.mobile) return false;
    if (currentDeviceType === DeviceType.tablet) {
      try {
        const saved = localStorage.getItem(SHOW_SIDEBAR_TEXT_KEY);
        return saved === null ? false : saved !== "false";
      } catch {
        return false;
      }
    }
    return true;
  });

  React.useEffect(() => {
    if (currentDeviceType === DeviceType.mobile) {
      setShowText(false);
    } else if (currentDeviceType === DeviceType.desktop) {
      setShowText(true);
    } else if (currentDeviceType === DeviceType.tablet) {
      try {
        const saved = localStorage.getItem(SHOW_SIDEBAR_TEXT_KEY);
        setShowText(saved === null ? false : saved !== "false");
      } catch {
        setShowText(false);
      }
    }
  }, [currentDeviceType]);

  const toggleShowText = React.useCallback(() => {
    setShowText((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SHOW_SIDEBAR_TEXT_KEY, String(next));
      } catch {
        // localStorage unavailable (incognito/restricted)
      }
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      showText,
      currentDeviceType,
      toggleShowText,
    }),
    [showText, currentDeviceType, toggleShowText],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
