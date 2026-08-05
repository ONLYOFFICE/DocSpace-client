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

import { describe, it, expect } from "vitest";
import type { TFunction } from "i18next";

import { getTourSteps, type TourStepFlags } from "../tourSteps";

/** Echo the key back, so a step can be identified by the key it rendered. */
const t = ((key: string) => key) as unknown as TFunction;

const steps = (flags: TourStepFlags) => getTourSteps(t, undefined, flags);

const targets = (flags: TourStepFlags) =>
  steps(flags).map((step) => step.target);

const titles = (flags: TourStepFlags) => steps(flags).map((step) => step.title);

const SEARCH_TARGET = "#filter_search-input .search-input-block";

const SHARE_ICON_TARGET =
  '[data-testid^="table-row-"] .badge.copy-link, ' +
  '[data-testid^="files_row_"] .badge.copy-link, ' +
  '[data-testid^="tile_"] .badge.copy-link';

/**
 * A guest on the Files section: no personal space and no Trash, so the sidebar
 * keys the section item by the literal "files" and points it at Shared with
 * me. Recent and Favorites are theirs as usual.
 */
const guestFlags: TourStepFlags = {
  audience: "guest",
  isDesktop: true,
  canCreate: false,
  showFilter: true,
  hasItems: true,
  sectionId: "files",
  sharedId: "10",
  recentId: "11",
  favoritesId: "12",
  trashId: null,
};

const ownerFlags: TourStepFlags = {
  ...guestFlags,
  audience: "admin",
  canCreate: true,
  sectionId: "5",
  trashId: "13",
};

describe("getTourSteps — owner", () => {
  it("walks create, AI chat, upload, search, sharing and the sidebar", () => {
    expect(targets(ownerFlags)).toEqual([
      '[data-testid="quick-actions"]',
      '[data-testid="quick-ai-chat"]',
      ".p-contextmenu",
      SEARCH_TARGET,
      SHARE_ICON_TARGET,
      '[data-item-id="10"]',
    ]);
  });

  it("spotlights the four format tiles, not the whole banner", () => {
    // The AI chat tile shares the banner and has its own step, so the create
    // step's spotlight has to stop at the fourth tile.
    const [create] = steps(ownerFlags);

    expect(create.spotlightTarget).toBeTypeOf("function");
  });

  it("lights up the New button together with the menu it opens", () => {
    const upload = steps(ownerFlags).find(
      (step) => step.target === ".p-contextmenu",
    );

    expect(upload?.spotlightTarget).toBeTypeOf("function");
  });

  it("can show the sharing step on a row that hides it until hover", () => {
    // The share button is `display: none` outside `:hover` in the table view, so
    // the step has to reveal it — the plain visibility check dropped it every
    // time and the step was never shown.
    const share = steps(ownerFlags).find(
      (step) => step.target === SHARE_ICON_TARGET,
    );

    expect(share?.data).toEqual({
      revealsTarget: true,
      presence: SHARE_ICON_TARGET,
    });
  });

  it("keeps the upload step even though its menu is closed", () => {
    // The step is what opens the menu, so `isStepTargetPresent` has to be told
    // to leave it alone — without the flag the start-of-run filter drops it.
    const upload = steps(ownerFlags).find(
      (step) => step.target === ".p-contextmenu",
    );

    expect(upload?.data).toEqual({ revealsTarget: true });
  });

  it("names every sidebar shortcut it points at, in one paragraph", () => {
    const places = steps(ownerFlags).at(-1);

    expect(places?.title).toBe("FilesTour:TourPlacesTitle");
    // Shared with me, Recent, Favorites and Trash — one sentence each, run
    // together rather than broken into bullets.
    expect(places?.content).toBe(
      "FilesTour:TourPlacesShared FilesTour:TourPlacesRecent " +
        "FilesTour:TourPlacesFavorites FilesTour:TourPlacesTrash",
    );
    // The spotlight covers the sub-list the anchor item belongs to.
    expect(places?.spotlightTarget).toBeTypeOf("function");
  });

  it("drops the Trash point when there is no Trash item", () => {
    const withTrash = steps(ownerFlags).at(-1);
    const withoutTrash = steps({ ...ownerFlags, trashId: null }).at(-1);

    expect(withTrash?.content).toContain("FilesTour:TourPlacesTrash");
    expect(withoutTrash?.content).not.toContain("FilesTour:TourPlacesTrash");
  });
});

describe("getTourSteps — guest", () => {
  it("builds a tour instead of an empty step list", () => {
    // The bug this guards: every guest step was gated behind a personal-space
    // id the guest never has, so the tour opened with nothing to show and
    // closed itself immediately.
    expect(steps(guestFlags).length).toBeGreaterThan(0);
  });

  it("offers nothing that creates", () => {
    const guestTargets = targets(guestFlags);

    expect(guestTargets).not.toContain('[data-testid="quick-actions"]');
    expect(guestTargets).not.toContain('[data-testid="quick-ai-chat"]');
    expect(guestTargets).not.toContain(".p-contextmenu");
  });

  it("still covers the tools a guest can use on someone else's files", () => {
    const guestTargets = targets(guestFlags);

    expect(guestTargets).toContain(SEARCH_TARGET);
    expect(guestTargets).toContain(SHARE_ICON_TARGET);
    // Their sidebar shortcuts, anchored on Shared with me.
    expect(guestTargets).toContain('[data-item-id="10"]');
  });

  it("keeps Trash out of the sidebar step", () => {
    const places = steps(guestFlags).at(-1);

    expect(titles(guestFlags)).toContain("FilesTour:TourPlacesTitle");
    expect(places?.content).not.toContain("FilesTour:TourPlacesTrash");
  });
});

describe("getTourSteps — what the page allows", () => {
  it("drops everything in the filter bar on an empty page", () => {
    // No filter bar and no banner: no search, no create tiles, no New button.
    const emptyPage = targets({
      ...ownerFlags,
      showFilter: false,
      hasItems: false,
    });

    expect(emptyPage).toEqual(['[data-item-id="10"]']);
  });

  it("drops the sharing step when the folder has no items", () => {
    expect(targets({ ...ownerFlags, hasItems: false })).not.toContain(
      SHARE_ICON_TARGET,
    );
  });

  it("drops the sidebar and the New menu on a narrow screen", () => {
    // Tablet collapses the sidebar to icons (sub-items are flattened away) and
    // the filter bar renders no New button.
    const tablet = targets({ ...ownerFlags, isDesktop: false });

    expect(tablet).not.toContain('[data-item-id="10"]');
    expect(tablet).not.toContain(".p-contextmenu");
  });

  it("drops the whole sidebar block when the section item is missing", () => {
    // Nothing to anchor on: no section item means no sub-item step.
    expect(targets({ ...ownerFlags, sectionId: null })).not.toContain(
      '[data-item-id="10"]',
    );
  });
});
