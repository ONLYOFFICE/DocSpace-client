"use client";

import React from "react";

import { DeviceType } from "@docspace/shared/enums";

import { useSidebarShowText } from "@/components/apps-sidebar/useSidebarShowText";

type SidebarContextType = {
  showText: boolean;
  currentDeviceType: DeviceType;
  toggleShowText: () => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
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
  const { showText, toggleShowText } = useSidebarShowText({
    storageKey: SHOW_SIDEBAR_TEXT_KEY,
    currentDeviceType,
  });
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (currentDeviceType !== DeviceType.mobile) setIsSidebarOpen(false);
  }, [currentDeviceType]);

  const openSidebar = React.useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = React.useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = React.useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    [],
  );

  const value = React.useMemo(
    () => ({
      showText,
      currentDeviceType,
      toggleShowText,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [
      showText,
      currentDeviceType,
      toggleShowText,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    ],
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
