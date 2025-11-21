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

import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";

import Section, { SectionProps } from "@docspace/shared/components/section";

const SectionWrapper = ({
  children,
  viewAs,

  ...rest
}: SectionProps) => {
  const location = useLocation();
  const isInfoPanelAvailable = viewAs !== "settings";

  return (
    <Section
      {...rest}
      pathname={location.pathname}
      isInfoPanelAvailable={isInfoPanelAvailable}
    >
      {children}
    </Section>
  );
};

export default inject(
  ({
    settingsStore,
    dialogsStore,
    infoPanelStore,
    indexingStore,
    filesSettingsStore,
    selectedFolderStore,
    userStore,
  }: {
    settingsStore: TStore["settingsStore"];
    dialogsStore: TStore["dialogsStore"];
    infoPanelStore: TStore["infoPanelStore"];
    indexingStore: TStore["indexingStore"];
    filesSettingsStore: TStore["filesSettingsStore"];
    selectedFolderStore: TStore["selectedFolderStore"];
    userStore: TStore["userStore"];
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

    const { isIndexEditingMode } = indexingStore;

    const { createRoomDialogVisible, invitePanelOptions } = dialogsStore;

    const canDisplay = getCanDisplay();

    const anotherDialogOpen =
      createRoomDialogVisible || invitePanelOptions.visible;

    const { isScrollLocked: isInfoPanelScrollLocked } = infoPanelStore;

    const { getIcon, displayFileExtension } = filesSettingsStore;

    const { id } = selectedFolderStore;

    const { user } = userStore;

    return {
      isDesktop,
      currentDeviceType,
      isInfoPanelVisible: isVisible && !isIndexEditingMode,
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

      getIcon,
      displayFileExtension,
      aiSelectedFolder: id,

      user,
    };
  },
)(observer(SectionWrapper));
