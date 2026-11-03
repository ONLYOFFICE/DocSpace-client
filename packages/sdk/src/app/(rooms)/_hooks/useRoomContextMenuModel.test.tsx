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

import { RoomsType } from "@docspace/shared/enums";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  selection: [] as object[],
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/app/(docspace)/_hooks/useFolderActions", () => ({
  default: () => ({ openFolder: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_hooks/useDownloadActions", () => ({
  default: () => ({ downloadAction: vi.fn() }),
}));

vi.mock("@/app/(personal-files)/_hooks/useOperationToast", () => ({
  default: () => ({ showDuplicateToast: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => ({
    get selection() {
      return mocks.selection;
    },
    addSelection: vi.fn(),
    setBufferSelection: vi.fn(),
    isCheckedItem: () => mocks.selection.length > 0,
  }),
}));

vi.mock("@/app/(docspace)/_store/DialogsStore", () => ({
  useDialogsStore: () => ({ openDialog: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_store/InfoPanelStore", () => ({
  useInfoPanelStore: () => ({
    setLinkParams: vi.fn(),
    setEmbeddingPanelData: vi.fn(),
  }),
}));

vi.mock("../_store/RoomsOperationsStore", () => ({
  useRoomsOperationsStore: () => ({
    startOperation: vi.fn(),
    finishOperation: vi.fn(),
  }),
}));

import { RoomActionsOverrideContext } from "../_contexts/RoomActionsOverrideContext";
import useRoomContextMenuModel from "./useRoomContextMenuModel";

/** Every right a room's `security` can carry, all granted. */
const ALL_RIGHTS = {
  Pin: true,
  ChangeOwner: true,
  Download: true,
  Duplicate: true,
  EditRoom: true,
  EditAccess: true,
  Mute: true,
  Move: true,
  Delete: true,
  Embed: true,
  CopySharedLink: true,
};

const room = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 7001,
    title: "Room",
    isFolder: true,
    inRoom: true,
    roomType: RoomsType.CustomRoom,
    security: ALL_RIGHTS,
    ...overrides,
  }) as never;

const keysOf = (model: ContextMenuModel[]): string[] =>
  model.flatMap((entry) => [
    String(entry.key),
    ...("items" in entry && entry.items ? keysOf(entry.items) : []),
  ]);

/** Fails on a separator that leads, trails or follows another, at any depth. */
const expectTidySeparators = (model: ContextMenuModel[]) => {
  model.forEach((entry, index) => {
    if (entry.isSeparator) {
      expect(index).toBeGreaterThan(0);
      expect(index).toBeLessThan(model.length - 1);
      expect(model[index - 1].isSeparator).toBeFalsy();
    }
    if ("items" in entry && entry.items) {
      expect(entry.items.length).toBeGreaterThan(0);
      expectTidySeparators(entry.items);
    }
  });
};

const WITHHELD = [
  "download",
  "duplicate",
  "embedding-settings",
  "external-link",
  "link-for-room-members",
];

describe("useRoomContextMenuModel", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    mocks.selection = [];
  });

  const menuOf = (item: never, isArchive = false, skipSelect = true) => {
    let model: ContextMenuModel[] = [];
    const Probe = () => {
      const { getContextModel } = useRoomContextMenuModel(
        undefined,
        undefined,
        undefined,
        isArchive,
      );
      model = getContextModel(item, skipSelect);
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
    return model;
  };

  it("Private room menu: duplicate, embedding settings, download and link entries are absent", () => {
    const model = menuOf(room({ private: true }));
    const keys = keysOf(model);

    for (const key of WITHHELD) expect(keys).not.toContain(key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "edit-room",
        "invite-users-to-room",
        "room-info",
        "change-room-owner",
      ]),
    );
    expectTidySeparators(model);
  });

  it("offers invite in a private room to a user who may edit the room", () => {
    const invite = (security: Record<string, boolean>) =>
      menuOf(room({ private: true, security })).find(
        (entry) => entry.key === "invite-users-to-room",
      ) as { disabled?: boolean };

    expect(invite({ ...ALL_RIGHTS, EditAccess: false }).disabled).toBe(false);
    act(() => root?.unmount());
    expect(invite({ ...ALL_RIGHTS, EditRoom: false }).disabled).toBe(true);
  });

  it("Private room in the list: the archive offers no download", () => {
    const model = menuOf(room({ private: true }), true);

    expect(keysOf(model)).not.toContain("download");
    expectTidySeparators(model);
  });

  it("Selected private rooms: no download entry is offered", () => {
    mocks.selection = [room({ private: true }), room({ id: 7002 })];

    const model = menuOf(room({ private: true }), false, false);

    expect(keysOf(model)).not.toContain("download");
    expect(keysOf(model)).toContain("archive-rooms");
    expectTidySeparators(model);
  });

  it("opens the private leave dialog on the private pages", () => {
    const override = {
      editRoom: vi.fn(),
      inviteRoom: vi.fn(),
      changeOwner: vi.fn(),
      leaveRoom: vi.fn(),
    };
    const item = room({ private: true, inRoom: true });
    let model: ContextMenuModel[] = [];
    const Probe = () => {
      model = useRoomContextMenuModel().getContextModel(item, true);
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <RoomActionsOverrideContext.Provider value={override}>
          <Probe />
        </RoomActionsOverrideContext.Provider>,
      ),
    );

    const leave = model.find((entry) => entry.key === "leave-room") as unknown as {
      onClick: () => void;
    };
    act(() => leave.onClick());

    expect(override.leaveRoom).toHaveBeenCalledWith(item);
  });

  it("leaves the menu of a room without the private setting as it was", () => {
    const keys = keysOf(menuOf(room()));

    expect(keys).toEqual(
      expect.arrayContaining(["download", "duplicate", "embedding-settings"]),
    );
    expect(keys).toContain("external-link");
  });
});
