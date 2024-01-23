import React from "react";
import { inject, observer } from "mobx-react";

import { DeviceType } from "@docspace/shared/enums";
import Section from "@docspace/shared/components/section";

import SectionHeaderContent from "./Header";

interface ISectionProps {
  children: React.ReactNode;
  isLoaded?: boolean;
  isDesktop?: boolean;
  currentDeviceType?: DeviceType;
  isVisible?: boolean;
  isMobileHidden?: boolean;
  setIsVisible?: (value: boolean) => void;
  canDisplay?: boolean;
  anotherDialogOpen?: boolean;
  isHeaderVisible?: boolean;
  isTabletView?: boolean;
  maintenanceExist?: boolean;
  snackbarExist?: boolean;
  showText?: boolean;
  isInfoPanelScrollLocked?: boolean;
}

const SectionWrapper = ({
  children,

  isDesktop,
  currentDeviceType,
  isVisible,
  isMobileHidden,
  setIsVisible,
  canDisplay,
  anotherDialogOpen,
  isHeaderVisible,
  isTabletView,
  maintenanceExist,
  snackbarExist,
  showText,
  isInfoPanelScrollLocked,
}: ISectionProps) => {
  return (
    <Section
      withBodyScroll
      settingsStudio
      isDesktop={isDesktop}
      currentDeviceType={currentDeviceType || DeviceType.desktop}
      isInfoPanelVisible={isVisible}
      setIsInfoPanelVisible={setIsVisible}
      isMobileHidden={isMobileHidden}
      canDisplay={canDisplay}
      anotherDialogOpen={anotherDialogOpen}
      isHeaderVisible={isHeaderVisible}
      isTabletView={isTabletView}
      maintenanceExist={maintenanceExist}
      snackbarExist={snackbarExist}
      showText={showText}
      isInfoPanelScrollLocked={isInfoPanelScrollLocked}
    >
      <Section.SectionHeader>
        <SectionHeaderContent />
      </Section.SectionHeader>

      <Section.SectionBody>{children}</Section.SectionBody>
    </Section>
  );
};

export default inject(
  ({
    auth,
    dialogsStore,
    infoPanelStore,
  }: {
    auth: any;
    dialogsStore: any;
    infoPanelStore: any;
  }) => {
    const { settingsStore } = auth;
    const {
      isDesktopClient: isDesktop,
      currentDeviceType,
      isHeaderVisible,
      isTabletView,
      maintenanceExist,
      snackbarExist,
      showText,
    } = settingsStore;

    const { isVisible, isMobileHidden, setIsVisible, getCanDisplay } =
      infoPanelStore;

    const { createRoomDialogVisible, invitePanelOptions } = dialogsStore;

    const canDisplay = getCanDisplay();

    const anotherDialogOpen =
      createRoomDialogVisible || invitePanelOptions.visible;

    const { isScrollLocked: isInfoPanelScrollLocked } = infoPanelStore;

    return {
      isDesktop,
      currentDeviceType,
      isVisible,
      isMobileHidden,
      setIsVisible,
      canDisplay,
      anotherDialogOpen,
      isHeaderVisible,
      isTabletView,
      maintenanceExist,
      snackbarExist,
      showText,
      isInfoPanelScrollLocked,
    };
  }
)(observer(SectionWrapper));
