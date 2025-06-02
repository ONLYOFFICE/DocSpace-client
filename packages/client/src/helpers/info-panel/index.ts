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

import { Nullable } from "@docspace/shared/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TRoom } from "@docspace/shared/api/rooms/types";

import { TPeopleListItem } from "../contacts";

import { InfoPanelEvents } from "./enums";

export const showInfoPanel = () => {
  const event = new CustomEvent(InfoPanelEvents.showInfoPanel);

  window.dispatchEvent(event);
};

export const hideInfoPanel = () => {
  const event = new CustomEvent(InfoPanelEvents.hideInfoPanel);

  window.dispatchEvent(event);
};

export const setInfoPanelFile = (file: TFile) => {
  const event = new CustomEvent(InfoPanelEvents.setInfoPanelFile, {
    detail: { file },
  });

  window.dispatchEvent(event);
};

export const setInfoPanelFolder = (folder: TFolder) => {
  const event = new CustomEvent(InfoPanelEvents.setInfoPanelFolder, {
    detail: { folder },
  });

  window.dispatchEvent(event);
};

export const setInfoPanelRoom = (room: TRoom) => {
  const event = new CustomEvent(InfoPanelEvents.setInfoPanelRoom, {
    detail: { room },
  });

  window.dispatchEvent(event);
};

export const setInfoPanelSelectedRoom = (room: TRoom) => {
  const event = new CustomEvent(InfoPanelEvents.setInfoPanelSelectedRoom, {
    detail: { room },
  });

  window.dispatchEvent(event);
};

export const openShareTab = () => {
  const event = new CustomEvent(InfoPanelEvents.openShareTab);

  window.dispatchEvent(event);
};

export const openMembersTab = () => {
  const event = new CustomEvent(InfoPanelEvents.openMembersTab);

  window.dispatchEvent(event);
};

export const setFileView = () => {
  const event = new CustomEvent(InfoPanelEvents.setFileView);

  window.dispatchEvent(event);
};

export const setRoomsView = () => {
  const event = new CustomEvent(InfoPanelEvents.setRoomsView);

  window.dispatchEvent(event);
};

export const updateInfoPanelGroup = (group: TGroup) => {
  const event = new CustomEvent(InfoPanelEvents.updateInfoPanelGroup, {
    detail: { group },
  });

  window.dispatchEvent(event);
};

export const updateInfoPanelFile = (file: TFile) => {
  const event = new CustomEvent(InfoPanelEvents.updateInfoPanelFile, {
    detail: { file },
  });

  window.dispatchEvent(event);
};

export const updateInfoPanelFolder = (folder: TFolder) => {
  const event = new CustomEvent(InfoPanelEvents.updateInfoPanelFolder, {
    detail: { folder },
  });

  window.dispatchEvent(event);
};

export const updateInfoPanelRoom = (room: TRoom) => {
  const event = new CustomEvent(InfoPanelEvents.updateInfoPanelRoom, {
    detail: { room },
  });

  window.dispatchEvent(event);
};

export const getInfoPanelOpen = () => {
  const isVisible = !!document.getElementsByClassName("info-panel").length;
  return isVisible;
};
