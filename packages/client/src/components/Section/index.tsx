import { inject, observer } from "mobx-react";

import Section, { SectionProps } from "@docspace/shared/components/section";

const SectionWrapper = ({
  children,

  ...rest
}: SectionProps) => {
  return <Section {...rest}>{children}</Section>;
};

export default inject(
  ({
    settingsStore,
    dialogsStore,
    infoPanelStore,
  }: {
    settingsStore: any;
    dialogsStore: any;
    infoPanelStore: any;
  }) => {
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
      isInfoPanelVisible: isVisible,
      isMobileHidden,
      setIsInfoPanelVisible: setIsVisible,
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
