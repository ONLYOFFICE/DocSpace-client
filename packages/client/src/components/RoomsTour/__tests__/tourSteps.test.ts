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

import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import {
  NAVIGATION_TARGET_TIMEOUT,
  STEP_TARGET_TIMEOUT,
} from "SRC_DIR/components/Tour/stepBuilders";

import {
  getTourSteps,
  FIRST_ITEM_SELECTOR,
  type TourStepFlags,
} from "../tourSteps";

/** Echo the key back, so a step can be identified by the key it rendered. */
const t = ((key: string) => key) as unknown as TFunction;

const steps = (flags: TourStepFlags) => getTourSteps(t, undefined, flags);

const titles = (flags: TourStepFlags) => steps(flags).map((step) => step.title);

const EMPTY_SCREEN_TARGET = '[data-testid="empty-view-body"] > *:first-child';
const EMPTY_SCREEN = '[data-testid="empty-view"]';

const hooks = () => ({ reveal: vi.fn(), restore: vi.fn() });

/**
 * The two hook sets the host really passes. Both matter to how a step behaves
 * on the way back out of the closing step, so the tests below use these rather
 * than a bare pair of spies.
 */
const panelHooks = () => ({
  ...hooks(),
  awaitBefore: FIRST_ITEM_SELECTOR,
  navigates: true,
});

const listHooks = () => ({ ...hooks(), navigates: true });

/** A room admin on a Rooms section that already has rooms of its own. */
const adminFlags: TourStepFlags = {
  isDesktop: true,
  canCreate: true,
  canUseTemplates: true,
  showFilter: true,
  hasItems: true,
  roomsId: "2002",
  infoPanelHooks: panelHooks(),
  isDemo: false,
  demoHooks: listHooks(),
};

/** The same admin on a portal whose Rooms list is stood in for. */
const demoFlags: TourStepFlags = { ...adminFlags, isDemo: true };

/** Somebody who was invited into rooms that are not theirs. */
const memberFlags: TourStepFlags = {
  ...adminFlags,
  canCreate: false,
  canUseTemplates: false,
};

/**
 * The same person on a portal with no rooms at all, whose list is stood in for.
 * The empty screen offers them nothing — creating a room is not theirs to do —
 * so the closing step has somewhere else to point.
 */
const memberDemoFlags: TourStepFlags = { ...memberFlags, isDemo: true };

describe("getTourSteps — room admin", () => {
  it("walks the types, templates, AI chat, groups, members and the sidebar", () => {
    expect(titles(adminFlags)).toEqual([
      "RoomsTour:RoomsTypesTitle",
      "RoomsTour:RoomsTemplatesTitle",
      "FilesTour:TourAiAssistantTitle",
      "RoomsTour:RoomsGroupsTitle",
      "RoomsTour:RoomsMembersTitle",
      "RoomsTour:RoomsPlacesTitle",
    ]);
  });

  it("closes a stood-in run on the real create button", () => {
    document.body.innerHTML = `
      <div data-testid="empty-view-body"><button>create</button></div>
    `;
    const createButton = document.querySelector(EMPTY_SCREEN_TARGET);

    const closing = steps(demoFlags).at(-1)!;

    expect(closing.title).toBe("RoomsTour:RoomsCreateFirstTitle");
    expect((closing.target as () => Element | null)()).toBe(createButton);

    // A section that kept its own list ends on the sidebar step instead.
    expect(steps(adminFlags).at(-1)?.title).toBe("RoomsTour:RoomsPlacesTitle");

    document.body.innerHTML = "";
  });
});

describe("getTourSteps — member", () => {
  it("offers nothing that creates a room", () => {
    const memberTitles = titles(memberFlags);

    expect(memberTitles).not.toContain("RoomsTour:RoomsTypesTitle");
    expect(memberTitles).not.toContain("RoomsTour:RoomsTemplatesTitle");
  });

  it("still covers what to do with the rooms they were invited into", () => {
    expect(titles(memberFlags)).toEqual([
      "FilesTour:TourAiAssistantTitle",
      "RoomsTour:RoomsGroupsTitle",
      "RoomsTour:RoomsMembersTitle",
      "RoomsTour:RoomsPlacesTitle",
    ]);
  });

  it("closes a stood-in run on the empty list itself", () => {
    // Their section was stood in for too — otherwise their tour is the sidebar
    // step and nothing else — so it still has to be handed back in the open.
    // What they are left looking at is a bare empty screen, so that is what the
    // step names rather than a button they do not have.
    document.body.innerHTML = `<div data-testid="empty-view"></div>`;
    const emptyScreen = document.querySelector(EMPTY_SCREEN);

    const closing = steps(memberDemoFlags).at(-1)!;

    expect(closing.title).toBe("RoomsTour:RoomsEmptyTitle");
    expect(closing.content).toBe("RoomsTour:RoomsEmpty");
    expect((closing.target as () => Element | null)()).toBe(emptyScreen);
    // Still the step that drops the stand-in, so the section is the user's own
    // by the time the tour is over.
    expect(closing.before).toBeTypeOf("function");

    document.body.innerHTML = "";
  });

  it("never sends them at the create button", () => {
    expect(titles(memberDemoFlags)).not.toContain(
      "RoomsTour:RoomsCreateFirstTitle",
    );
  });
});

describe("getTourSteps — walking back out of the closing step", () => {
  // The bug: the closing step drops the stand-in rooms to show the real empty
  // screen, and every step before it is anchored on the section that dismantles
  // — the banner's tiles, the groups row, a room row, the panel opened on it.
  // react-joyride answers a step whose target has gone by moving one further in
  // the direction of travel, so a single Back skipped a step, and from there the
  // index walked off the start of the list and closed the tour outright.
  it("puts the stand-in rooms back, for both audiences", () => {
    for (const flags of [demoFlags, memberDemoFlags]) {
      const hooksForRun = listHooks();
      const closing = steps({ ...flags, demoHooks: hooksForRun }).at(-1)!;

      closing.after?.({} as never);

      expect(hooksForRun.restore).toHaveBeenCalledTimes(1);
    }
  });

  it("waits out a round trip for the list either way", async () => {
    // Both directions swap the list through a re-fetch, so neither the empty
    // screen nor the stand-in rooms coming back fit the ordinary budget: the
    // wait has to outlast the request, or the step is laid out against a target
    // that has not arrived and the tooltip is pinned to the corner.
    const closing = steps(demoFlags).at(-1)!;

    vi.useFakeTimers();

    try {
      let settled = false;
      const pending = closing.before?.({} as never).then(() => {
        settled = true;
      });

      await vi.advanceTimersByTimeAsync(STEP_TARGET_TIMEOUT + 1);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(NAVIGATION_TARGET_TIMEOUT);
      await pending;

      expect(settled).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("holds the members step until its room row is back", async () => {
    // Walking back from the closing step means the stand-in list is in flight,
    // and the members step opens the panel on the first room by reading it out
    // of the file list. Firing the reveal before the row lands reads an empty
    // list and leaves the step with no panel to point at.
    const hooksForRun = panelHooks();
    const members = steps({ ...demoFlags, infoPanelHooks: hooksForRun })[4];

    // The panel this step points at is only ever put up by its own reveal, so
    // the row arriving is the only thing that can move it along.
    hooksForRun.reveal.mockImplementation(() => {
      document.body.innerHTML += `<div class="info-panel"></div>`;
    });

    const startedAt = Date.now();
    const pending = members.before?.({} as never);

    // A macrotask is enough for the observer to have fired had the row been
    // there; the reveal is still waiting because it is not.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(hooksForRun.reveal).not.toHaveBeenCalled();

    document.body.innerHTML = `<div data-testid="table-row-0"></div>`;
    await pending;

    expect(hooksForRun.reveal).toHaveBeenCalledTimes(1);
    // Because the row landed, not because the wait ran out — otherwise this
    // test would pass just as well with no `awaitBefore` at all.
    expect(Date.now() - startedAt).toBeLessThan(NAVIGATION_TARGET_TIMEOUT);

    document.body.innerHTML = "";
  });
});

describe("getTourSteps — what the page allows", () => {
  it("drops the filter-bar steps on an empty page", () => {
    // No filter bar and no banner: nothing to create with, no groups row.
    expect(
      titles({ ...adminFlags, showFilter: false, hasItems: false }),
    ).toEqual(["RoomsTour:RoomsPlacesTitle"]);
  });

  it("drops the members step when there is no room to open it on", () => {
    expect(titles({ ...adminFlags, hasItems: false })).not.toContain(
      "RoomsTour:RoomsMembersTitle",
    );
  });

  it("drops the sidebar step on a narrow screen", () => {
    // Tablet collapses the sidebar to icons, flattening the sub-items away.
    expect(titles({ ...adminFlags, isDesktop: false })).not.toContain(
      "RoomsTour:RoomsPlacesTitle",
    );
  });

  it("opens the info panel itself rather than pointing at the button that would", () => {
    const members = steps(adminFlags)[4];

    // The panel is only up while the step runs, so the start-of-run DOM check
    // has to look at the row instead — a rooms list with no row in it has
    // nothing for this step to describe.
    expect(members.data).toEqual({
      revealsTarget: true,
      presence:
        '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]',
    });
    expect(members.before).toBeTypeOf("function");
  });
});
