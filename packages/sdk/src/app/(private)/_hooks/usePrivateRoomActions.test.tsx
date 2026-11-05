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

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      getRoomInfo: vi.fn(async () => ({ id: 10, title: "Renamed vault" })),
    },
  },
}));

import {
  FilesListStore,
  FilesListStoreContext,
} from "@/app/(docspace)/_store/FilesListStore";
import { InfoPanelStoreContextProvider } from "@/app/(docspace)/_store/InfoPanelStore";
import {
  NavigationStoreContextProvider,
  useNavigationStore,
} from "@/app/(docspace)/_store/NavigationStore";
import { RoomActionsOverrideContext } from "@/app/(rooms)/_contexts/RoomActionsOverrideContext";
import useRoomActions from "@/app/(rooms)/_hooks/useRoomActions";

import {
  PrivateDialogsStoreProvider,
  usePrivateDialogsStore,
} from "../_store/PrivateDialogsStore";
import { usePrivateRoomActions } from "./usePrivateRoomActions";

describe("usePrivateRoomActions", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Info panel menu of an open room: edit, invite, change owner and leave open the private dialogs", () => {
    const onRoomChanged = vi.fn();
    let actions: ReturnType<typeof usePrivateRoomActions> | null = null;
    let dialogs: ReturnType<typeof usePrivateDialogsStore> | null = null;
    const Probe = () => {
      actions = usePrivateRoomActions({ onRoomChanged });
      dialogs = usePrivateDialogsStore();
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <PrivateDialogsStoreProvider>
          <Probe />
        </PrivateDialogsStoreProvider>,
      ),
    );
    const room = {
      id: 10,
      title: "Vault",
      private: true,
      createdBy: { id: "owner" },
    } as never;

    act(() => {
      actions!.editRoom(room);
      actions!.inviteRoom(room);
      actions!.changeOwner(room);
      actions!.leaveRoom(room);
    });

    expect(dialogs!.createEditRoom?.room).toEqual(
      expect.objectContaining({ id: 10, title: "Vault", private: true }),
    );
    expect(dialogs!.invitePanel).toEqual(
      expect.objectContaining({ roomId: 10 }),
    );
    expect(dialogs!.changeOwner).toEqual(
      expect.objectContaining({ roomId: 10, roomOwnerId: "owner" }),
    );
    expect(dialogs!.leaveRoom?.room).toEqual(room);

    act(() => dialogs!.changeOwner?.onChanged?.());
    expect(onRoomChanged).toHaveBeenCalledWith(10);
  });

  it("Rename from the header of an open room: the header title takes the new name", async () => {
    const filesListStore = new FilesListStore();
    filesListStore.setCurrentFolder({ id: 10, title: "Vault" } as never);
    let headerActions: ReturnType<typeof useRoomActions> | null = null;
    let dialogs: ReturnType<typeof usePrivateDialogsStore> | null = null;
    let navigation: ReturnType<typeof useNavigationStore> | null = null;
    // The private room page passes the generic roomChanged as onRoomChanged.
    const PrivatePage = ({ children }: { children: React.ReactNode }) => {
      const { roomChanged } = useRoomActions();
      const actions = usePrivateRoomActions({ onRoomChanged: roomChanged });
      return (
        <RoomActionsOverrideContext.Provider value={actions}>
          {children}
        </RoomActionsOverrideContext.Provider>
      );
    };
    const Header = () => {
      headerActions = useRoomActions();
      dialogs = usePrivateDialogsStore();
      navigation = useNavigationStore();
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <FilesListStoreContext.Provider value={filesListStore}>
          <NavigationStoreContextProvider>
            <InfoPanelStoreContextProvider>
              <PrivateDialogsStoreProvider>
                <PrivatePage>
                  <Header />
                </PrivatePage>
              </PrivateDialogsStoreProvider>
            </InfoPanelStoreContextProvider>
          </NavigationStoreContextProvider>
        </FilesListStoreContext.Provider>,
      ),
    );
    act(() => navigation!.setCurrentTitle("Vault"));

    act(() =>
      headerActions!.editRoom({ id: 10, title: "Vault", private: true } as never),
    );
    await act(async () => {
      await dialogs!.createEditRoom?.onEdited?.(10);
    });

    expect(navigation!.currentTitle).toBe("Renamed vault");
    expect(filesListStore.currentFolder?.title).toBe("Renamed vault");
  });
});
