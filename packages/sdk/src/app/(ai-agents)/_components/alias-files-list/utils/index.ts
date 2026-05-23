// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

// Mirrors (docspace)/(files)/_utils — duplicated so the alias-files-list
// body is fully decoupled from the personal-files routes.
export const generateFilesItemValue = (
  item: TFolderItem | TFileItem,
  draggable: boolean,
  index: number,
) => {
  const itemTypeStr = item.isFolder ? `folder_${item.id}` : `file_${item.id}`;
  const draggableStr = draggable ? "_draggable" : "_false";
  const indexStr = `_index_${index}`;
  return `${itemTypeStr}${draggableStr}${indexStr}`;
};
