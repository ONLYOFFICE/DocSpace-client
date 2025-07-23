// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";

import { DeviceType } from "@docspace/shared/enums";
import Section from "@docspace/shared/components/section";

import Bar from "SRC_DIR/components/Bar";

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
  isPortalRestoring?: boolean;
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
  isPortalRestoring,
}: ISectionProps) => {
  const location = useLocation();

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
      pathname={location.pathname}
    >
      {!isPortalRestoring ? (
        <Section.SectionHeader>
          <SectionHeaderContent />
        </Section.SectionHeader>
      ) : (
        <></>
      )}
      <Section.SectionWarning>
        <Bar />
      </Section.SectionWarning>
      <Section.SectionBody>{children}</Section.SectionBody>
    </Section>
  );
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
      isPortalRestoring,
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
      isPortalRestoring,
    };
  }
)(observer(SectionWrapper));
