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


import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../_store/FilesListStore", () => ({
  useFilesListStore: () => ({
    rootFolderType: FolderType.Archive,
    items: [],
    currentFolder: null,
  }),
}));

vi.mock("../_store/FilesSettingsStore", () => ({
  useFilesSettingsStore: () => ({ filesSettings: {} }),
}));

vi.mock("../_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => ({
    selection: [],
    addSelection: vi.fn(),
    setBufferSelection: vi.fn(),
  }),
}));

vi.mock("../_store/InfoPanelStore", () => ({
  InfoPanelView: {},
  useInfoPanelStore: () => ({
    selection: null,
    setLinkParams: vi.fn(),
    setEmbeddingPanelData: vi.fn(),
  }),
}));

vi.mock("./useContextMenuModel", () => ({
  default: () => ({ getContextMenuModel: () => [] }),
}));

vi.mock("./useFolderActions", () => ({
  default: () => ({ openFolder: vi.fn() }),
}));

vi.mock("./useDownloadActions", () => ({
  default: () => ({ downloadAction: vi.fn() }),
}));

vi.mock("@/app/(personal-files)/_hooks/useOperationToast", () => ({
  default: () => ({ showDuplicateToast: vi.fn() }),
}));

vi.mock("@/app/(rooms)/_store/RoomsOperationsStore", () => ({
  useRoomsOperationsStore: () => ({
    startOperation: vi.fn(),
    finishOperation: vi.fn(),
  }),
}));

vi.mock("@/app/(personal-files)/_store/DocsUserStore", () => ({
  useDocsUserStore: () => ({ user: null }),
}));

import { SDKDialogs } from "../_enums/dialogs";
import {
  DialogsStoreContextProvider,
  useDialogsStore,
} from "../_store/DialogsStore";
import { useHeaderContextMenu } from "./useHeaderContextMenu";

const archivedRoom = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 7001,
    title: "Archived room",
    roomType: RoomsType.CustomRoom,
    rootFolderType: FolderType.Archive,
    security: { Read: true, Download: true, Delete: true },
    ...overrides,
  }) as unknown as TRoom;

describe("useHeaderContextMenu of an archived room", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  const openHeaderMenu = (room: TRoom) => {
    let model: ContextMenuModel[] = [];
    let dialogsStore: ReturnType<typeof useDialogsStore> | null = null;
    const Probe = () => {
      dialogsStore = useDialogsStore();
      model = useHeaderContextMenu(room).getContextOptionsFolder();
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <DialogsStoreContextProvider>
          <Probe />
        </DialogsStoreContextProvider>,
      ),
    );
    return { model, dialogsStore: dialogsStore! };
  };

  it.each([
    ["a room", {}],
    ["a private room", { private: true }],
  ])(
    "Restore from the header of an archived room: %s opens the restore dialog",
    (_, overrides) => {
      const { model, dialogsStore } = openHeaderMenu(archivedRoom(overrides));

      const restore = model.find((item) => item.key === "unarchive-room");
      if (!restore || !("onClick" in restore)) {
        throw new Error("no restore entry in the header menu");
      }

      act(() => {
        restore.onClick?.({} as never);
      });

      expect(dialogsStore.isDialogOpen(SDKDialogs.RestoreRoom)).toBe(true);
      expect(dialogsStore.restoringRoomData).toEqual({
        id: 7001,
        title: "Archived room",
        roomType: RoomsType.CustomRoom,
      });
    },
  );
});
