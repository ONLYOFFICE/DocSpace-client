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
import React from "react";
import { inject, observer } from "mobx-react";

import InfoPanelBodyGeneral from "./bodyGeneral";
import InfoPanelBodyTemplateGallery from "./bodyTemplateGallery";
import { InfoPanelBodyContentProps } from "./Body.types";

const InfoPanelBodyContent: React.FC<InfoPanelBodyContentProps> = ({
  isGallery,
  ...restProps
}) => {
  if (isGallery) return <InfoPanelBodyTemplateGallery />;

  const {
    selection,
    contactsTab,
    roomsView,
    fileView,
    getIsFiles,
    getIsRooms,
    maxImageUploadSize,
    editRoomDialogProps,
    createRoomDialogProps,
    templateEventVisible,
    avatarEditorDialogVisible,
    image,
    setAvatarEditorDialogVisible,
    onSaveRoomLogo,
    onChangeFile,
    setImage,
    checkIsExpiredLinkAsync,
    getIsAIAgent,
    getIsTrash,
    infoPanelItemsList,
    editAgentDialogProps,
    enablePlugins,
    isRecentFolder,
  } = restProps as Exclude<InfoPanelBodyContentProps, { isGallery: true }>;

  return (
    <InfoPanelBodyGeneral
      selection={selection}
      contactsTab={contactsTab}
      roomsView={roomsView}
      fileView={fileView}
      getIsFiles={getIsFiles}
      getIsRooms={getIsRooms}
      maxImageUploadSize={maxImageUploadSize}
      editRoomDialogProps={editRoomDialogProps}
      createRoomDialogProps={createRoomDialogProps}
      templateEventVisible={templateEventVisible}
      avatarEditorDialogVisible={avatarEditorDialogVisible}
      image={image}
      setAvatarEditorDialogVisible={setAvatarEditorDialogVisible}
      onSaveRoomLogo={onSaveRoomLogo}
      onChangeFile={onChangeFile}
      setImage={setImage}
      checkIsExpiredLinkAsync={checkIsExpiredLinkAsync}
      getIsAIAgent={getIsAIAgent}
      getIsTrash={getIsTrash}
      infoPanelItemsList={infoPanelItemsList}
      editAgentDialogProps={editAgentDialogProps}
      enablePlugins={enablePlugins}
      isRecentFolder={isRecentFolder}
    />
  );
};

export default inject(
  ({
    infoPanelStore,
    settingsStore,
    avatarEditorDialogStore,
    dialogsStore,
    peopleStore,
    filesActionsStore,
    pluginStore,
    treeFoldersStore,
  }: TStore) => {
    const { contactsTab } = peopleStore.usersStore;

    const { infoPanelItemsList } = pluginStore;

    const {
      roomsView,
      fileView,

      getIsFiles,
      getIsRooms,
      getIsAIAgent,
      getIsTrash,
    } = infoPanelStore;

    const { isExpiredLinkAsync } = filesActionsStore;
    const {
      editRoomDialogProps,
      editAgentDialogProps,
      createRoomDialogProps,
      templateEventVisible,
    } = dialogsStore;

    const {
      avatarEditorDialogVisible,
      image,

      setAvatarEditorDialogVisible,
      onSaveRoomLogo,
      onChangeFile,
      setImage,
    } = avatarEditorDialogStore;

    const selection = infoPanelStore.infoPanelSelection;

    return {
      contactsTab,
      selection,

      roomsView,
      fileView,
      getIsFiles,
      getIsRooms,
      getIsAIAgent,
      getIsTrash,

      infoPanelItemsList,

      enablePlugins: settingsStore.enablePlugins,
      isRecentFolder: treeFoldersStore.isRecentFolder,

      maxImageUploadSize: settingsStore.maxImageUploadSize,

      editRoomDialogProps,
      editAgentDialogProps,
      createRoomDialogProps,
      templateEventVisible,

      avatarEditorDialogVisible,
      image,

      setAvatarEditorDialogVisible,
      onSaveRoomLogo,
      onChangeFile,
      setImage,
      checkIsExpiredLinkAsync: isExpiredLinkAsync,
    };
  },
)(observer(InfoPanelBodyContent));
