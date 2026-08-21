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

import { TTranslation } from "@docspace/shared/types";
import { FolderType } from "@docspace/shared/enums";

import EmptyRoomsRootUserDarkIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.dark.svg";
import EmptyRoomsRootUserLightIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.light.svg";
import EmptyRoomsRootDarkIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.dark.svg";
import EmptyRoomsRootLightIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.light.svg";
import DefaultFolderUserDark from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.dark.svg";
import DefaultFolderUserLight from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.light.svg";
import EmptyFavoritesLightIcon from "PUBLIC_DIR/images/emptyview/empty.favorites.svg";
import EmptyFavoritesDarkIcon from "PUBLIC_DIR/images/emptyview/empty.favorites.dark.svg";
import EmptyRecentLightIcon from "PUBLIC_DIR/images/emptyview/empty.recent.light.svg";
import EmptyRecentDarkIcon from "PUBLIC_DIR/images/emptyview/empty.recent.dark.svg";
import EmptyShareLightIcon from "PUBLIC_DIR/images/emptyview/empty.share.svg";
import EmptyShareDarkIcon from "PUBLIC_DIR/images/emptyview/empty.share.dark.svg";
import EmptyTrashLightIcon from "PUBLIC_DIR/images/emptyview/empty.trash.light.svg";
import EmptyTrashDarkIcon from "PUBLIC_DIR/images/emptyview/empty.trash.dark.svg";
import EmptyFilterFilesLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.light.svg";
import EmptyFilterFilesDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.dark.svg";
import { getBrandName } from "@docspace/shared/constants/brands";

export const getTitle = (t: TTranslation) => {
  return t("Common:EmptyScreenFolder");
};

export const getRootTitle = (
  t: TTranslation,
  rootFolderType: FolderType | null | undefined,
) => {
  switch (rootFolderType) {
    case FolderType.SHARE:
      return t("Common:EmptyShareTitle");
    case FolderType.Favorites:
      return t("Common:EmptyFavoritesTitle");
    case FolderType.Recent:
      return t("Common:NoRecentFilesHereYet");
    case FolderType.TRASH:
      return t("Common:NoItemsHereYet");
    case FolderType.USER:
      return t("Common:EmptyScreenFolder");
    default:
      return t("Common:EmptyRootRoomHeader", {
        organizationName: getBrandName("OrganizationName"),
        productName: getBrandName("ProductName"),
      });
  }
};

export const getIcon = (isBaseTheme: boolean) => {
  return isBaseTheme ? <DefaultFolderUserLight /> : <DefaultFolderUserDark />;
};

export const getRootIcon = (
  isBaseTheme: boolean,
  rootFolderType: FolderType | null | undefined,
) => {
  switch (rootFolderType) {
    case FolderType.SHARE:
      return isBaseTheme ? <EmptyShareLightIcon /> : <EmptyShareDarkIcon />;
    case FolderType.Favorites:
      return isBaseTheme ? (
        <EmptyFavoritesLightIcon />
      ) : (
        <EmptyFavoritesDarkIcon />
      );
    case FolderType.Recent:
      return isBaseTheme ? <EmptyRecentLightIcon /> : <EmptyRecentDarkIcon />;
    case FolderType.TRASH:
      return isBaseTheme ? <EmptyTrashLightIcon /> : <EmptyTrashDarkIcon />;
    case FolderType.USER:
      return isBaseTheme ? (
        <EmptyRoomsRootUserLightIcon />
      ) : (
        <EmptyRoomsRootUserDarkIcon />
      );
    default:
      return isBaseTheme ? (
        <EmptyRoomsRootLightIcon />
      ) : (
        <EmptyRoomsRootDarkIcon />
      );
  }
};

export const getFilterIcon = (isBaseTheme: boolean) => {
  return isBaseTheme ? (
    <EmptyFilterFilesLightIcon />
  ) : (
    <EmptyFilterFilesDarkIcon />
  );
};

export const getRootDescription = (
  t: TTranslation,
  rootFolderType: FolderType | null | undefined,
) => {
  switch (rootFolderType) {
    case FolderType.SHARE:
      return t("Common:EmptyShareDescription");
    case FolderType.Favorites:
      return t("Common:EmptyFavoritesDescription");
    case FolderType.Recent:
      return t("Common:EmptyRecentDescription");
    case FolderType.TRASH:
      return t("Common:TrashFunctionalityDescription", {
        sectionName: t("Common:TrashSection"),
        appName: t("Common:Files"),
      });
    case FolderType.USER:
      return t("Common:DefaultFolderDescription");
    default:
      return (
        <>
          <span>{t("Common:RoomEmptyAtTheMoment")}</span>
          <br />
          <span>{t("Common:FilesWillAppearHere")}</span>
        </>
      );
  }
};

export const getDescription = (t: TTranslation) => {
  return t("Common:UserEmptyDescription");
};

