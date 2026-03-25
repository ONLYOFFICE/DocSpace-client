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

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  PluginFileType,
  PluginComponents,
} from "SRC_DIR/helpers/plugins/enums";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import PluginStore from "SRC_DIR/store/PluginStore";

import {
  NumberOrString,
  PlaylistType,
} from "@docspace/shared/components/media-viewer/MediaViewer.types";
import { IContextMenuItemClient } from "SRC_DIR/helpers/plugins/types";

interface UsePluginProps {
  pluginMediaViewerVisible: PluginStore["pluginMediaViewerVisible"];
  pluginMediaViewerProps: PluginStore["pluginMediaViewerProps"];
  dispatchMessage: PluginStore["dispatchMessage"];
  contextMenuItemsList: PluginStore["contextMenuItemsList"];
  getContextMenuKeysByType: PluginStore["getContextMenuKeysByType"];
  currentMediaFileId: NumberOrString;
  playlist: PlaylistType[];
}

export const usePlugin = ({
  pluginMediaViewerVisible,
  pluginMediaViewerProps,
  dispatchMessage,
  contextMenuItemsList,
  getContextMenuKeysByType,
  currentMediaFileId,
  playlist,
}: UsePluginProps) => {
  const isLoaded = useRef(false);

  const handlePluginClose = useCallback(async () => {
    if (!pluginMediaViewerVisible || !pluginMediaViewerProps?.onClose) {
      return null;
    }

    const pluginName = pluginMediaViewerProps.pluginName;
    const message = await pluginMediaViewerProps.onClose();

    dispatchMessage({ message, pluginName });
  }, [pluginMediaViewerProps, pluginMediaViewerVisible, dispatchMessage]);

  const onLoad = useCallback(async () => {
    if (pluginMediaViewerProps?.onLoad && currentMediaFileId) {
      const message = await pluginMediaViewerProps.onLoad({
        fileId: currentMediaFileId,
      });

      dispatchMessage({
        message,
        pluginName: pluginMediaViewerProps.pluginName,
      });
    }
  }, [pluginMediaViewerProps, currentMediaFileId, dispatchMessage]);

  useEffect(() => {
    if (!pluginMediaViewerVisible) {
      isLoaded.current = false;
      return;
    }

    if (
      !isLoaded.current &&
      pluginMediaViewerProps?.onLoad &&
      currentMediaFileId
    ) {
      isLoaded.current = true;
      onLoad();
    }
  }, [pluginMediaViewerVisible, onLoad]);

  // Get plugin viewer content component
  const pluginContent = useMemo(() => {
    if (!pluginMediaViewerVisible) return null;

    return (
      <WrappedComponent
        pluginName={pluginMediaViewerProps?.pluginName}
        component={{
          component: PluginComponents.box,
          props: pluginMediaViewerProps?.content,
        }}
        modalRequestRunning={undefined}
        saveButton={undefined}
        setModalRequestRunning={undefined}
        setSaveButtonProps={undefined}
      />
    );
  }, [pluginMediaViewerVisible, pluginMediaViewerProps]);

  // Get plugin context menu items
  const pluginContextMenuItems = useMemo(() => {
    const item = playlist.find((p) => p.fileId === currentMediaFileId);
    const fileExst = item?.fileExst;

    const pluginContextMenuKeys = [
      ...(getContextMenuKeysByType(PluginFileType.image, fileExst) || []),
      ...(getContextMenuKeysByType(PluginFileType.video, fileExst) || []),
    ];

    const items: IContextMenuItemClient[] = [];

    contextMenuItemsList?.forEach(({ value }) => {
      if (pluginContextMenuKeys.includes(value.key)) {
        if (value.items && value.items.length > 0) {
          const processedOptionValues: IContextMenuItemClient[] = [];

          value.items.forEach((nestedItem: IContextMenuItemClient) => {
            if (pluginContextMenuKeys.includes(nestedItem.key)) {
              processedOptionValues.push(nestedItem);
            }
          });

          if (processedOptionValues.length > 0) {
            items.push(...processedOptionValues);
          }
        }

        if (!value.items) {
          items.push(value);
        }
      }
    });

    return items;
  }, [
    contextMenuItemsList,
    getContextMenuKeysByType,
    currentMediaFileId,
    playlist,
  ]);

  return {
    handlePluginClose,
    pluginContent,
    pluginContextMenuItems,
  };
};

