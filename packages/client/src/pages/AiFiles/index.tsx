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

type AiFilesProps = {
  myFolderId?: number | null;
};

const getSrc = (
  section: string,
  myFolderId?: number | null,
  search?: string | null,
  folder?: string | null,
): string => {
  const parentIdParam =
    myFolderId != null ? `parentId=${myFolderId}` : "";

  const buildQuery = (base: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(base)) {
      if (v != null && v !== "") params.set(k, v);
    }
    const str = params.toString();
    return str ? `?${str}` : "";
  };

  switch (section) {
    case "recent":
      return `/sdk/personal-files/recent${buildQuery({ search, id: folder, parentId: myFolderId != null ? String(myFolderId) : null })}`;
    case "favorites":
      return `/sdk/personal-files/favorites${buildQuery({ search, id: folder, parentId: myFolderId != null ? String(myFolderId) : null })}`;
    case "shared-with-me":
      return `/sdk/personal-files/shared-with-me${buildQuery({ search, id: folder })}`;
    case "trash":
      return `/sdk/personal-files/trash${buildQuery({ search, id: folder })}`;
    case "settings":
      return "/sdk/personal-files/settings";
    default:
      return `/sdk/personal-files${buildQuery({ search, id: folder, ...(parentIdParam ? { parentId: String(myFolderId) } : {}) })}`;
  }
};

const AiFiles = ({ myFolderId }: AiFilesProps) => {
  const { t } = useTranslation(["Common"]);
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") ?? "";
  const search = searchParams.get("search");
  const folder = searchParams.get("folder");
  return (
    <SdkIframe
      src={getSrc(section, myFolderId, search, folder)}
      title={t("Common:DashboardAIFilesTitle")}
    />
  );
};

const AiFilesConnected = inject<TStore>(({ treeFoldersStore }) => ({
  myFolderId: treeFoldersStore.myFolderId,
}))(observer(AiFiles));

export { AiFilesConnected as AiFiles };
export default AiFilesConnected;
