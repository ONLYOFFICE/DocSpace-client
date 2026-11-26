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

import { canManagePrivateLinks as canManagePrivateLinksOf } from "@docspace/shared/services/private-room/private-links";

import InfoPanelHeaderTemplateGallery from "./headerTemplateGallery";
import InfoPanelHeaderGeneral from "./headerGeneral";
import { InfoPanelHeaderContentProps } from "./Header.types";

const InfoPanelHeaderContent = ({
  isGallery,
  onClose,
  ...restProps
}: InfoPanelHeaderContentProps) => {
  if (isGallery)
    return (
      <InfoPanelHeaderTemplateGallery onClose={onClose} isVisible={isGallery} />
    );

  const {
    selection,
    roomsView,
    fileView,
    setView,
    setIsVisible,
    getIsTrash,
    infoPanelItemsList,
    enablePlugins,
    isRecentFolder,
    isPrivacyFolder,
    canManagePrivateLinks,
    aiChatProjectId,
    isAiTemplate,
  } = restProps as Exclude<InfoPanelHeaderContentProps, { isGallery: true }>;

  return (
    <InfoPanelHeaderGeneral
      selection={selection}
      roomsView={roomsView}
      fileView={fileView}
      setView={setView}
      setIsVisible={setIsVisible}
      getIsTrash={getIsTrash}
      infoPanelItemsList={infoPanelItemsList}
      enablePlugins={enablePlugins}
      isRecentFolder={isRecentFolder}
      isPrivacyFolder={isPrivacyFolder}
      canManagePrivateLinks={canManagePrivateLinks}
      aiChatProjectId={aiChatProjectId}
      isAiTemplate={isAiTemplate}
    />
  );
};

export default inject(
  ({
    settingsStore,
    infoPanelStore,
    pluginStore,
    treeFoldersStore,
    aiProjectsStore,
    aiTemplatesStore,
  }: TStore) => {
    const { infoPanelItemsList } = pluginStore;

    const {
      roomsView,
      setView,

      setIsVisible,
      getIsTrash,
    } = infoPanelStore;

    const { enablePlugins } = settingsStore;

    const selection = infoPanelStore.infoPanelSelection;

    const { isRecentFolder, isPrivacyFolder } = treeFoldersStore;

    return {
      selection,
      roomsView,
      // A skill opens on its own tab (Details until another is picked).
      fileView: infoPanelStore.currentFileView,
      setView,

      setIsVisible,
      getIsTrash,

      infoPanelItemsList,

      enablePlugins,

      isRecentFolder,
      isPrivacyFolder,
      canManagePrivateLinks: canManagePrivateLinksOf(
        infoPanelStore.infoPanelRoomSelection,
      ),
      aiChatProjectId: aiProjectsStore.activeProject?.id ?? null,
      isAiTemplate: !!aiTemplatesStore.selected,
    };
  },
)(observer(InfoPanelHeaderContent));
