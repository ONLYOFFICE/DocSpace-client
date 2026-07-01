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
 * Creative Commons Attribution-ShareAlike 4.0 International License.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { DeviceType } from "@docspace/shared/enums";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import { createGroup } from "SRC_DIR/helpers/contacts";
import { getSectionCreateButton } from "SRC_DIR/helpers/getSectionCreateButton";

import CreateButtonMobileView from "./CreateButtonMobileView";

type GetCreateModel = (
  t: unknown,
  isSectionMenu?: boolean,
) => ContextMenuModel[] | null;

type CreateButtonMobileProps = {
  currentClientView?: string;
  contactsTab?: string;
  isRoomsFolder?: boolean;
  isAIAgentsFolder?: boolean;
  selectedFolderId?: number | string;
  currentDeviceType?: DeviceType;
  showBodyLoader?: boolean;
  getFolderModel: GetCreateModel;
  getContactsModel: GetCreateModel;
  onCreateRoom: () => void;
  onCreateAgent: () => void;
  setMainButtonVisible?: (visible: boolean) => void;
};

const CreateButtonMobile = ({
  currentClientView,
  contactsTab,
  isRoomsFolder,
  isAIAgentsFolder,
  selectedFolderId,
  currentDeviceType,
  showBodyLoader,
  getFolderModel,
  getContactsModel,
  onCreateRoom,
  onCreateAgent,
  setMainButtonVisible,
}: CreateButtonMobileProps) => {
  const { t } = useTranslation(["Common", "Translations", "EmptyView"]);
  const location = useLocation();

  const isContactsPage =
    currentClientView === "users" || currentClientView === "groups";
  const isContactsGroupsPage = contactsTab === "groups";
  const isContactsGuestsPage = contactsTab === "guests";
  const isFormsSection = location.pathname.startsWith("/forms");

  const { showMainButton, mainButtonProps } = React.useMemo(
    () =>
      getSectionCreateButton({
        t,
        isContactsPage,
        isContactsGroupsPage,
        isContactsGuestsPage,
        isRoomsFolder: !!isRoomsFolder,
        isAIAgentsFolder: !!isAIAgentsFolder,
        isFormsSection,
        selectedFolderId,
        getFolderModel,
        getContactsModel,
        onCreateRoom,
        onCreateAgent,
        createGroup,
      }),
    [
      t,
      isContactsPage,
      isContactsGroupsPage,
      isContactsGuestsPage,
      isRoomsFolder,
      isAIAgentsFolder,
      isFormsSection,
      selectedFolderId,
      getFolderModel,
      getContactsModel,
      onCreateRoom,
      onCreateAgent,
    ],
  );

  const isDesktopView = currentDeviceType === DeviceType.desktop;
  const isCreateFabVisible = showMainButton && !isDesktopView && !showBodyLoader;

  React.useEffect(() => {
    setMainButtonVisible?.(isCreateFabVisible);
  }, [isCreateFabVisible, setMainButtonVisible]);

  React.useEffect(() => {
    return () => setMainButtonVisible?.(false);
  }, [setMainButtonVisible]);

  return (
    <CreateButtonMobileView
      visible={isCreateFabVisible}
      mainButtonProps={mainButtonProps}
    />
  );
};

export default inject(
  ({
    clientLoadingStore,
    treeFoldersStore,
    selectedFolderStore,
    settingsStore,
    filesStore,
    contextOptionsStore,
    peopleStore,
  }: TStore) => ({
    currentClientView: clientLoadingStore.currentClientView,
    contactsTab: peopleStore.usersStore.contactsTab,
    isRoomsFolder: treeFoldersStore.isRoomsFolder,
    isAIAgentsFolder: treeFoldersStore.isAIAgentsFolder,
    selectedFolderId: selectedFolderStore.id,
    currentDeviceType: settingsStore.currentDeviceType,
    showBodyLoader: clientLoadingStore.showBodyLoader,
    getFolderModel: contextOptionsStore.getFolderModel,
    getContactsModel: peopleStore.contextOptionsStore.getContactsModel,
    onCreateRoom: contextOptionsStore.onCreateRoom,
    onCreateAgent: contextOptionsStore.onCreateAgent,
    setMainButtonVisible: filesStore.setMainButtonVisible,
  }),
)(observer(CreateButtonMobile));
