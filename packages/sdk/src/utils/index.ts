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

import { TIconContainer } from "@/types";
import { RoomsType } from "@docspace/shared/enums";
import {
  iconSize24,
  iconSize32,
  iconSize64,
  iconSize96,
} from "@docspace/shared/utils/image-helpers";

export const getIconBySize = (path: string, size: number = 32) => {
  const getOrDefault = (container: TIconContainer): string => {
    const iconPath = container.has(path)
      ? (container.get(path) ?? "")
      : (container.get("file.svg") ?? "");

    const publicIndex = iconPath.indexOf("/public");

    if (publicIndex !== -1) {
      return iconPath.substring(publicIndex).replace("/public", "/static");
    }

    return iconPath;
  };

  switch (+size) {
    case 24:
      return getOrDefault(iconSize24);
    case 32:
      return getOrDefault(iconSize32);
    case 64:
      return getOrDefault(iconSize64);
    case 96:
      return getOrDefault(iconSize96);
    default:
      return getOrDefault(iconSize32);
  }
};

export const getRoomsIcon = (
  roomType: RoomsType,
  isArchive: boolean,
  size: number = 32,
) => {
  let path = "";

  if (isArchive) {
    path = "archiveRoom.svg";
  } else {
    switch (roomType) {
      case RoomsType.CustomRoom:
        path = "customRoom.svg";
        break;
      case RoomsType.AIRoom:
        path = "aiRoom.svg";
        break;
      case RoomsType.EditingRoom:
        path = "editingRoom.svg";
        break;
      case RoomsType.PublicRoom:
        path = "publicRoom.svg";
        break;
      case RoomsType.VirtualDataRoom:
        path = "virtualRoom.svg";
        break;
      case RoomsType.FormRoom:
        path = "formRoom.svg";
        break;
      default:
        path = "customRoom.svg";
    }
  }

  return getIconBySize(path, size);
};
