import { inject, observer } from "mobx-react";

import Section, { SectionProps } from "@docspace/shared/components/section";

const SectionWrapper = ({
  children,

  ...rest
}: SectionProps) => {
  return <Section {...rest}>{children}</Section>;
};

export default inject(
  ({ auth, dialogsStore }: { auth: any; dialogsStore: any }) => {
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
      auth.infoPanelStore;

    const { createRoomDialogVisible, invitePanelOptions } = dialogsStore;

    const canDisplay = getCanDisplay();

    const anotherDialogOpen =
      createRoomDialogVisible || invitePanelOptions.visible;

    const { isScrollLocked: isInfoPanelScrollLocked } = auth.infoPanelStore;

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
