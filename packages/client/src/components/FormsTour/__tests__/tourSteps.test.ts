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

import { bullets } from "SRC_DIR/components/Tour/__tests__/bullets";

import { getTourSteps, type TourStepFlags } from "../tourSteps";

/** Echo the key back, so a step can be identified by the key it rendered. */
const t = ((key: string) => key) as unknown as TFunction;

const steps = (flags: TourStepFlags) => getTourSteps(t, undefined, flags);

const titles = (flags: TourStepFlags) => steps(flags).map((step) => step.title);

const EMPTY_SCREEN_TARGET = '[data-testid="empty-view-body"] > *:first-child';
const EMPTY_SCREEN = '[data-testid="empty-view"]';

const hooks = () => ({ reveal: vi.fn(), restore: vi.fn() });

/** A room admin on a Forms section that already has spaces of its own. */
const adminFlags: TourStepFlags = {
  isDesktop: true,
  canCreate: true,
  canUseTemplates: true,
  showFilter: true,
  hasItems: true,
  hasForms: true,
  isDemo: true,
  isStandIn: false,
  spaceHooks: hooks(),
  demoHooks: hooks(),
  leaveSpace: vi.fn(),
};

/** The same admin on a portal whose Forms list is stood in for as well. */
const demoFlags: TourStepFlags = { ...adminFlags, isStandIn: true };

/** Someone who was let into a space to fill the form in. */
const fillerFlags: TourStepFlags = {
  ...adminFlags,
  canCreate: false,
  canUseTemplates: false,
};

/**
 * The same person on a portal with no spaces at all, whose list is stood in
 * for. The empty screen offers them nothing — creating a space is not theirs to
 * do — so the closing step has somewhere else to point.
 */
const fillerDemoFlags: TourStepFlags = { ...fillerFlags, isStandIn: true };

describe("getTourSteps — room admin", () => {
  it("walks the section, then the inside of a space, then the sidebar", () => {
    expect(titles(adminFlags)).toEqual([
      "FormsTour:FormsSpaceTitle",
      "FormsTour:FormsTemplatesTitle",
      "FormsTour:FormsItemTitle",
      "FormsTour:FormsOpenSpaceTitle",
      "FormsTour:FormsBlankTitle",
      "FormsTour:FormsInProgressTitle",
      "FormsTour:FormsCompleteTitle",
      "FormsTour:FormsPlacesTitle",
    ]);
  });

  it("stays inside the ten-step budget on the longest run there is", () => {
    expect(steps(demoFlags).length).toBeLessThanOrEqual(10);
  });

  it("names every sidebar shortcut it points at, one bullet each", () => {
    const places = steps(adminFlags).at(-1);

    expect(bullets(places)).toEqual([
      "FormsTour:FormsPlacesRecent",
      "FormsTour:FormsPlacesTemplates",
      "FormsTour:FormsPlacesTrash",
    ]);
    // The spotlight covers the sub-list the anchor item belongs to.
    expect(places?.spotlightTarget).toBeTypeOf("function");
  });
});

describe("getTourSteps — filler", () => {
  it("offers nothing that creates a space", () => {
    const fillerTitles = titles(fillerFlags);

    expect(fillerTitles).not.toContain("FormsTour:FormsSpaceTitle");
    expect(fillerTitles).not.toContain("FormsTour:FormsTemplatesTitle");
  });

  it("still covers what a filler does with the spaces they were added to", () => {
    const fillerTitles = titles(fillerFlags);

    expect(fillerTitles).toContain("FormsTour:FormsItemTitle");
    expect(fillerTitles).toContain("FormsTour:FormsPlacesTitle");
  });

  it("keeps Templates out of the sidebar step", () => {
    // The sidebar itself only renders the Templates item for admins, so
    // naming it here would point at something that is not on screen.
    const places = steps(fillerFlags).at(-1);

    expect(places?.content).not.toContain("FormsTour:FormsPlacesTemplates");
  });
});

describe("getTourSteps — inside a space", () => {
  it("walks the blank form and the two folders an answer travels between", () => {
    expect(titles(demoFlags)).toEqual([
      "FormsTour:FormsSpaceTitle",
      "FormsTour:FormsTemplatesTitle",
      "FormsTour:FormsItemTitle",
      "FormsTour:FormsOpenSpaceTitle",
      "FormsTour:FormsBlankTitle",
      "FormsTour:FormsInProgressTitle",
      "FormsTour:FormsCompleteTitle",
      "FormsTour:FormsPlacesTitle",
      "FormsTour:FormsCreateFirstTitle",
    ]);
  });

  it("names the door before walking through it", () => {
    // Without this step the tour teleports: the user is told a row is a whole
    // collection, and the next tooltip is already describing the contents of a
    // room they never opened.
    const titleList = titles(demoFlags);

    expect(titleList.indexOf("FormsTour:FormsOpenSpaceTitle")).toBe(
      titleList.indexOf("FormsTour:FormsBlankTitle") - 1,
    );
  });

  it("opens the space the step is pointing at, not whichever row sorts first", () => {
    const [openSpace] = steps(demoFlags).filter(
      (step) => step.title === "FormsTour:FormsOpenSpaceTitle",
    );

    // `fileItemStep` resolves its anchor through a function, so the selector it
    // was built from is what the assertion has to reach for.
    expect(openSpace.target).toBeTypeOf("function");
  });

  it("anchors on ids rather than on where a row happens to sort", () => {
    // The rows the steps point at, by the id every view puts on them. The
    // targets resolve through a function (a file-list row has no box of its
    // own), so the assertion is which element each one lands on.
    document.body.innerHTML = `
      <div id="file_-1102"></div>
      <div id="folder_-1100"></div>
      <div id="folder_-1101"></div>
    `;

    const resolved = steps(adminFlags)
      .slice(4, 7)
      .map((step) => (step.target as () => Element | null)());

    expect(resolved).toEqual([
      document.querySelector("#file_-1102"),
      document.querySelector("#folder_-1100"),
      document.querySelector("#folder_-1101"),
    ]);

    document.body.innerHTML = "";
  });

  it("lays out against a row's cells, not the boxless row wrappers", () => {
    // A file-list row is two `display: contents` wrappers deep — the id these
    // steps name it by sits on the outer one, ui-kit's table row on the inner —
    // so both report a 0×0 rect at (0,0). Handing either to react-joyride is
    // what parked the in-room tooltips in the corner of the screen with nothing
    // lit up, so the step has to come back with a cell that can be measured.
    document.body.innerHTML = `
      <div id="folder_-1100">
        <div data-testid="table-row-0"><span>In progress</span></div>
      </div>
    `;

    const row = document.querySelector<HTMLElement>("#folder_-1100")!;
    const inner = document.querySelector<HTMLElement>("[data-testid]")!;
    const cell = document.querySelector<HTMLElement>("span")!;

    // jsdom measures nothing, so the rects are stated outright.
    row.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
    inner.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
    cell.getBoundingClientRect = () => new DOMRect(0, 100, 400, 40);

    const inProgress = steps(adminFlags)[5];

    expect((inProgress.target as () => Element | null)()).toBe(cell);

    document.body.innerHTML = "";
  });

  it("keeps its steps through the start-of-run DOM check", () => {
    // The section is still at its root when the tour starts, so none of these
    // anchors exists yet. Without the flag every one of them would be dropped
    // before the tour had a chance to walk into the space.
    for (const step of steps(adminFlags).slice(4, 7)) {
      expect(step.data).toEqual({
        revealsTarget: true,
        presence: undefined,
      });
    }
  });

  it("runs whether or not the list itself was stood in for", () => {
    // A real space grows its In progress / Complete folders only once a form
    // has been started, so the tour always walks into a stand-in one — even on
    // a portal that keeps its own collections in the list.
    for (const flags of [adminFlags, demoFlags]) {
      expect(titles(flags)).toContain("FormsTour:FormsBlankTitle");
    }

    // Without a space to walk into there is nothing to show.
    expect(titles({ ...adminFlags, isDemo: false })).not.toContain(
      "FormsTour:FormsBlankTitle",
    );
  });

  it("gives every step outside the space a way back out of it", () => {
    // Walking backwards out of the in-room block has to land on a page that
    // has the anchor the step is about to point at.
    const outside = steps(demoFlags).filter(
      (step) => !String(step.target).startsWith("#"),
    );

    for (const step of outside) expect(step.before).toBeTypeOf("function");
  });
});

describe("getTourSteps — what the page allows", () => {
  it("drops the banner steps on an empty page", () => {
    // No filter bar and no banner: no space tile, no templates, no row.
    const emptyPage = titles({
      ...adminFlags,
      showFilter: false,
      hasItems: false,
    });

    expect(emptyPage).toEqual([
      "FormsTour:FormsOpenSpaceTitle",
      "FormsTour:FormsBlankTitle",
      "FormsTour:FormsInProgressTitle",
      "FormsTour:FormsCompleteTitle",
      "FormsTour:FormsPlacesTitle",
    ]);
  });

  it("drops the row step when the section has no spaces", () => {
    expect(titles({ ...adminFlags, hasItems: false })).not.toContain(
      "FormsTour:FormsItemTitle",
    );
  });

  it("drops the sidebar step on a narrow screen", () => {
    // Tablet collapses the sidebar to icons, flattening the sub-items away.
    expect(titles({ ...adminFlags, isDesktop: false })).not.toContain(
      "FormsTour:FormsPlacesTitle",
    );
  });

  it("closes on the real create button only when the list was stood in for", () => {
    document.body.innerHTML = `
      <div data-testid="empty-view-body"><button>create</button></div>
    `;
    const createButton = document.querySelector(EMPTY_SCREEN_TARGET);

    const closing = steps(demoFlags).at(-1)!;
    expect((closing.target as () => Element | null)()).toBe(createButton);

    // A section that kept its own list ends on the sidebar step instead, which
    // names its anchor with a plain selector.
    expect(steps(adminFlags).at(-1)?.title).toBe("FormsTour:FormsPlacesTitle");

    document.body.innerHTML = "";
  });

  it("closes a stood-in run on the empty list itself for a filler", () => {
    // Their section was stood in for too — otherwise their tour is the sidebar
    // step and nothing else — so it still has to be handed back in the open.
    // What they are left looking at is a bare empty screen, so that is what the
    // step names rather than a button they do not have.
    document.body.innerHTML = `<div data-testid="empty-view"></div>`;
    const emptyScreen = document.querySelector(EMPTY_SCREEN);

    const closing = steps(fillerDemoFlags).at(-1)!;

    expect(closing.title).toBe("FormsTour:FormsEmptyTitle");
    expect(closing.content).toBe("FormsTour:FormsEmpty");
    expect((closing.target as () => Element | null)()).toBe(emptyScreen);
    // Still the step that drops the stand-in, so the section is the user's own
    // by the time the tour is over.
    expect(closing.before).toBeTypeOf("function");

    document.body.innerHTML = "";
  });

  it("never sends a filler at the create button", () => {
    expect(titles(fillerDemoFlags)).not.toContain(
      "FormsTour:FormsCreateFirstTitle",
    );
  });
});
