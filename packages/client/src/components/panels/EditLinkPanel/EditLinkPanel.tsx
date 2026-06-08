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
import type { FC } from "react";
import { inject, observer } from "mobx-react";
import { useSearchParams } from "react-router";

import EditLinkPanel from "@docspace/shared/dialogs/EditLinkPanel";
import { isRoom } from "@docspace/shared/utils/typeGuards";
import { FolderType } from "@docspace/shared/enums";

import type { InjectedEditLinkPanelProps } from "./EditLinkPanel.types";

const EditLinkPanelWrapper = ({
  link,
  item,
  language,
  passwordSettings,
  visible,
  setIsVisible,
  updateLink,
  setLinkParams,
  setExternalLink,
  currentDeviceType,
  getPortalPasswordSettings,
  isExternalShareRestricted,
}: InjectedEditLinkPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <EditLinkPanel
      {...{
        link,
        item,
        language,
        visible,
        setIsVisible,
        updateLink,
        setLinkParams,
        setExternalLink,
        passwordSettings,
        currentDeviceType,
        getPortalPasswordSettings,
        searchParams,
        setSearchParams,
        isExternalShareRestricted,
      }}
    />
  );
};

export default inject<TStore>(
  ({
    authStore,
    settingsStore,
    dialogsStore,
    publicRoomStore,
    filesSettingsStore,
  }) => {
    const {
      editLinkPanelIsVisible,
      setEditLinkPanelIsVisible,
      linkParams,
      setLinkParams,
    } = dialogsStore;

    const { externalLinks, setExternalLink } = publicRoomStore;
    const { currentDeviceType, passwordSettings, getPortalPasswordSettings } =
      settingsStore;

    const { item, updateLink } = linkParams ?? {};
    const linkId = linkParams?.link?.sharedTo?.id;

    const link = isRoom(item)
      ? externalLinks.find((l) => l?.sharedTo?.id === linkId)
      : linkParams?.link;

    const {
      isExternalShareRestricted: isShareRestricted,
      externalShareApplyToDocuments,
      externalShareApplyToRooms,
    } = filesSettingsStore;

    const isInRoom = item?.rootFolderType === FolderType.Rooms;
    const isExternalShareRestricted =
      isShareRestricted &&
      (isInRoom ? externalShareApplyToRooms : externalShareApplyToDocuments);

    return {
      link,
      item,
      language: authStore.language,
      passwordSettings,

      visible: editLinkPanelIsVisible,
      setIsVisible: setEditLinkPanelIsVisible,
      updateLink,
      setLinkParams,
      setExternalLink,

      currentDeviceType,
      getPortalPasswordSettings,
      isExternalShareRestricted,
    };
  },
)(observer(EditLinkPanelWrapper as FC));
