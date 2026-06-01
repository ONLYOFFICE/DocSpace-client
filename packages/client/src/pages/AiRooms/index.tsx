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

import { inject, observer } from "mobx-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import SdkIframe from "SRC_DIR/components/SdkIframe";

type AiRoomsProps = {
  roomsFolderId?: number | null;
};

const getSrc = (section: string, roomsFolderId?: number | null): string => {
  const parentIdParam =
    roomsFolderId != null ? `?parentId=${roomsFolderId}` : "";

  switch (section) {
    case "rooms":
      return "/sdk/rooms";
    case "favorites":
      return `/sdk/personal-files/favorites${parentIdParam}`;
    case "recent":
      return `/sdk/personal-files/recent${parentIdParam}`;
    case "archive":
      return "/sdk/archive";
    case "trash":
      return `/sdk/personal-files/trash${parentIdParam}`;
    case "settings":
      return "/sdk/settings";
    default:
      return "/sdk/rooms";
  }
};

const AiRooms = ({ roomsFolderId }: AiRoomsProps) => {
  const { t } = useTranslation(["Common"]);
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") ?? "";
  return (
    <SdkIframe
      src={getSrc(section, roomsFolderId)}
      title={t("Common:DashboardAIRoomsTitle")}
    />
  );
};

const AiRoomsConnected = inject<TStore>(({ treeFoldersStore }) => ({
  roomsFolderId: treeFoldersStore.roomsFolderId,
}))(observer(AiRooms));

export { AiRoomsConnected as AiRooms };
export default AiRoomsConnected;

