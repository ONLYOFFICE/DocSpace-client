// (c) Copyright Ascensio System SIA 2009-2024
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

import FilesSelectorClient from "./page.client";

import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import {
  TFolder,
  TFilesSettings,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import { FolderType, RoomSearchArea } from "@docspace/shared/enums";

import { getFilesSettings, getFolder, getFoldersTree } from "@/api/files";
import { getRooms } from "@/api/rooms";
import { PAGE_COUNT } from "@/utils/constants";
import { TGetRooms } from "@docspace/shared/api/rooms/types";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const baseConfig = JSON.parse(JSON.stringify(searchParams), (k, v) =>
    v === "true" ? true : v === "false" ? false : v,
  );

  const { id } = baseConfig;
  const folderId = id ? JSON.parse(id as string) : null;
  const actions: Promise<unknown>[] = [getFoldersTree(), getFilesSettings()];
  const filter = folderId ? FilesFilter.getDefault() : RoomsFilter.getDefault();

  filter.page = 0;
  filter.pageCount = PAGE_COUNT;

  if (!folderId) {
    filter.searchArea = RoomSearchArea.Active;

    actions.push(getRooms(filter as RoomsFilter));
  } else {
    actions.push(getFolder(folderId, filter as FilesFilter));
  }

  const [foldersTree, filesSettings, itemsList] = await Promise.all(actions);

  const { folders, files, current, pathParts, total } = itemsList as
    | TGetFolder
    | TGetRooms;

  const roomsFolderId = (foldersTree as TFolder[]).find(
    (x) => x.rootFolderType === FolderType.Rooms,
  )?.id;

  const items = [...folders, ...files];

  const breadCrumbs = pathParts.map((part, index) => ({
    id: part.id,
    label: part.title,
    roomType: part?.roomType,
    isRoom: !folderId
      ? true
      : (index === 0 && typeof pathParts[0]?.roomType !== "undefined") ||
        roomsFolderId === part.id,
  }));

  const currentFolderId = current.id;
  const rootFolderType = current.rootFolderType;

  console.log(breadCrumbs[0]);

  return (
    <FilesSelectorClient
      foldersTree={foldersTree as TFolder[]}
      filesSettings={filesSettings as TFilesSettings}
      items={items}
      selectedItemType={folderId ? "files" : "rooms"}
      selectedItemId={current.id}
      total={total}
      hasNextPage={total > PAGE_COUNT}
      breadCrumbs={breadCrumbs}
      searchValue={"search" in filter ? filter.search : filter.filterValue}
      currentFolderId={currentFolderId}
      rootFolderType={rootFolderType}
      roomsFolderId={roomsFolderId}
      baseConfig={baseConfig}
    />
  );
}
