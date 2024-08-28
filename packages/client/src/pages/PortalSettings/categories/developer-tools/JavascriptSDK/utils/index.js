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
import debounce from "lodash.debounce";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";

import ActionButtonEnUrl from "PUBLIC_DIR/images/sdkPresets/en/action-button.svg?url";
import ActionButtonEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/action-button-dark.svg?url";

import ActionButtonZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/action-button.svg?url";
import ActionButtonZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/action-button-dark.svg?url";

import BreadcrumbsEnUrl from "PUBLIC_DIR/images/sdkPresets/en/breadcrumbs.svg?url";
import BreadcrumbsEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/breadcrumbs-dark.svg?url";

import BreadcrumbsZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/breadcrumbs.svg?url";
import BreadcrumbsZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/breadcrumbs-dark.svg?url";

import ColumnsEnUrl from "PUBLIC_DIR/images/sdkPresets/en/columns.svg?url";
import ColumnsEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/columns-dark.svg?url";

import ColumnsZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/columns.svg?url";
import ColumnsZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/columns-dark.svg?url";

import FilterEnUrl from "PUBLIC_DIR/images/sdkPresets/en/filter.svg?url";
import FilterEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/filter-dark.svg?url";

import FilterZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/filter.svg?url";
import FilterZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/filter-dark.svg?url";

import LeftMenuEnUrl from "PUBLIC_DIR/images/sdkPresets/en/left-menu.svg?url";
import LeftMenuEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/left-menu-dark.svg?url";

import LeftMenuZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/left-menu.svg?url";
import LeftMenuZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/left-menu-dark.svg?url";

import HeaderEnUrl from "PUBLIC_DIR/images/sdkPresets/en/mobile-header.svg?url";
import HeaderEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/mobile-header-dark.svg?url";

import HeaderZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/mobile-header.svg?url";
import HeaderZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/mobile-header-dark.svg?url";

import SearchEnUrl from "PUBLIC_DIR/images/sdkPresets/en/search.svg?url";
import SearchEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/search-dark.svg?url";

import SearchZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/search.svg?url";
import SearchZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/search-dark.svg?url";

import SubtitleEnUrl from "PUBLIC_DIR/images/sdkPresets/en/subtitle.svg?url";
import SubtitleEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/subtitle-dark.svg?url";

import SubtitleZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/subtitle.svg?url";
import SubtitleZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/subtitle-dark.svg?url";

import TitleEnUrl from "PUBLIC_DIR/images/sdkPresets/en/title.svg?url";
import TitleEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/title-dark.svg?url";

import TitleZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/title.svg?url";
import TitleZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/title-dark.svg?url";

import CustomEnUrl from "PUBLIC_DIR/images/sdkPresets/en/custom.svg?url";
import CustomEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/custom-dark.svg?url";

import CustomZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/custom.svg?url";
import CustomZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/custom-dark.svg?url";

import PortalEnUrl from "PUBLIC_DIR/images/sdkPresets/en/portal.svg?url";
import PortalEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/portal-dark.svg?url";

import PortalZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/portal.svg?url";
import PortalZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/portal-dark.svg?url";

import PublicRoomEnUrl from "PUBLIC_DIR/images/sdkPresets/en/public-room.svg?url";
import PublicRoomEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/public-room-dark.svg?url";

import PublicRoomZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/public-room.svg?url";
import PublicRoomZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/public-room-dark.svg?url";

import EditorEnUrl from "PUBLIC_DIR/images/sdkPresets/en/editor.svg?url";
import EditorEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/editor-dark.svg?url";

import EditorZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/editor.svg?url";
import EditorZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/editor-dark.svg?url";

import ViewerEnUrl from "PUBLIC_DIR/images/sdkPresets/en/viewer.svg?url";
import ViewerEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/viewer-dark.svg?url";

import ViewerZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/viewer.svg?url";
import ViewerZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/viewer-dark.svg?url";

import FileSelectorEnUrl from "PUBLIC_DIR/images/sdkPresets/en/file-selector.svg?url";
import FileSelectorEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/file-selector-dark.svg?url";

import FileSelectorZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/file-selector.svg?url";
import FileSelectorZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/file-selector-dark.svg?url";

import RoomSelectorEnUrl from "PUBLIC_DIR/images/sdkPresets/en/room-selector.svg?url";
import RoomSelectorEnDarkUrl from "PUBLIC_DIR/images/sdkPresets/en/room-selector-dark.svg?url";

import RoomSelectorZhUrl from "PUBLIC_DIR/images/sdkPresets/zh/room-selector.svg?url";
import RoomSelectorZhDarkUrl from "PUBLIC_DIR/images/sdkPresets/zh/room-selector-dark.svg?url";

export const loadFrame = debounce((config, scriptUrl) => {
  const script = document.getElementById("integration");

  if (script) {
    script.remove();
  }

  const params = objectToGetParams(config);

  loadScript(`${scriptUrl}${params}`, "integration", () =>
    window.DocSpace.SDK.initFrame(config),
  );
}, 500);

const images = {
  ActionButtonEnDarkUrl,
  ActionButtonEnUrl,
  ActionButtonZhDarkUrl,
  ActionButtonZhUrl,
  BreadcrumbsEnDarkUrl,
  BreadcrumbsEnUrl,
  BreadcrumbsZhDarkUrl,
  BreadcrumbsZhUrl,
  ColumnsEnDarkUrl,
  ColumnsEnUrl,
  ColumnsZhDarkUrl,
  ColumnsZhUrl,
  CustomEnDarkUrl,
  CustomEnUrl,
  CustomZhDarkUrl,
  CustomZhUrl,
  PortalEnDarkUrl,
  PortalEnUrl,
  PortalZhDarkUrl,
  PortalZhUrl,
  EditorEnDarkUrl,
  EditorEnUrl,
  EditorZhDarkUrl,
  EditorZhUrl,
  FileSelectorEnDarkUrl,
  FileSelectorEnUrl,
  FileSelectorZhDarkUrl,
  FileSelectorZhUrl,
  FilterEnDarkUrl,
  FilterEnUrl,
  FilterZhDarkUrl,
  FilterZhUrl,
  HeaderEnDarkUrl,
  HeaderEnUrl,
  HeaderZhDarkUrl,
  HeaderZhUrl,
  LeftMenuEnDarkUrl,
  LeftMenuEnUrl,
  LeftMenuZhDarkUrl,
  LeftMenuZhUrl,
  PublicRoomEnDarkUrl,
  PublicRoomEnUrl,
  PublicRoomZhDarkUrl,
  PublicRoomZhUrl,
  RoomSelectorEnDarkUrl,
  RoomSelectorEnUrl,
  RoomSelectorZhDarkUrl,
  RoomSelectorZhUrl,
  SearchEnDarkUrl,
  SearchEnUrl,
  SearchZhDarkUrl,
  SearchZhUrl,
  SubtitleEnDarkUrl,
  SubtitleEnUrl,
  SubtitleZhDarkUrl,
  SubtitleZhUrl,
  TitleEnDarkUrl,
  TitleEnUrl,
  TitleZhDarkUrl,
  TitleZhUrl,
  ViewerEnDarkUrl,
  ViewerEnUrl,
  ViewerZhDarkUrl,
  ViewerZhUrl,
};

export const getSDKImagesUrls = (isBaseTheme = true, isZhLocale = true) => {
  const theme = isBaseTheme ? "" : "Dark";
  const locale = isZhLocale ? "Zh" : "En";

  return {
    ActionButton: images[`ActionButton${locale}${theme}Url`],
    Breadcrumbs: images[`Breadcrumbs${locale}${theme}Url`],
    Columns: images[`Columns${locale}${theme}Url`],
    Custom: images[`Custom${locale}${theme}Url`],
    Portal: images[`Portal${locale}${theme}Url`],
    Editor: images[`Editor${locale}${theme}Url`],
    FileSelector: images[`FileSelector${locale}${theme}Url`],
    Filter: images[`Filter${locale}${theme}Url`],
    Header: images[`Header${locale}${theme}Url`],
    LeftMenu: images[`LeftMenu${locale}${theme}Url`],
    PublicRoom: images[`PublicRoom${locale}${theme}Url`],
    RoomSelector: images[`RoomSelector${locale}${theme}Url`],
    Search: images[`Search${locale}${theme}Url`],
    Subtitle: images[`Subtitle${locale}${theme}Url`],
    Title: images[`Title${locale}${theme}Url`],
    Viewer: images[`Viewer${locale}${theme}Url`],
  };
};
