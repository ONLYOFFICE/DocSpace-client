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

import { FolderType } from "@docspace/shared/enums";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock("@/providers/SdkCustomActionsProvider", () => ({
  useSdkCustomActions: () => ({
    customActions: {
      contextMenu: {
        file: [{ key: "sign", label: "Sign" }],
        folder: [{ key: "archive", label: "Archive" }],
      },
    },
  }),
}));

vi.mock("../_store/FilesListStore", () => ({
  useFilesListStore: () => ({
    rootFolderType: FolderType.Rooms,
    currentFolder: { id: 10 },
  }),
}));

import {
  EncryptedFileActionsContext,
  type EncryptedFileActions,
} from "../_contexts/EncryptedFileActionsContext";
import useSdkCustomContextActions from "./useSdkCustomContextActions";
import type { TFileItem, TFolderItem } from "./useItemList";

const file = (encrypted: boolean) =>
  ({
    id: 7,
    title: "report.docx",
    fileExst: ".docx",
    encrypted,
    security: {},
  }) as unknown as TFileItem;

const folder = { id: 11, title: "Drafts", isFolder: true, security: {} } as unknown as TFolderItem;

describe("useSdkCustomContextActions", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  const render = (actions: EncryptedFileActions | null) => {
    let hook!: ReturnType<typeof useSdkCustomContextActions>;
    const Probe = () => {
      hook = useSdkCustomContextActions();
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
    return hook;
  };

  const keys = (items: { key: string }[]) => items.map((i) => i.key);

  it("Integrator action on an encrypted file: the custom actions are not shown", () => {
    const hook = render(null);

    expect(hook.getItemCustomActions(file(true))).toEqual([]);
    expect(hook.getGroupCustomActions([file(false), file(true)])).toEqual([]);
    expect(keys(hook.getItemCustomActions(file(false)))).toEqual([
      "sdk-action-sign",
    ]);
  });

  it("withholds the custom actions from every item of a private room", () => {
    const hook = render({ roomId: 10 } as EncryptedFileActions);

    expect(hook.getItemCustomActions(file(false))).toEqual([]);
    expect(hook.getItemCustomActions(folder)).toEqual([]);
    expect(hook.getGroupCustomActions([folder])).toEqual([]);
  });
});
