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

import type { Page } from "@playwright/test";
import {
  settingsHandler,
  TypeSettings,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// Bug 85087. While its scrollbar is shown, the ui-kit Scrollbar pulls the
// scroller under it 1px further than the scrollbar is wide whenever the zoom
// level (devicePixelRatio) is not 1, so the content got 1px wider exactly when
// it overflowed. A block whose height depends on that pixel (a module card's
// "Enabled" badge wrapping or not) then flipped the page between scrolling and
// not scrolling on every frame. packages/client/src/pages/Dashboard/
// Dashboard.module.scss caps the content at the width it has without a
// scrollbar; these tests pin that.

// packages/client/src/pages/Dashboard/index.tsx
const INNER = '[class*="dashboardInner"]';
const SCROLLER = '[class*="dashboardScrollbar"] [data-testid="scroller"]';
const APPS = '[data-tour-id="dashboard-apps"]';

// The tablet width from the report, above the 600px mobile breakpoint.
const WIDTH = 645;
// Tall enough for the whole one-column dashboard to fit without scrolling.
const TALL = 6000;

// The 1px over-compensation only happens at a zoom level other than 1.
test.use({ deviceScaleFactor: 2 });

type TLayoutState = { overflowY: string; width: number };

const readState = (page: Page) =>
  page.evaluate(
    ([inner, scroller]): TLayoutState => ({
      overflowY: getComputedStyle(document.querySelector(scroller)!).overflowY,
      width: document.querySelector(inner)!.getBoundingClientRect().width,
    }),
    [INNER, SCROLLER],
  );

// One state per animation frame - the custom scrollbar re-measures every frame,
// so a loop shows up as alternating samples.
const sampleFrames = (page: Page, frames: number) =>
  page.evaluate(
    ([inner, scroller, count]) =>
      new Promise<string[]>((resolve) => {
        const samples: string[] = [];
        const tick = () => {
          const s = document.querySelector(scroller as string)!;
          const w = document
            .querySelector(inner as string)!
            .getBoundingClientRect().width;
          samples.push(`${getComputedStyle(s).overflowY}|${w}`);
          if (samples.length < (count as number)) requestAnimationFrame(tick);
          else resolve(samples);
        };
        requestAnimationFrame(tick);
      }),
    [INNER, SCROLLER, frames] as const,
  );

test.describe("Dashboard content under its scrollbar (bug 85087)", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfByTypeHandler(TEST_PORT, "admin"),
    );
  });

  test("the content is as wide while scrolling as without a scrollbar", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize({ width: WIDTH, height: 472 });
    await page.goto(`${baseUrl}/dashboard`);
    await expect(page.locator(APPS)).toBeVisible();

    await expect
      .poll(async () => (await readState(page)).overflowY)
      .toBe("scroll");
    const scrolling = await readState(page);

    await page.setViewportSize({ width: WIDTH, height: TALL });
    await expect
      .poll(async () => (await readState(page)).overflowY)
      .toBe("hidden");
    const notScrolling = await readState(page);

    // Sub-pixel rounding is not the defect (the content measures 567.95px
    // without a scrollbar, the cap resolves to 568px); the extra whole pixel
    // the scroller adds is.
    expect(scrolling.width).toBeCloseTo(notScrolling.width, 0);
  });

  test("a block that reacts to that pixel does not make the page flicker", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize({ width: WIDTH, height: TALL });
    await page.goto(`${baseUrl}/dashboard`);
    await expect(page.locator(APPS)).toBeVisible();
    await expect
      .poll(async () => (await readState(page)).overflowY)
      .toBe("hidden");

    // Stand-in for the wrapping badge, independent of fonts: 40px tall at the
    // width the content has without a scrollbar, gone once the content is even
    // half a pixel wider - the pixel the scroller used to add.
    const contentWidth = await page.locator(INNER).evaluate((el) => {
      const cs = getComputedStyle(el);
      return (
        el.getBoundingClientRect().width -
        parseFloat(cs.paddingInlineStart) -
        parseFloat(cs.paddingInlineEnd)
      );
    });
    await page.addStyleTag({
      content: `
        ${APPS}::after { content: ""; display: block; height: 40px; }
        @container dashboard-content (min-width: ${contentWidth + 0.5}px) {
          ${APPS}::after { height: 0; }
        }
      `,
    });

    await expect
      .poll(() =>
        page
          .locator(APPS)
          .evaluate((el) => getComputedStyle(el, "::after").height),
      )
      .toBe("40px");

    // A scroller 20px shorter than the content: the content fits only if the
    // stand-in collapses, which it would do only on the extra pixel. Neither
    // the scroller's scrollHeight nor the scroll body's height can be used:
    // with nothing to scroll both stretch to the scroller's own height.
    const { contentHeight, clientHeight } = await page.evaluate(
      ([inner, scroller]) => {
        const s = document.querySelector(scroller)!;
        const body = s.querySelector('[data-testid="scroll-body"]')!;
        return {
          contentHeight:
            document.querySelector(inner)!.getBoundingClientRect().bottom -
            s.getBoundingClientRect().top +
            parseFloat(getComputedStyle(body).paddingBlockEnd),
          clientHeight: s.clientHeight,
        };
      },
      [INNER, SCROLLER],
    );
    const chrome = TALL - clientHeight;
    await page.setViewportSize({
      width: WIDTH,
      height: Math.round(chrome + contentHeight - 20),
    });

    await expect
      .poll(async () => (await readState(page)).overflowY)
      .toBe("scroll");

    // One state for a whole second: the page keeps scrolling, the content
    // keeps its width.
    const samples = await sampleFrames(page, 60);
    expect(new Set(samples).size).toBe(1);
    expect(samples[0]).toMatch(/^scroll\|/);
  });
});
