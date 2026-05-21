/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";

import Section, { SectionProps } from "@docspace/ui-kit/components/section";

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
