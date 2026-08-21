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

import type {
  Page,
  PageAssertionsToHaveScreenshotOptions,
} from "@playwright/test";
import { expect } from "@playwright/test";

const LIST_ALIGNMENT_TIMEOUT = 5000;

type TListViolation = {
  check: string;
  values: Record<string, number>;
};

/**
 * Looks for the two ways a table page renders sideways-shifted.
 *
 * `rowVsHeader`: rows and the column header are grids sharing one column
 * template, so their content boxes must start at the same x - that is what
 * puts every cell under its own column title. The header is the reference,
 * not the table container: the header is deliberately pulled out of the
 * container by a negative inline margin (so its background bleeds to the
 * section edge) and pays it back with an equal padding.
 *
 * `sectionInset`: the whole section can lose the inline inset that separates
 * it from the article - `.section-body` carries it as a margin - and then the
 * tiles, the toolbar, the header and the rows all slide over the gap
 * together, which keeps them consistent with each other and invisible to the
 * check above. The article is the only reference left, so measure the gap
 * against it.
 *
 * Runs inside the page, so it must stay free of outer-scope references.
 */
const readListGeometry = (): TListViolation[] => {
  const row = document.querySelector(".table-list-item");
  // Reach the header through the row's own container: a page can hold more
  // than one table, and comparing across two of them measures nothing.
  const header = row
    ?.closest("#table-container")
    ?.querySelector(".table-container_header");

  if (!row || !header) return [];

  const rowStyle = window.getComputedStyle(row);
  const headerStyle = window.getComputedStyle(header);
  const isRtl = rowStyle.direction === "rtl";

  const rowBox = row.getBoundingClientRect();
  const headerBox = header.getBoundingClientRect();

  const rowStart = isRtl
    ? rowBox.right - parseFloat(rowStyle.paddingRight)
    : rowBox.left + parseFloat(rowStyle.paddingLeft);
  const headerStart = isRtl
    ? headerBox.right - parseFloat(headerStyle.paddingRight)
    : headerBox.left + parseFloat(headerStyle.paddingLeft);

  const violations: TListViolation[] = [];

  // The shift is a whole bleed width (20px desktop, 16px mobile), so a few
  // pixels of rounding are noise.
  if (Math.abs(rowStart - headerStart) > 4) {
    violations.push({
      check: "rowVsHeader",
      values: { rowStart, headerStart, offset: rowStart - headerStart },
    });
  }

  const article = document.getElementById("article-container");

  if (article) {
    const articleBox = article.getBoundingClientRect();
    const inset = isRtl
      ? articleBox.left - headerStart
      : headerStart - articleBox.right;

    // Healthy is the section padding: 20px on desktop, 16px on mobile. A lost
    // inset reads as ~0, and a collapsed article leaves a wide gap, so only
    // the small end needs a bound.
    if (inset < 8) {
      violations.push({
        check: "sectionInset",
        values: { headerStart, articleEnd: articleBox.right, inset },
      });
    }
  }

  return violations;
};

/**
 * Fails the screenshot instead of recording a broken layout as the baseline.
 *
 * Roughly a third of the runs render a table page shifted sideways, and
 * `--update-snapshots` happily writes that frame out as the expectation -
 * which is how a batch of context-menu and room-grouping baselines ended up
 * shifted. Pages without a table report no geometry and pass straight
 * through.
 */
const expectAlignedList = async (page: Page) => {
  await expect
    .poll(async () => page.evaluate(readListGeometry), {
      timeout: LIST_ALIGNMENT_TIMEOUT,
      message:
        "The page never settled into an aligned layout, so it would have been captured with the list shifted sideways",
    })
    .toEqual([]);
};

export const expectScreenshot = async (
  page: Page,
  name: string | string[],
  options?: PageAssertionsToHaveScreenshotOptions,
) => {
  // Add delay to ensure fonts are fully rendered on slower machines
  await page.waitForTimeout(500);
  await expectAlignedList(page);
  await expect(page).toHaveScreenshot(name, options);
};
