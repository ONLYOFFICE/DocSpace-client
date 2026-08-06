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
import type { TGetRooms, TRoom } from "@docspace/shared/api/rooms/types";
import type { TFolder } from "@docspace/shared/api/files/types";

import {
  buildDemoRooms,
  buildDemoMembers,
  buildDemoSpaceContents,
  type TourDemoConfig,
} from "./data";

/**
 * The api module is not consistent about the leading slash — `getRooms` asks
 * for `/files/rooms`, `getExternalLinks` for `files/rooms/{id}/links` — so
 * every pattern here has to allow both. A route anchored on the slash silently
 * misses half the requests it was written for.
 */
const route = (pattern: string) => new RegExp(`(?:^|/)files/${pattern}`);

/** `files/rooms` — the room list of the section the tour walks through. */
const ROOMS_LIST_ROUTE = route("rooms(\\?|$)");

/**
 * Everything else is claimed for negative ids only. Every id the server hands
 * out is positive, so none of these can take over a room or a folder the
 * portal actually has — a demo id is the only thing they match.
 */

/** `files/rooms/{id}` — one room, asked about by id. */
const ROOM_INFO_ROUTE = route("rooms/(-\\d+)(\\?|$)");

/** `files/rooms/{id}/share` — a room's members. */
const ROOM_MEMBERS_ROUTE = route("rooms/-\\d+/share(\\?|$)");

/**
 * `files/rooms/{id}/links` — a room's external links, which is what a form
 * space shares to be filled in. Fetched by `fetchFilesImpl` the moment a form
 * room is opened, and awaited inside the same promise as the folder itself —
 * so a stand-in space that cannot answer it fails the whole load and lands the
 * user on the "room not available" screen.
 */
const ROOM_LINKS_ROUTE = route("rooms/-\\d+/links(\\?|$)");

/** `files/{file|folder}/{id}/log` — the activity feed of a room or folder. */
const ROOM_HISTORY_ROUTE = route("(?:file|folder)/-\\d+/log(\\?|$)");

/** `files/{id}` — the contents of a folder. */
const DEMO_FOLDER_ROUTE = route("(-\\d+)(\\?|$)");

const matches = (route: RegExp) => (config: { url?: string }) =>
  !!config.url && route.test(config.url);

const idFromRoute = (route: RegExp, url?: string) => {
  const id = url?.match(route)?.[1];
  return id ? Number(id) : null;
};

/**
 * A section tour on a portal that has nothing in that section yet.
 *
 * Both room-backed sections — Rooms and Forms — go through `/files/rooms`, and
 * an empty one renders neither the quick-actions banner nor the filter bar
 * (`isEmptyPage` gates both), so a tour there would be reduced to its sidebar
 * steps — nothing about creating anything, nothing about what a row does,
 * nothing about members. Rather than teach a stripped-down section, the tour
 * borrows a portal: while it runs, the room requests are answered locally
 * instead of going to the server.
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
 * The forms tour goes one step further and walks into a stand-in space, so the
 * contents of a demo room are answered locally too (`DEMO_FOLDER_ROUTE`).
 *
 * The tour hands the section back by dropping the mocks and reloading it,
 * which is what the closing step does before pointing at the real "create a
 * room" button.
 */
class TourDemo {
  config: TourDemoConfig | null = null;

  /**
   * The folder the section itself lives in, and the stand-in rooms built under
   * it — both taken from the answer the list transform saw, so walking into a
   * demo room does not have to invent a second version of either.
   */
  private sectionRoot: TFolder | null = null;

  private rooms: TRoom[] = [];

  /** Undoes every `interceptRoute` call made by `activate`. */
  private teardown: (() => void)[] = [];

  constructor() {
    makeAutoObservable<this, "teardown" | "sectionRoot" | "rooms">(this, {
      teardown: false,
      sectionRoot: false,
      rooms: false,
    });
  }

  get isActive() {
    return this.config !== null;
  }

  /** Whether the section's own list is the one being shown. */
  get isStandingInForList() {
    return this.config?.standInForList ?? false;
  }

  /**
   * The stand-in room a tour walks into, addressed directly rather than read
   * off the list — the list may be the user's own, and it is the one thing
   * about the section that changes underfoot while the tour navigates.
   */
  get space() {
    return this.rooms[0] ?? null;
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
      // Only `folders` is swapped, on a response that is otherwise real, and
      // only when the tour is standing in for the list at all. The rooms are
      // built either way: that is where the space a tour walks into comes from.
      interceptRoute({
        match: matches(ROOMS_LIST_ROUTE),
        transform: (data) => {
          const envelope = data as { response?: TGetRooms } | null;
          const rooms = envelope?.response;
          if (!rooms?.current) return data;

          const folders = buildDemoRooms(rooms.current, config);

          this.sectionRoot = rooms.current;
          this.rooms = folders;

          if (!config.standInForList) return data;

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
      // One room, for the panels that ask about it by id rather than reading
      // it off the list they were handed.
      interceptRoute({
        match: matches(ROOM_INFO_ROUTE),
        fulfill: (request) => {
          const id = idFromRoute(ROOM_INFO_ROUTE, request.url);
          const room = this.rooms.find((item) => item.id === id);

          return { response: room ?? null };
        },
      }),
      // `{ total, response }` rather than a bare list: the client turns any
      // payload carrying a top-level `total` into `{ total, items }`, which is
      // the `TGetRoomMembers` the caller reads.
      interceptRoute({
        match: matches(ROOM_MEMBERS_ROUTE),
        fulfill: (request) => {
          // `filterType=2` asks for the shares made through a link, which a
          // demo room has none of; the caller reads an empty list as "none yet".
          const isLinks = /[?&]filterType=2(&|$)/.test(request.url ?? "");
          const items = isLinks ? [] : buildDemoMembers(config);

          return { total: items.length, response: items };
        },
      }),
      // No links yet, which is also what a space looks like the moment it is
      // created — the tour talks about sharing one rather than showing one.
      interceptRoute({
        match: matches(ROOM_LINKS_ROUTE),
        fulfill: () => ({ response: [] }),
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
      // What is inside a stand-in space. Unlike the list, there is no real
      // answer to build this one on: the server has never heard of the room
      // being asked about, so the whole envelope is the demo's — which is why
      // it is fulfilled rather than transformed.
      interceptRoute({
        match: matches(DEMO_FOLDER_ROUTE),
        fulfill: (request) => {
          const id = idFromRoute(DEMO_FOLDER_ROUTE, request.url);
          const room = this.rooms.find((item) => item.id === id);

          if (!room || !this.sectionRoot) return { response: null };

          return {
            response: buildDemoSpaceContents(room, this.sectionRoot, config),
          };
        },
      }),
    ];
  };

  deactivate = () => {
    this.teardown.forEach((remove) => remove());
    this.teardown = [];
    this.sectionRoot = null;
    this.rooms = [];

    runInAction(() => {
      this.config = null;
    });
  };
}

export const tourDemo = new TourDemo();
