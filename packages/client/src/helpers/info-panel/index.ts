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

import { TRoom } from "@docspace/shared/api/rooms/types";
import { Nullable } from "@docspace/shared/types";
import { InfoPanelEvents } from "@docspace/shared/enums";
import { INFO_PANEL_LOADER_EVENT } from "@docspace/shared/constants";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

export const enum InfoPanelView {
  infoMembers = "info_members",
  infoHistory = "info_history",
  infoDetails = "info_details",
  infoShare = "info_share",
}

export const showInfoPanel = () => {
  const event = new CustomEvent(InfoPanelEvents.showInfoPanel);

  window.dispatchEvent(event);
};

export const hideInfoPanel = () => {
  const event = new CustomEvent(InfoPanelEvents.hideInfoPanel);

  window.dispatchEvent(event);
};

export const setInfoPanelSelectedRoom = (
  room: Nullable<TRoom>,
  withCheck?: boolean,
) => {
  const event = new CustomEvent(InfoPanelEvents.setInfoPanelSelectedRoom, {
    detail: { room, withCheck },
  });

  window.dispatchEvent(event);
};

export const openShareTab = () => {
  const event = new CustomEvent(InfoPanelEvents.openShareTab);

  window.dispatchEvent(event);
};

export const refreshInfoPanel = () => {
  const event = new CustomEvent(InfoPanelEvents.refreshInfoPanel);

  window.dispatchEvent(event);
};

export const openMembersTab = () => {
  const event = new CustomEvent(InfoPanelEvents.openMembersTab);

  window.dispatchEvent(event);
};

export const setView = (view: string) => {
  const event = new CustomEvent(InfoPanelEvents.setView, {
    detail: { view },
  });

  window.dispatchEvent(event);
};

export const setFileView = (view: string) => {
  const event = new CustomEvent(InfoPanelEvents.setFileView, {
    detail: { view },
  });

  window.dispatchEvent(event);
};

export const setRoomsView = (view: string) => {
  const event = new CustomEvent(InfoPanelEvents.setRoomsView, {
    detail: { view },
  });

  window.dispatchEvent(event);
};

export const setInfoPanelMobileHidden = (value: boolean) => {
  const event = new CustomEvent(InfoPanelEvents.setInfoPanelMobileHidden, {
    detail: { value },
  });

  window.dispatchEvent(event);
};

export const getInfoPanelOpen = () => {
  const isVisible = !!document.getElementsByClassName("info-panel").length;

  return isVisible;
};

let loader = false;
export const showForcedInfoPanelLoader = () => {
  if (loader) return;

  loader = true;

  const event = new CustomEvent(INFO_PANEL_LOADER_EVENT, {
    detail: true,
  });

  window.dispatchEvent(event);
  window.dispatchEvent(new CustomEvent(AnimationEvents.Forced_Animation));

  setTimeout(() => {
    loader = false;
    const event = new CustomEvent(INFO_PANEL_LOADER_EVENT, {
      detail: false,
    });
    window.dispatchEvent(event);
  }, 400);
};
