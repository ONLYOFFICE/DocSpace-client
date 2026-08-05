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

import { makeAutoObservable, runInAction } from "mobx";

import { interceptRoute } from "@docspace/shared/api/client";
import type { TGetRooms } from "@docspace/shared/api/rooms/types";

import { buildDemoRooms, buildDemoMembers, type TourDemoConfig } from "./data";

/** `/files/rooms` — the room list of the section the tour walks through. */
const ROOMS_LIST_ROUTE = /\/files\/rooms(\?|$)/;

/** `/files/rooms/{id}/share` — a room's members, and its external links. */
const ROOM_MEMBERS_ROUTE = /\/files\/rooms\/[^/]+\/share(\?|$)/;

/** `/files/rooms/{id}/history` — the activity feed of a room. */
const ROOM_HISTORY_ROUTE = /\/files\/rooms\/[^/]+\/history(\?|$)/;

const matches = (route: RegExp) => (config: { url?: string }) =>
  !!config.url && route.test(config.url);

/**
 * The rooms tour on a portal that has no rooms yet.
 *
 * An empty Rooms section renders neither the quick-actions banner nor the
 * filter bar (`isEmptyPage` gates both), so a tour there would be reduced to
 * its sidebar steps — nothing about creating a room, nothing about what a room
 * row does, nothing about members. Rather than teach a stripped-down section,
 * the tour borrows a portal: while it runs, the room requests are answered
 * locally instead of going to the server.
 *
 * The interception is the same one the Playwright suite uses on its own
 * requests — `interceptRoute` claims a URL and returns the body the server
 * would have sent. Nothing downstream of the request knows the difference, so
 * the store, the list, the filter bar and the info panel all behave exactly as
 * they do on a portal with rooms of its own, and none of them needs a branch.
 *
 * Everything else follows from that one substitution. `isEmptyPage` is set
 * from the answer's `folders.length` when the section loads and cleared again
 * by the `filesList` computed, so a non-empty answer brings the banner, the
 * filter bar and the table header back without a single override.
 *
 * Two things keep the pretence contained:
 *  - it is only ever switched on when the real list came back empty, so a
 *    portal with rooms of its own never sees a room it does not have;
 *  - react-joyride blocks every click outside its spotlight, so while the tour
 *    runs the demo rooms cannot be opened, selected or acted on.
 *
 * The tour hands the section back by dropping the mocks and reloading it,
 * which is what the closing step does before pointing at the real "create a
 * room" button.
 */
class TourDemo {
  config: TourDemoConfig | null = null;

  /** Undoes every `interceptRoute` call made by `activate`. */
  private teardown: (() => void)[] = [];

  constructor() {
    makeAutoObservable<this, "teardown">(this, { teardown: false });
  }

  get isActive() {
    return this.config !== null;
  }

  activate = (config: TourDemoConfig) => {
    if (this.config) return;

    runInAction(() => {
      this.config = config;
    });

    this.teardown = [
      // The list is the one request that still goes to the server: its answer
      // carries the folder the section is in, its ids and its path, and every
      // one of those has to stay genuine — a fabricated `current` is how a
      // stand-in list turns into a section that thinks it is somewhere else.
      // Only `folders` is swapped, on a response that is otherwise real.
      interceptRoute({
        match: matches(ROOMS_LIST_ROUTE),
        transform: (data) => {
          const envelope = data as { response?: TGetRooms } | null;
          const rooms = envelope?.response;
          if (!rooms?.current) return data;

          const folders = buildDemoRooms(rooms.current, config);

          return {
            ...envelope,
            response: {
              ...rooms,
              folders,
              count: folders.length,
              total: folders.length,
            },
          };
        },
      }),
      interceptRoute({
        match: matches(ROOM_MEMBERS_ROUTE),
        fulfill: (request) => {
          // `filterType=2` asks for the room's external links, which a demo
          // room has none of; the caller reads an empty list as "no links yet".
          const isLinks = /[?&]filterType=2(&|$)/.test(request.url ?? "");
          if (isLinks) return { total: 0, response: [] };

          const items = buildDemoMembers(config);
          return { total: items.length, response: items };
        },
      }),
      // History is answered empty rather than invented: its entries go through
      // `getSupportedFeeds`/`parseHistory` and are rendered by a feed
      // translator, so a fabricated one is far likelier to be silently dropped
      // than to teach anything. This is here so a demo room does not ask the
      // server about a room it has never heard of.
      interceptRoute({
        match: matches(ROOM_HISTORY_ROUTE),
        fulfill: () => ({ total: 0, response: [] }),
      }),
    ];
  };

  deactivate = () => {
    this.teardown.forEach((remove) => remove());
    this.teardown = [];

    runInAction(() => {
      this.config = null;
    });
  };
}

export const tourDemo = new TourDemo();
