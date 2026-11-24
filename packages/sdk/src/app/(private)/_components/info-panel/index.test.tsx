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

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  selection: null as Record<string, unknown> | null,
  tabs: [] as { id: string }[],
  rootFolderType: 0,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/aside", () => ({
  AsideHeader: () => null,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/tabs", () => ({
  Tabs: ({ items }: { items: { id: string }[] }) => {
    mocks.tabs = items;
    return null;
  },
}));

vi.mock("@/app/(docspace)/_store/InfoPanelStore", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useInfoPanelStore: () => ({
    selection: mocks.selection,
    fileView: "info_details",
    isVisible: false,
    isPinnedSelection: false,
    setView: vi.fn(),
    close: vi.fn(),
    setSelection: vi.fn(),
    setPinnedSelection: vi.fn(),
  }),
}));

vi.mock("@/app/(docspace)/_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => ({ selection: [], bufferSelection: null }),
}));
vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => ({
    currentFolder: mocks.selection,
    rootFolderType: mocks.rootFolderType,
  }),
}));
vi.mock("@/app/(docspace)/_store/DialogsStore", () => ({
  useDialogsStore: () => ({}),
}));
vi.mock("@/app/(docspace)/_store/NavigationStore", () => ({
  useNavigationStore: () => ({}),
}));
vi.mock("@/app/(personal-files)/_store/DocsUserStore", () => ({
  useDocsUserStore: () => ({ user: { id: "me" } }),
}));
vi.mock("../../_store/PrivateDialogsStore", () => ({
  usePrivateDialogsStore: () => ({}),
}));
vi.mock("../members/PrivateMembersView", () => ({ default: () => null }));
vi.mock("@/app/(docspace)/_components/info-panel/views/Details", () => ({
  default: () => null,
}));
vi.mock("@/app/(docspace)/_components/info-panel/views/History", () => ({
  default: () => null,
}));
// The room menu of the panel header, reduced to the actions it starts.
vi.mock(
  "@/app/(docspace)/_components/info-panel/sub-components/RoomHeader",
  async () => {
    const { RoomActionsContext } = await import(
      "@/app/(rooms)/_contexts/RoomActionsContext"
    );
    const RoomHeader = ({ selection }: { selection: unknown }) => {
      const actions = React.useContext(RoomActionsContext);
      const item = selection as never;
      return (
        <div>
          <button type="button" onClick={() => actions?.editRoom?.(item)}>
            edit
          </button>
          <button type="button" onClick={() => actions?.inviteRoom?.(item)}>
            invite
          </button>
          <button type="button" onClick={() => actions?.changeOwner?.(item)}>
            owner
          </button>
        </div>
      );
    };
    return { default: RoomHeader };
  },
);

import { InfoPanelHeader } from "@/app/(docspace)/_components/info-panel";
import { RoomActionsOverrideContext } from "@/app/(rooms)/_contexts/RoomActionsOverrideContext";
import { PrivateInfoPanelBody, PrivateInfoPanelHeader } from ".";

describe("PrivateInfoPanelHeader", () => {
  let root: Root | null = null;

  const tabsFor = (
    selection: Record<string, unknown>,
    Header: React.ComponentType = PrivateInfoPanelHeader,
  ) => {
    mocks.selection = selection;
    mocks.tabs = [];
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Header />));
    const ids = mocks.tabs.map((tab) => tab.id);
    act(() => root?.unmount());
    root = null;
    return ids;
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Encrypted file selected", () => {
    const file = {
      id: 7,
      title: "memo.docx",
      fileExst: ".docx",
      encrypted: true,
      canShare: true,
    };

    expect(tabsFor(file)).toEqual(["info_history", "info_details"]);
    expect(tabsFor(file, InfoPanelHeader)).toContain("info_share");
  });

  it("Manager in the SDK", () => {
    const security = { EditAccess: true };
    const room = { id: 10, title: "Vault", isRoom: true, private: true, security };
    const file = { id: 7, fileExst: ".docx", encrypted: true, shared: true, security };
    const folder = { id: 8, isFolder: true, shared: true, security };

    for (const selection of [room, file, folder]) {
      expect(tabsFor(selection)).not.toContain("info_share");
    }
  });

  it("Private room selected", () => {
    const privateRoom = { id: 10, title: "Vault", isRoom: true, private: true };

    expect(tabsFor(privateRoom)).toEqual([
      "info_members",
      "info_history",
      "info_details",
    ]);
  });
});

describe("PrivateInfoPanelBody — room menu of an open room", () => {
  const ROOM = {
    id: 10,
    title: "Vault",
    isRoom: true,
    private: true,
    roomType: 2,
    security: { EditRoom: true },
  };
  const override = {
    editRoom: vi.fn(),
    inviteRoom: vi.fn(),
    changeOwner: vi.fn(),
    leaveRoom: vi.fn(),
  };
  let root: Root | null = null;
  let container: HTMLDivElement;

  const renderOpenRoomPanel = () => {
    mocks.selection = ROOM;
    container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <RoomActionsOverrideContext.Provider value={override}>
          <PrivateInfoPanelBody />
        </RoomActionsOverrideContext.Provider>,
      ),
    );
  };

  const click = (label: string) =>
    act(() =>
      Array.from(container.querySelectorAll("button"))
        .find((b) => b.textContent === label)
        ?.click(),
    );

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Edit from the info panel of an open room", () => {
    renderOpenRoomPanel();
    click("edit");
    expect(override.editRoom).toHaveBeenCalledWith(
      expect.objectContaining({ id: ROOM.id }),
    );
  });

  it("Invite from the info panel of an open room", () => {
    renderOpenRoomPanel();
    click("invite");
    expect(override.inviteRoom).toHaveBeenCalledWith(
      expect.objectContaining({ id: ROOM.id }),
    );
  });

  it("Owner change from the info panel of an open room", () => {
    renderOpenRoomPanel();
    click("owner");
    expect(override.changeOwner).toHaveBeenCalledWith(
      expect.objectContaining({ id: ROOM.id }),
    );
  });
});
