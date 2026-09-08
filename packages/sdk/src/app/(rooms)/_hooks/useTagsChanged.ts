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

"use client";

import React from "react";
import { runInAction } from "mobx";

import type { TFolder } from "@docspace/shared/api/files/types";
import {
  applyTagChangeToRoomTags,
  isSharedTagChange,
} from "@docspace/shared/components/tag-management/TagManagement.utils";
import type { TagChange } from "@docspace/shared/components/tag-management/TagManagement.types";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useInfoPanelStore } from "@/app/(docspace)/_store/InfoPanelStore";

import { useRoomsTagsStore } from "../_store/RoomsTagsStore";

/**
 * What the app does when a tag changes, in one place.
 *
 * The three copies of a tag - the rooms on screen, the room the info panel is
 * showing and the list of tags the filter offers - are patched from the change
 * itself. Reading the room back from the server instead was both slower and
 * less certain: a room read right after a tag was bound to it can still come
 * back without that tag, and a rename or a removal reaches every room, while
 * a refetch of one room only ever corrected that one.
 */
export const useTagsChanged = () => {
  const filesListStore = useFilesListStore();
  const infoPanelStore = useInfoPanelStore();
  const tagsStore = useRoomsTagsStore();

  return React.useCallback(
    (change: TagChange) => {
      // All of it in one transaction, so what observes these stores re-renders
      // once. Without it the rollback of a failed request - which runs after
      // an await, outside React's own batching - would schedule a render per
      // store it touches.
      runInAction(() => {
        filesListStore.applyTagChange(change);
        tagsStore.applyChange(change);

        // The panel keeps its own copy of the room it is showing - which is
        // the room this is about only when the change names one and names
        // that one.
        const selected = infoPanelStore.selection;
        const tags = (selected as unknown as { tags?: string[] })?.tags;

        if (!selected || !Array.isArray(tags)) return;

        if (
          !isSharedTagChange(change) &&
          String(change.roomId) !== String(selected.id)
        )
          return;

        const next = applyTagChangeToRoomTags(tags, change);

        if (next !== tags) {
          infoPanelStore.setSelection({
            ...selected,
            tags: next,
          } as unknown as TFolder);
        }
      });
    },
    [filesListStore, infoPanelStore, tagsStore],
  );
};
