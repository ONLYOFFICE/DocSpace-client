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

import { afterEach, describe, expect, it, vi } from "vitest";
import { CanceledError } from "axios";

import api from "@docspace/shared/api";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { FilterKeys, FolderType, RoomSearchArea } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";

describe.each(["setCustomRoomQuota", "resetRoomQuota"] as const)(
  "FilesStore.%s",
  (action) => {
    afterEach(() => vi.restoreAllMocks());

    const setup = () => {
      vi.spyOn(api.rooms, action).mockResolvedValue([]);
      const store = createTestFilesStore();
      const fetchRooms = vi
        .fn<typeof store.fetchRooms>()
        .mockResolvedValue(undefined);
      store.fetchRooms = fetchRooms;
      const updateQuota = (inRoom?: boolean) =>
        action === "setCustomRoomQuota"
          ? store.setCustomRoomQuota([1], -1, inRoom)
          : store.resetRoomQuota([1], inRoom);

      return { store, fetchRooms, updateQuota };
    };

    it.each([
      ["Forms", RoomSearchArea.Forms],
      ["Rooms", RoomSearchArea.Active],
      ["Templates", RoomSearchArea.Templates],
    ])("keeps the current %s list filter", async (_, searchArea) => {
      const { store, fetchRooms, updateQuota } = setup();
      const filter = RoomsFilter.getDefault(undefined, searchArea);
      filter.filterValue = "invoice";
      filter.tags = ["finance"];
      filter.sortBy = "AZ";
      filter.sortOrder = "ascending";
      store.setRoomsFilter(filter);

      await updateQuota();

      expect(fetchRooms).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          searchArea,
          filterValue: "invoice",
          tags: ["finance"],
          sortBy: "AZ",
          sortOrder: "ascending",
        }),
        false,
        false,
        false,
      );
      expect(fetchRooms.mock.calls[0][1]).not.toBe(store.roomsFilter);
    });

    it("prefers the current URL filter over the stored filter", async () => {
      const { store, fetchRooms, updateQuota } = setup();
      const currentFilter = RoomsFilter.getDefault(
        undefined,
        RoomSearchArea.Forms,
      );
      currentFilter.filterValue = "invoice";
      const storedFilter = currentFilter.clone();
      storedFilter.filterValue = "report";
      store.setRoomsFilter(storedFilter);

      const { href } = window.location;
      const { state } = window.history;
      try {
        window.history.replaceState(
          state,
          "",
          `/forms/filter?${currentFilter.toUrlParams()}`,
        );
        await updateQuota();

        expect(fetchRooms).toHaveBeenCalledTimes(1);
        expect(fetchRooms.mock.calls[0][1]).toMatchObject({
          searchArea: RoomSearchArea.Forms,
          filterValue: "invoice",
        });
      } finally {
        window.history.replaceState(state, "", href);
      }
    });

    it("does not reload the list from inside a room", async () => {
      const { fetchRooms, updateQuota } = setup();

      await updateQuota(true);

      expect(fetchRooms).not.toHaveBeenCalled();
    });

    it("returns the saved rooms when a newer request cancels the list refresh", async () => {
      const { fetchRooms, updateQuota } = setup();
      const updatedRooms = [{ id: 1 }];
      vi.mocked(api.rooms[action]).mockResolvedValueOnce(updatedRooms);
      fetchRooms.mockRejectedValueOnce(new CanceledError());

      await expect(updateQuota()).resolves.toBe(updatedRooms);
    });

    it.each(["/rooms/shared/filter", "/forms/12/filter?folder=12"])(
      "does not reload the old list after navigating to %s",
      async (pathname) => {
        const { store, fetchRooms, updateQuota } = setup();
        store.setRoomsFilter(
          RoomsFilter.getDefault(undefined, RoomSearchArea.Forms),
        );
        const updatedRooms = [{ id: 1 }];
        const request = Promise.withResolvers<typeof updatedRooms>();
        vi.mocked(api.rooms[action]).mockReturnValueOnce(request.promise);

        const { href } = window.location;
        const { state } = window.history;
        try {
          window.history.replaceState(state, "", "/forms/filter");
          const pending = updateQuota();
          window.history.replaceState(state, "", pathname);
          request.resolve(updatedRooms);

          await expect(pending).resolves.toBe(updatedRooms);
          expect(fetchRooms).not.toHaveBeenCalled();
        } finally {
          window.history.replaceState(state, "", href);
        }
      },
    );

    it("reloads the section default when the query is cleared during a quota update", async () => {
      const { store, fetchRooms, updateQuota } = setup();
      const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.Forms);
      filter.filterValue = "invoice";
      store.setRoomsFilter(filter);

      const request = Promise.withResolvers<unknown>();
      vi.mocked(api.rooms[action]).mockReturnValueOnce(request.promise);
      const { href } = window.location;
      const { state } = window.history;
      try {
        window.history.replaceState(
          state,
          "",
          `/forms/filter?${filter.toUrlParams()}`,
        );
        const pending = updateQuota();
        window.history.replaceState(state, "", "/forms/filter");

        request.resolve([{ id: 1 }]);
        await pending;

        expect(fetchRooms).toHaveBeenCalledTimes(1);
        expect(fetchRooms.mock.calls[0][1]).toMatchObject({
          searchArea: RoomSearchArea.Forms,
          filterValue: null,
        });
      } finally {
        window.history.replaceState(state, "", href);
      }
    });

    it("uses the URL filter after returning to the original address during a quota update", async () => {
      const { store, fetchRooms, updateQuota } = setup();
      const originalFilter = RoomsFilter.getDefault(
        undefined,
        RoomSearchArea.Forms,
      );
      originalFilter.filterValue = "invoice";
      const intermediateFilter = originalFilter.clone();
      intermediateFilter.filterValue = "report";
      store.setRoomsFilter(originalFilter);

      const request = Promise.withResolvers<unknown>();
      vi.mocked(api.rooms[action]).mockReturnValueOnce(request.promise);
      const { href } = window.location;
      const { state } = window.history;
      const originalAddress = `/forms/filter?${originalFilter.toUrlParams()}`;
      try {
        window.history.replaceState(state, "", originalAddress);
        const pending = updateQuota();
        window.history.replaceState(
          state,
          "",
          `/forms/filter?${intermediateFilter.toUrlParams()}`,
        );
        store.setRoomsFilter(intermediateFilter);
        window.history.replaceState(state, "", originalAddress);

        request.resolve([{ id: 1 }]);
        await pending;

        expect(fetchRooms).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            searchArea: RoomSearchArea.Forms,
            filterValue: "invoice",
          }),
          false,
          false,
          false,
        );
      } finally {
        window.history.replaceState(state, "", href);
      }
    });

    it.each([
      { initialListLoaded: true, timing: "after the filtered list loaded" },
      { initialListLoaded: false, timing: "before the filtered list loaded" },
    ])(
      "refreshes the current filter when quota is saved $timing",
      async ({ initialListLoaded }) => {
        const store = createTestFilesStore();
        const quotaRequest = Promise.withResolvers<unknown>();
        vi.spyOn(api.rooms, action).mockReturnValue(quotaRequest.promise);
        const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.Active);
        filter.quotaFilter =
          action === "resetRoomQuota"
            ? FilterKeys.customQuota
            : FilterKeys.defaultQuota;

        const { href } = window.location;
        const { state } = window.history;
        let quotaSaved = false;
        const getRooms = vi
          .spyOn(api.rooms, "getRooms")
          .mockImplementation(async (requestFilter) => {
            const folders =
              quotaSaved && requestFilter.quotaFilter === filter.quotaFilter
                ? [{ id: 2 }]
                : [{ id: 1 }, { id: 2 }];

            return {
              startIndex: 0,
              count: folders.length,
              total: folders.length,
              folders,
              files: [],
              new: 0,
              pathParts: [],
              current: {
                id: 7,
                parentId: 0,
                rootFolderType: FolderType.Rooms,
                security: {},
              },
            } as unknown as Awaited<ReturnType<typeof api.rooms.getRooms>>;
          });

        try {
          window.history.replaceState(state, "", "/rooms/shared/filter");
          const pending =
            action === "setCustomRoomQuota"
              ? store.setCustomRoomQuota([1], -1)
              : store.resetRoomQuota([1]);
          window.history.replaceState(
            state,
            "",
            `/rooms/shared/filter?${filter.toUrlParams()}`,
          );
          if (initialListLoaded) {
            await store.fetchRooms(null, filter);
            expect(store.folders.map(({ id }) => id)).toEqual([1, 2]);
          }

          quotaSaved = true;
          quotaRequest.resolve([{ id: 1 }]);
          await pending;

          expect(getRooms).toHaveBeenCalledTimes(initialListLoaded ? 2 : 1);
          expect(store.folders.map(({ id }) => id)).toEqual([2]);
        } finally {
          window.history.replaceState(state, "", href);
        }
      },
    );
  },
);
