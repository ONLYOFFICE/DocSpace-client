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

import {
  isFile as isFileUtil,
  isFolder,
  isFolder as isFolderUtil,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import type { IContextMenuItemClient } from "SRC_DIR/helpers/plugins/types";
import type {
  TContextItem,
  TContextItemSecurity,
  TContextOption,
  TMenuGroupConfig,
  TStoreCustomEvent,
} from "./helpers";
import type ContextOptionsStore from "../ContextOptionsStore";

type TSelectionItem = TContextItem & {
  contextOptions: string[];
  security: TContextItemSecurity;
};

type TPluginGroupItem = {
  id: number | string;
  itemType: "file" | "folder" | "room";
};

export const onMultiLoadPluginsImpl = (
self: ContextOptionsStore,items: TSelectionItem[]
): TContextOption[]=> {
  if (isAIAgents()) return [];

  const { enablePlugins } = self.settingsStore;

  const pluginItems: TContextOption[] = [];
  self.setLoaderTimer(true);

  if (enablePlugins && self.pluginStore.contextMenuItemsList) {
    self.pluginStore.contextMenuItemsList.forEach((option) => {
      const optionItem = option.value;

      // the original .js returns undefined for unknown
      // entries and passes it through to onGroupClick — the cast below
      // keeps that behavior.
      const resolveItemType = (
        item: TSelectionItem,
      ): "file" | "folder" | "room" | undefined => {
        if (isFileUtil(item)) return "file";
        if (isFolderUtil(item)) return "folder";
        if (isRoomUtil(item)) return "room";
      };

      const processOptionItem = (
        value: IContextMenuItemClient,
      ): TContextOption | undefined => {
        const isEveryItemIncludesOption = items.every(({ contextOptions }) =>
          contextOptions.includes(value.key),
        );

        if (!isEveryItemIncludesOption || !value.isGroupAction) return;

        const groupItems = items.map((item) => ({
          id: item.id,
          itemType: resolveItemType(item),
        })) as TPluginGroupItem[];

        // the original .js called onGroupClick without a
        // presence check — the non-null assertions keep that behavior.
        const onClick = async () => {
          if (value.withActiveItem) {
            const { setActiveFiles } = self.filesStore;

            setActiveFiles(items.map((item) => item.id));

            await value.onGroupClick!(groupItems);

            setActiveFiles([]);
          } else {
            value.onGroupClick!(groupItems);
          }
        };

        const processedOptionValue = {
          key: value.key,
          id: value.key,
          label: value.label,
          icon: value.icon,
          disabled: false,
          onClick,
        };

        return processedOptionValue;
      };

      if (optionItem.items && optionItem.items.length > 0) {
        optionItem.items.forEach((nestedItem) => {
          const processedItem = processOptionItem(nestedItem);
          processedItem && pluginItems.push(processedItem);
        });
      } else {
        const item = processOptionItem(optionItem);
        item && pluginItems.push(item);
      }
    });
  }

  self.setLoaderTimer(false);

  return pluginItems;
};


export const onLoadPluginsImpl = (
self: ContextOptionsStore,item: TContextItem
): TContextOption[]=> {
  if (isAIAgents()) return [];
  // callers always pass an item enriched with
  // contextOptions (see getFilesContextOptions) — the cast keeps the
  // original unchecked access.
  const { contextOptions } = item as TSelectionItem;
  const { enablePlugins } = self.settingsStore;

  const pluginItems: TContextOption[] = [];
  self.setLoaderTimer(true);

  if (enablePlugins && self.pluginStore.contextMenuItemsList) {
    self.pluginStore.contextMenuItemsList.forEach((option) => {
      const processOptionValue = (
        value: IContextMenuItemClient,
      ): TContextOption | null | undefined => {
        if (!contextOptions.includes(value.key) || value.isGroupAction)
          return;

        // the original .js called onClick without a
        // presence check — the non-null assertions keep that behavior.
        const onClick = async () => {
          if (value.withActiveItem) {
            const { setActiveFiles } = self.filesStore;

            setActiveFiles([item.id]);

            await value.onClick!(item.id);

            setActiveFiles([]);
          } else {
            value.onClick!(item.id);
          }
        };

        const processedOptionValue: TContextOption = {
          key: value.key,
          id: value.key,
          label: value.label,
          icon: value.icon,
          onClick,
          placement: value.placement,
        };

        const processedItems: TContextOption[] = [];
        // Recursively process nested items if they exist
        if (value.items && value.items.length > 0) {
          value.items.forEach((nestedItem) => {
            const processedItem = processOptionValue(
              nestedItem as IContextMenuItemClient,
            );
            processedItem && processedItems.push(processedItem);
          });

          if (processedItems.length > 0) {
            processedOptionValue.items = processedItems;
          } else {
            // If we have no processed items, we dont render this option
            return null;
          }
        }

        return processedOptionValue;
      };

      const value = processOptionValue(option.value);

      value && pluginItems.push(value);
    });
  }

  self.setLoaderTimer(false);

  return pluginItems;
};

