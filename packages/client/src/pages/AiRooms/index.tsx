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

import { useTranslation } from "react-i18next";

import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";

import { useSdkFrame } from "SRC_DIR/components/SdkFrameHost/useSdkFrame";
import { useSdkUrlMirror } from "SRC_DIR/components/SdkFrameHost/useSdkUrlMirror";

// A single frame serves all sections: rooms / archive live in the SDK
// `(rooms)` group, recent / favorites / trash in `(personal-files)`. Crossing
// between them reloads the one iframe (a host dim-transition), since with
// src-driven navigation any SDK pathname is reachable by changing `src` — the
// old two-frame split (which existed only to reach `(personal-files)` without
// a reload) is no longer needed.
const AiRooms = () => {
  const { t } = useTranslation(["Common"]);
  useDocumentTitle("Common:DashboardRoomsTitle");

  const { src, sdkOwnedSrc, onNavigate } = useSdkUrlMirror({
    hostPrefix: "/ai-rooms",
    defaultSdkPath: "/rooms",
  });

  useSdkFrame({
    appId: "ai-rooms",
    enabled: true,
    title: t("Common:DashboardRoomsTitle"),
    src,
    sdkOwnedSrc,
    getSrc: () => src,
    onNavigate,
  });

  return null;
};

export { AiRooms };
export default AiRooms;
