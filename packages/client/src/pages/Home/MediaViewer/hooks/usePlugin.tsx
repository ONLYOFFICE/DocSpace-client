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
  setMediaViewerData: (data: {
    visible: boolean;
    id: NumberOrString | null;
  }) => void;
}

export const usePlugin = ({
  pluginMediaViewerVisible,
  pluginMediaViewerProps,
  dispatchMessage,
  contextMenuItemsList,
  getContextMenuKeysByType,
  currentMediaFileId,
  playlist,
  setMediaViewerData,
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

  const onLoad = useCallback(
    async (fileId: NumberOrString) => {
      if (pluginMediaViewerProps?.onLoad) {
        const message = await pluginMediaViewerProps.onLoad({
          fileId: fileId,
        });

        dispatchMessage({
          message,
          pluginName: pluginMediaViewerProps.pluginName,
        });
      }
    },
    [pluginMediaViewerProps, dispatchMessage, setMediaViewerData],
  );

  useEffect(() => {
    if (!pluginMediaViewerVisible) {
      isLoaded.current = false;
      return;
    }

    const fileId = pluginMediaViewerProps?.fileId || currentMediaFileId;

    if (!isLoaded.current && fileId) {
      isLoaded.current = true;
      setMediaViewerData({ visible: true, id: fileId });
      onLoad?.(fileId);
    }
  }, [
    pluginMediaViewerVisible,
    onLoad,
    pluginMediaViewerProps,
    currentMediaFileId,
  ]);

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

