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

import { beforeEach, describe, expect, it, vi } from "vitest";

import { FolderType } from "@docspace/ui-kit/enums";

const sendCustomAction = vi.fn();
vi.mock("@docspace/shared/utils/frameCustomActions", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  sendCustomAction: (event: unknown) => sendCustomAction(event),
}));

import type ContextOptionsStore from "../../ContextOptionsStore";
import {
  getFrameCreateActionsImpl,
  onLoadFrameActionsImpl,
  onMultiLoadFrameActionsImpl,
} from "../frameActions.helpers";

const makeStore = (isFrame = true) =>
  ({
    settingsStore: {
      isFrame,
      frameCustomActions: {
        contextMenu: {
          file: [{ key: "send", label: "Send", extensions: ["docx"] }],
          room: [{ key: "unlink", label: "Unlink", section: ["rooms"] }],
        },
        createMenu: [{ key: "upload", label: "Upload from CRM" }],
      },
    },
    selectedFolderStore: { rootFolderType: FolderType.Rooms, id: 7 },
  }) as unknown as ContextOptionsStore;

const file = { id: 1, fileExst: ".docx", title: "a.docx" };
const room = { id: 2, isRoom: true, parentId: 0, roomType: 6 };

beforeEach(() => sendCustomAction.mockClear());

describe("frame custom actions in Manager menus", () => {
  it("adds the matching file action and reports the click", () => {
    const [option] = onLoadFrameActionsImpl(makeStore(), file as never);

    expect(option).toMatchObject({ key: "sdk-action-send", label: "Send" });
    (option.onClick as () => void)();
    expect(sendCustomAction).toHaveBeenCalledWith({
      action: "send",
      type: "file",
      item: file,
      items: [file],
      folderId: 7,
    });
  });

  it("uses the room list for rooms in the rooms section", () => {
    expect(
      onLoadFrameActionsImpl(makeStore(), room as never).map((o) => o.key),
    ).toEqual(["sdk-action-unlink"]);
  });

  it("adds nothing outside a frame", () => {
    expect(onLoadFrameActionsImpl(makeStore(false), file as never)).toEqual([]);
    expect(getFrameCreateActionsImpl(makeStore(false))).toEqual([]);
  });

  it("reports the whole selection for a group action", () => {
    const second = { ...file, id: 3 };
    const [option] = onMultiLoadFrameActionsImpl(makeStore(), [
      file,
      second,
    ] as never);

    (option.onClick as () => void)();
    expect(sendCustomAction).toHaveBeenCalledWith({
      action: "send",
      type: "file",
      items: [file, second],
      folderId: 7,
    });
  });

  it("adds create menu items with the current folder", () => {
    const [option] = getFrameCreateActionsImpl(makeStore());

    (option.onClick as () => void)();
    expect(sendCustomAction).toHaveBeenCalledWith({
      action: "upload",
      type: "create",
      folderId: 7,
    });
  });
});
