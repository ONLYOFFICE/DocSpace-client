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

const targets = (flags: TourStepFlags) =>
  getTourSteps(t, undefined, flags).map((step) => step.target);

const titles = (flags: TourStepFlags) =>
  getTourSteps(t, undefined, flags).map((step) => step.title);

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
  isTableView: true,
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

describe("getTourSteps — guest", () => {
  it("builds a tour instead of an empty step list", () => {
    // The bug this guards: every guest step was gated behind a personal-space
    // id the guest never has, so the tour opened with nothing to show and
    // closed itself immediately.
    expect(getTourSteps(t, undefined, guestFlags).length).toBeGreaterThan(0);
  });

  it("anchors the section step on the sidebar's guest item id", () => {
    expect(targets(guestFlags)).toContain('[data-item-id="files"]');
  });

  it("keeps the quick-access steps a guest actually has", () => {
    const guestTargets = targets(guestFlags);

    expect(guestTargets).toContain('[data-item-id="10"]');
    expect(guestTargets).toContain('[data-item-id="11"]');
  });

  it("describes the section as shared files, not a personal space", () => {
    const guestTitles = titles(guestFlags);

    expect(guestTitles).toContain("Common:Files");
    // The owner wording promises files "you own" and a Trash to restore from.
    expect(guestTitles).not.toContain("FilesTour:TourTrashTitle");
  });

  it("offers nothing that creates or deletes", () => {
    const guestTargets = targets(guestFlags);

    expect(guestTargets).not.toContain('[data-testid="quick-actions"]');
    expect(guestTargets).not.toContain('[data-testid="quick-ai-chat"]');
    // Trash is hidden from guests by the sidebar itself.
    expect(guestTargets.some((target) => target === '[data-item-id="13"]')).toBe(
      false,
    );
  });

  it("still covers the tools a guest can use on someone else's files", () => {
    const guestTargets = targets(guestFlags);

    expect(guestTargets).toContain("#filter_search-input");
    expect(guestTargets).toContain("#info-panel-toggle--open");
    expect(guestTargets).toContain("#sort-by-button");
  });
});

describe("getTourSteps — owner", () => {
  it("keeps the create and Trash steps the guest tour drops", () => {
    const ownerTargets = targets(ownerFlags);

    expect(ownerTargets).toContain('[data-testid="quick-actions"]');
    expect(ownerTargets).toContain('[data-item-id="13"]');
    expect(ownerTargets).toContain('[data-item-id="5"]');
  });

  it("drops the whole sidebar block when the section item is missing", () => {
    // Nothing to anchor on: no section item means no quick-access steps.
    const noSidebar = targets({ ...ownerFlags, sectionId: null });

    expect(noSidebar).not.toContain('[data-item-id="10"]');
    expect(noSidebar).not.toContain('[data-item-id="5"]');
  });
});
