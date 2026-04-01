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

import { useMemo } from "react";

import PluginStore from "SRC_DIR/store/PluginStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";

export const usePlugin = (
  view: string | null,
  infoPanelItemsList?: PluginStore["infoPanelItemsList"],
  selection?: InfoPanelStore["infoPanelSelection"],
) => {
  const isPlugin = view ? view.indexOf("info_plugin") > -1 : false;
  const infoPanelItemKey = view ? view.replace("info_plugin-", "") : "";

  const infoPanelItem = infoPanelItemsList?.find(
    (i) => i.key === infoPanelItemKey,
  )?.value;

  const isPluginHeaderVisible =
    !!infoPanelItem && infoPanelItem.isHeaderVisible;

  const pluginTabs = useMemo(() => {
    if (!infoPanelItemsList || !selection || Array.isArray(selection))
      return [];

    const isRoom = "roomType" in selection && selection.roomType;
    const isFile = "fileExst" in selection && selection.fileExst;

    const isImage =
      isFile &&
      "viewAccessibility" in selection &&
      !selection.viewAccessibility.MediaView &&
      selection.viewAccessibility.ImageView;

    const isVideo =
      isFile &&
      "viewAccessibility" in selection &&
      selection.viewAccessibility.MediaView &&
      !selection.viewAccessibility.ImageView;

    return infoPanelItemsList.filter((item) => {
      if (!item.value.filesType) return true;

      if (isRoom && item.value.filesType.includes(PluginFileType.room))
        return true;

      if (isImage && item.value.filesType.includes(PluginFileType.image))
        return true;

      if (isVideo && item.value.filesType.includes(PluginFileType.video))
        return true;

      if (isFile && item.value.filesType.includes(PluginFileType.file)) {
        if (
          item.value.filesExsts &&
          !item.value.filesExsts.includes(selection.fileExst)
        )
          return false;
        return true;
      }

      if (!isFile && item.value.filesType.includes(PluginFileType.folder))
        return true;

      return false;
    });
  }, [infoPanelItemsList, selection]);

  const isCurrentPluginTab =
    isPlugin &&
    !!infoPanelItem &&
    pluginTabs.some((item) => item.key === infoPanelItemKey);

  return {
    isPlugin,
    isPluginHeaderVisible,
    infoPanelItem,
    pluginTabs,
    isCurrentPluginTab,
  };
};

