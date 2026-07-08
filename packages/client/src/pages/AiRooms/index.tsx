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

// (c) Copyright Ascensio System SIA 2009-2026
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
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";

import { useSdkFrame } from "SRC_DIR/components/SdkFrameHost/useSdkFrame";

type AiRoomsProps = {
  roomsFolderId?: number | null;
};

// Sections that live inside the SDK `(rooms)` route group — served by the
// "ai-rooms" frame and switched via the rooms bridge postMessage (no swap).
// `recent`/`favorites`/`trash` live in the separate `(personal-files)`
// group, served by a second "ai-rooms-personal" frame; crossing between the
// two frames is an ordinary host dim-transition (the previous content stays
// dimmed until the new frame loads — no white flash).
const GROUP_SECTIONS: ReadonlySet<string> = new Set(["rooms", "archive"]);

const ROOMS_FRAME_ID = "ai-rooms";
const PERSONAL_FRAME_ID = "ai-rooms-personal";

// Entry URL for the rooms-group frame. Must reflect the section the frame is
// FIRST shown for (rooms vs archive) — `src` is frozen per frame, so a frame
// entered via `archive` must load `/sdk/archive`, not `/sdk/rooms`.
const getGroupSrc = (section: string): string =>
  section === "archive" ? "/sdk/archive" : "/sdk/rooms";

const getPersonalSrc = (
  section: string,
  roomsFolderId?: number | null,
): string => {
  const parentIdParam =
    roomsFolderId != null ? `?parentId=${roomsFolderId}` : "";

  switch (section) {
    case "favorites":
      return `/sdk/personal-files/favorites${parentIdParam}`;
    case "recent":
      return `/sdk/personal-files/recent${parentIdParam}`;
    case "trash":
      return `/sdk/personal-files/trash${parentIdParam}`;
    default:
      return `/sdk/personal-files${parentIdParam}`;
  }
};

const AiRooms = ({ roomsFolderId }: AiRoomsProps) => {
  const { t } = useTranslation(["Common"]);
  useDocumentTitle("Common:DashboardRoomsTitle");
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("section") ?? "";
  // Default (no `?section=`) is the rooms list.
  const target = section || "rooms";

  // Which frame serves this section. Crossing between the two frames is a
  // host dim-transition; within a frame, sections switch via postMessage.
  const isGroup = GROUP_SECTIONS.has(target);
  const appId = isGroup ? ROOMS_FRAME_ID : PERSONAL_FRAME_ID;

  const lastSdkSectionRef = React.useRef<string | null>(null);

  const setSearchParamsRef = React.useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;
  const targetRef = React.useRef(target);
  targetRef.current = target;
  const roomsFolderIdRef = React.useRef(roomsFolderId);
  roomsFolderIdRef.current = roomsFolderId;

  // Iframe -> parent: the SDK reports its section on internal navigation.
  // The rooms bridge emits `rooms`/`archive`; the personal-files bridge
  // emits `recent`/`favorites`/`trash`. Both map straight onto the host
  // `?section=` (`rooms` clears it to match the sidebar default).
  const handleSdkNavigate = React.useCallback((sdkSection: string) => {
    lastSdkSectionRef.current = sdkSection;
    setSearchParamsRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (sdkSection && sdkSection !== "rooms" && sdkSection !== "my-documents") {
          next.set("section", sdkSection);
        } else {
          next.delete("section");
        }
        return next;
      },
      { replace: true },
    );
  }, []);

  // The host owns the frame and freezes `src` per appId. The "ai-rooms"
  // frame is always the rooms-group root; the "ai-rooms-personal" frame is
  // the entry personal section. Switching `appId` (group <-> personal) is a
  // host dim-transition; within a frame, the effect below soft-navigates.
  const apiRef = useSdkFrame({
    appId,
    enabled: true,
    title: t("Common:DashboardRoomsTitle"),
    getSrc: () =>
      isGroup
        ? getGroupSrc(targetRef.current)
        : getPersonalSrc(targetRef.current, roomsFolderIdRef.current),
    onNavigate: handleSdkNavigate,
  });

  // Parent -> iframe: within the CURRENT frame, route internally via the
  // active bridge (rooms bridge for rooms/archive, personal-files bridge for
  // recent/favorites/trash). When `appId` just changed, the new frame loads
  // the right section via its frozen `src`, so we don't postMessage (it
  // would race the fresh mount) — we only adopt it as the baseline.
  const navAppIdRef = React.useRef(appId);
  React.useEffect(() => {
    if (navAppIdRef.current !== appId) {
      navAppIdRef.current = appId;
      lastSdkSectionRef.current = target;
      return;
    }
    if (lastSdkSectionRef.current === target) return;
    lastSdkSectionRef.current = target;
    apiRef.current?.call("navigateSection", { section: target });
  }, [appId, target, apiRef]);

  return null;
};

const AiRoomsConnected = inject<TStore>(({ treeFoldersStore }) => ({
  roomsFolderId: treeFoldersStore.roomsFolderId,
}))(observer(AiRooms));

export { AiRoomsConnected as AiRooms };
export default AiRoomsConnected;

