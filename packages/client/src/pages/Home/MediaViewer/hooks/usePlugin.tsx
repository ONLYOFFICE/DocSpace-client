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

import { useCallback, useEffect, useMemo } from "react";
import { PluginActions, PluginComponents } from "SRC_DIR/helpers/plugins/enums";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import PluginWrappedComponent from "SRC_DIR/components/plugins/PluginWrappedComponent";
import PluginStore from "SRC_DIR/store/PluginStore";

import {
  NumberOrString,
  PlaylistType,
} from "@docspace/shared/components/media-viewer/MediaViewer.types";
import { IContextMenuItemClient } from "SRC_DIR/helpers/plugins/types";
import { isSameId } from "SRC_DIR/helpers/plugins/utils";
import type MediaViewerDataStore from "SRC_DIR/store/MediaViewerDataStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type { TCurrentFile } from "@onlyoffice/docspace-plugin-sdk/react";
import { BoxGroup } from "@onlyoffice/docspace-plugin-sdk";

interface UsePluginProps {
  pluginMediaViewerVisible: PluginStore["pluginMediaViewerVisible"];
  pluginMediaViewerProps: PluginStore["pluginMediaViewerProps"];
  dispatchMessage: PluginStore["dispatchMessage"];
  contextMenuItemsList: PluginStore["contextMenuItemsList"];
  files: FilesStore["files"];
  getFilesContextOptions: FilesStore["getFilesContextOptions"];
  currentMediaFileId: NumberOrString;
  playlist: PlaylistType[];
  isPluginFileOutsidePlaylist: MediaViewerDataStore["isPluginFileOutsidePlaylist"];
  isOpenedByPlugin: MediaViewerDataStore["isOpenedByPlugin"];
  isPluginViewerClosing: MediaViewerDataStore["isPluginViewerClosing"];
  openPluginViewer: MediaViewerDataStore["openPluginViewer"];
  closePluginViewer: MediaViewerDataStore["closePluginViewer"];
  pendingPluginFileId: MediaViewerDataStore["pendingPluginFileId"];
  showPluginFile: MediaViewerDataStore["showPluginFile"];
}

export const usePlugin = ({
  pluginMediaViewerVisible,
  pluginMediaViewerProps,
  dispatchMessage,
  contextMenuItemsList,
  files,
  getFilesContextOptions,
  currentMediaFileId,
  playlist,
  isPluginFileOutsidePlaylist,
  isOpenedByPlugin,
  isPluginViewerClosing,
  openPluginViewer,
  closePluginViewer,
  pendingPluginFileId,
  showPluginFile,
}: UsePluginProps) => {
  const handlePluginClose = useCallback(async () => {
    if (!pluginMediaViewerVisible || !pluginMediaViewerProps) {
      return null;
    }

    const { pluginName, onClose } = pluginMediaViewerProps;

    if (!onClose) {
      dispatchMessage({
        message: { actions: [PluginActions.closeMediaViewer] },
        pluginName,
      });
      return null;
    }

    const message = await onClose();

    dispatchMessage({ message, pluginName });
  }, [pluginMediaViewerProps, pluginMediaViewerVisible, dispatchMessage]);

  const onLoad = useCallback(
    async (fileId: NumberOrString) => {
      if (
        pluginMediaViewerProps?.onLoad &&
        !pluginMediaViewerProps.component
      ) {
        const message = await pluginMediaViewerProps.onLoad({
          fileId: fileId,
        });

        dispatchMessage({
          message,
          pluginName: pluginMediaViewerProps.pluginName,
        });
      }
    },
    [pluginMediaViewerProps, dispatchMessage],
  );

  useEffect(() => {
    if (!isPluginFileOutsidePlaylist || !pluginMediaViewerProps) return;

    const { pluginName, fileId } = pluginMediaViewerProps;

    console.warn(
      `[Plugin: ${pluginName}] The media viewer was not opened: file ${fileId} is not in the open folder`,
    );

    dispatchMessage({
      message: { actions: [PluginActions.closeMediaViewer] },
      pluginName,
    });
  }, [isPluginFileOutsidePlaylist, pluginMediaViewerProps, dispatchMessage]);

  useEffect(() => {
    if (!pluginMediaViewerVisible || isOpenedByPlugin) return;

    if (isPluginFileOutsidePlaylist) return;

    const fileId = pluginMediaViewerProps?.fileId || currentMediaFileId;

    if (!fileId) return;

    openPluginViewer(fileId);
    onLoad?.(fileId);
  }, [
    pluginMediaViewerVisible,
    isOpenedByPlugin,
    isPluginFileOutsidePlaylist,
    onLoad,
    pluginMediaViewerProps,
    currentMediaFileId,
    openPluginViewer,
  ]);

  useEffect(() => {
    if (pendingPluginFileId === undefined) return;

    if (isPluginFileOutsidePlaylist) return;

    showPluginFile(pendingPluginFileId);
  }, [pendingPluginFileId, isPluginFileOutsidePlaylist, showPluginFile]);

  useEffect(() => {
    if (isPluginViewerClosing) closePluginViewer();
  }, [isPluginViewerClosing, closePluginViewer]);

  // The file on screen in the shape `useCurrentFile` returns, so a component
  // reads it directly instead of being handed the id through `onLoad`.
  const currentFile = useMemo<TCurrentFile | null>(() => {
    const item = playlist.find((p) => isSameId(p.fileId, currentMediaFileId));
    if (!item) return null;

    return {
      id: item.fileId,
      title: item.title,
      fileExst: item.fileExst || undefined,
    };
  }, [playlist, currentMediaFileId]);

  const pluginContent = useMemo(() => {
    if (!pluginMediaViewerVisible || !pluginMediaViewerProps?.pluginName)
      return null;

    if (pluginMediaViewerProps.component) {
      return (
        <PluginWrappedComponent
          pluginName={pluginMediaViewerProps.pluginName}
          component={pluginMediaViewerProps.component}
          currentFile={currentFile}
        />
      );
    }

    // `content` is optional since the React SDK: a plugin supplies either it or
    // `component`, so there is nothing to render once both are absent.
    const content = pluginMediaViewerProps.content;

    if (!content) return null;

    return (
      <WrappedComponent
        pluginName={pluginMediaViewerProps.pluginName}
        component={
          {
            component: PluginComponents.box,
            props: content,
          } satisfies BoxGroup
        }
      />
    );
  }, [pluginMediaViewerVisible, pluginMediaViewerProps, currentFile]);

  // Get plugin context menu items
  const pluginContextMenuItems = useMemo(() => {
    const file = files.find((item) => isSameId(item.id, currentMediaFileId));

    if (!file) return [];

    const contextOptions = getFilesContextOptions(file);

    const items: IContextMenuItemClient[] = [];

    contextMenuItemsList?.forEach(({ value }) => {
      if (value.isGroupAction) return;

      if (contextOptions.includes(value.key)) {
        if (value.items && value.items.length > 0) {
          const processedOptionValues: IContextMenuItemClient[] = [];

          value.items.forEach((nestedItem: IContextMenuItemClient) => {
            if (nestedItem.isGroupAction) return;

            if (contextOptions.includes(nestedItem.key)) {
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
  }, [contextMenuItemsList, getFilesContextOptions, currentMediaFileId, files]);

  return {
    handlePluginClose,
    pluginContent,
    pluginContextMenuItems,
  };
};

