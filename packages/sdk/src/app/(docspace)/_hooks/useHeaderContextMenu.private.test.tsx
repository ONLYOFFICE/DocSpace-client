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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FolderType } from "@docspace/shared/enums";
import type { TFolder } from "@docspace/shared/api/files/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({
  rootFolderType: 0,
  roomMenuArgs: [] as unknown[],
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../_store/FilesListStore", () => ({
  useFilesListStore: () => ({ rootFolderType: env.rootFolderType, items: [] }),
}));

vi.mock("../_store/FilesSettingsStore", () => ({
  useFilesSettingsStore: () => ({ filesSettings: {} }),
}));

vi.mock("./useContextMenuModel", () => ({
  default: () => ({ getContextMenuModel: () => [] }),
}));

vi.mock("@/app/(rooms)/_hooks/useRoomContextMenuModel", () => ({
  default: (...args: unknown[]) => {
    env.roomMenuArgs = args;
    return { getContextModel: () => [] };
  },
}));

vi.mock("@/app/(rooms)/_hooks/useRoomActions", () => ({ default: () => ({}) }));

vi.mock("@/app/(personal-files)/_store/DocsUserStore", () => ({
  useDocsUserStore: () => ({ user: null }),
}));

import { AVAILABLE_CONTEXT_ITEMS as C } from "../_enums/context-items";
import {
  EncryptedFileActionsContext,
  type EncryptedFileActions,
} from "../_contexts/EncryptedFileActionsContext";
import { useHeaderContextMenu } from "./useHeaderContextMenu";

const SUBFOLDER = {
  id: 11,
  title: "Drafts",
  parentId: 10,
  rootFolderType: FolderType.Rooms,
  isFavorite: false,
  security: {
    Read: true,
    Download: true,
    Rename: true,
    Copy: true,
    Duplicate: true,
    Move: true,
    Delete: true,
  },
} as unknown as TFolder;

describe("useHeaderContextMenu in a private room", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  beforeEach(() => {
    env.rootFolderType = FolderType.Rooms;
  });

  const headerOptions = (actions: EncryptedFileActions | null) => {
    let options: string[] = [];
    const Probe = () => {
      options = useHeaderContextMenu(SUBFOLDER).currentFolderItem
        ?.contextOptions as string[];
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <EncryptedFileActionsContext.Provider value={actions}>
          <Probe />
        </EncryptedFileActionsContext.Provider>,
      ),
    );
    return options;
  };

  it("Header menu of a folder inside a private room: no copy, duplicate or favorites, download without decryption offered", () => {
    const options = headerOptions({ roomId: 10 } as EncryptedFileActions);

    expect(options).not.toContain(C.copy);
    expect(options).not.toContain(C.duplicate);
    expect(options).not.toContain(C.markAsFavorite);
    expect(options).toContain(C.downloadEncrypted);
    expect(options).toContain(C.rename);
    expect(options).toContain(C.moveTo);
  });

  it("Archived private room opened: the room menu is the archive one and the folder keeps the active-room rules", () => {
    env.rootFolderType = FolderType.Archive;

    const options = headerOptions({ roomId: 10 } as EncryptedFileActions);

    expect(env.roomMenuArgs[3]).toBe(true);
    expect(options).toContain(C.downloadEncrypted);
    expect(options).toContain(C.download);
    expect(options).not.toContain(C.copy);
  });

  it("leaves the header of a folder outside private rooms as it was", () => {
    const options = headerOptions(null);

    expect(options).toContain(C.copy);
    expect(options).toContain(C.duplicate);
    expect(options).not.toContain(C.downloadEncrypted);
  });
});
