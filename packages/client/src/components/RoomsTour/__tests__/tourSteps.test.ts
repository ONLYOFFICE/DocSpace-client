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

import { getTourSteps, type TourStepFlags } from "../tourSteps";

/** Echo the key back, so a step can be identified by the key it rendered. */
const t = ((key: string) => key) as unknown as TFunction;

const steps = (flags: TourStepFlags) => getTourSteps(t, undefined, flags);

const titles = (flags: TourStepFlags) => steps(flags).map((step) => step.title);

const EMPTY_SCREEN_TARGET = '[data-testid="empty-view-body"] > *:first-child';
const EMPTY_SCREEN = '[data-testid="empty-view"]';

const hooks = () => ({ reveal: vi.fn(), restore: vi.fn() });

/** A room admin on a Rooms section that already has rooms of its own. */
const adminFlags: TourStepFlags = {
  isDesktop: true,
  canCreate: true,
  canUseTemplates: true,
  showFilter: true,
  hasItems: true,
  roomsId: "2002",
  infoPanelHooks: hooks(),
  isDemo: false,
  demoHooks: hooks(),
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
