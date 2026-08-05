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

import { describe, it, expect, afterEach } from "vitest";
import type { Step } from "react-joyride";

import {
  isStepTargetPresent,
  navItemStep,
  elementStep,
  fileItemStep,
} from "../stepBuilders";

const LOG_LABEL = "test tour";

afterEach(() => {
  document.body.innerHTML = "";
});

const mount = (html: string) => {
  document.body.innerHTML = html;
};

describe("isStepTargetPresent", () => {
  it("accepts a selector target that is on the page", () => {
    mount('<div id="filter-button"></div>');

    const step = elementStep(
      "#filter-button",
      "title",
      "body",
      undefined,
      LOG_LABEL,
    );

    expect(isStepTargetPresent(step)).toBe(true);
  });

  it("rejects a selector target that is not rendered", () => {
    // The case that used to hang the tour on a spinner: an empty section
    // renders no filter bar, so the step has nothing to point at.
    const step = elementStep(
      "#filter-button",
      "title",
      "body",
      undefined,
      LOG_LABEL,
    );

    expect(isStepTargetPresent(step)).toBe(false);
  });

  it("rejects a target hidden by an ancestor", () => {
    mount(
      '<div style="display: none"><div data-item-id="42"></div></div>',
    );

    const step = navItemStep(
      '[data-item-id="42"]',
      "title",
      "body",
      undefined,
      LOG_LABEL,
    );

    expect(isStepTargetPresent(step)).toBe(false);
  });

  it("rejects a detached element", () => {
    const detached = document.createElement("div");

    expect(isStepTargetPresent({ target: detached } as Step)).toBe(false);
  });

  it("resolves function targets, and survives one that throws", () => {
    mount('<div data-testid="files_row_0"><span>name</span></div>');
    // jsdom reports every rect as 0x0, which `fileItemStep` reads as the
    // `display: contents` table row and answers by falling back to the widest
    // cell. Give the cell a width so the fallback has something to pick.
    const cell = document.querySelector("span") as HTMLElement;
    cell.getBoundingClientRect = () => ({ width: 240 }) as DOMRect;

    const rowStep = fileItemStep(
      '[data-testid="files_row_0"]',
      "title",
      "body",
      undefined,
      LOG_LABEL,
    );

    expect(isStepTargetPresent(rowStep)).toBe(true);

    const throwing = {
      target: () => {
        throw new Error("boom");
      },
    } as unknown as Step;

    expect(isStepTargetPresent(throwing)).toBe(false);
  });

  it("rejects a first-row step when the list is empty", () => {
    // Empty folder: the list wrapper exists, the row does not.
    mount('<div class="files-list"></div>');

    const rowStep = fileItemStep(
      '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]',
      "title",
      "body",
      undefined,
      LOG_LABEL,
    );

    expect(isStepTargetPresent(rowStep)).toBe(false);
  });

  it("keeps the steps that resolve when filtering a mixed list", () => {
    mount(
      '<div data-item-id="my-docs"></div><div id="filter_search-input"></div>',
    );

    const steps = [
      navItemStep('[data-item-id="my-docs"]', "t", "b", undefined, LOG_LABEL),
      elementStep("#filter_search-input", "t", "b", undefined, LOG_LABEL),
      // Neither of these is on the page — an empty list and a hidden Trash.
      fileItemStep('[data-testid="tile_0"]', "t", "b", undefined, LOG_LABEL),
      navItemStep('[data-item-id="trash"]', "t", "b", undefined, LOG_LABEL),
    ];

    expect(steps.filter(isStepTargetPresent)).toHaveLength(2);
  });
});
