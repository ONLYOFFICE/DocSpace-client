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

import { describe, it, expect, afterEach, vi } from "vitest";
import type { Step } from "react-joyride";

import {
  isStepTargetPresent,
  navItemStep,
  elementStep,
  elementGroupStep,
  menuStep,
  hoverRevealStep,
  fileItemStep,
  revealStep,
  NAVIGATION_TARGET_TIMEOUT,
  STEP_TARGET_TIMEOUT,
} from "../stepBuilders";

const LOG_LABEL = "test tour";

afterEach(() => {
  document.body.innerHTML = "";
});

const mount = (html: string) => {
  document.body.innerHTML = html;
};

/**
 * jsdom reports every rect as 0x0, so a builder that measures its targets needs
 * them stubbed to have anything to work with.
 */
const withRect = (
  selector: string,
  box: { top: number; left: number; width: number; height: number },
) => {
  const element = document.querySelector<HTMLElement>(selector)!;

  element.getBoundingClientRect = () =>
    ({
      ...box,
      right: box.left + box.width,
      bottom: box.top + box.height,
      x: box.left,
      y: box.top,
    }) as DOMRect;
};

/** The payload joyride hands its hooks; none of the builders here read it. */
const HOOK_DATA = {} as Parameters<NonNullable<Step["before"]>>[0];

/** Resolves a step's spotlight target the way react-joyride does. */
const spotlight = (step: Step) =>
  (step.spotlightTarget as () => HTMLElement | null)();

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
    mount('<div style="display: none"><div data-item-id="42"></div></div>');

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

    expect(isStepTargetPresent({ target: detached, content: "body" })).toBe(
      false,
    );
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

describe("elementGroupStep", () => {
  const mountBanner = () => {
    mount(
      '<div data-testid="quick-actions">' +
        '<button data-testid="quick-docx"></button>' +
        '<button data-testid="quick-pdf"></button>' +
        '<button data-testid="quick-ai-chat"></button>' +
        "</div>",
    );
  };

  const createStep = () =>
    elementGroupStep(
      '[data-testid="quick-actions"]',
      ['[data-testid="quick-docx"]', '[data-testid="quick-pdf"]'],
      "title",
      "body",
      undefined,
      LOG_LABEL,
    );

  it("spotlights the members only, leaving the rest of the container dark", () => {
    mountBanner();
    withRect('[data-testid="quick-docx"]', {
      top: 100,
      left: 0,
      width: 100,
      height: 80,
    });
    withRect('[data-testid="quick-pdf"]', {
      top: 100,
      left: 300,
      width: 100,
      height: 80,
    });
    // The tile with its own step: its box must not widen the spotlight.
    withRect('[data-testid="quick-ai-chat"]', {
      top: 100,
      left: 500,
      width: 100,
      height: 80,
    });

    const node = spotlight(createStep())!;

    expect(node.style.top).toBe("100px");
    expect(node.style.left).toBe("0px");
    expect(node.style.width).toBe("400px");
    expect(node.style.height).toBe("80px");
    // Viewport coordinates, which is what `getBoundingClientRect` measures.
    expect(node.style.position).toBe("fixed");
  });

  it("keeps the tooltip on the container", () => {
    mountBanner();

    expect(createStep().target).toBe('[data-testid="quick-actions"]');
  });

  it("falls back to the container when nothing is measurable", () => {
    // Every rect is 0x0 (a collapsed banner, or plain jsdom): a degenerate
    // union would send the spotlight to the viewport corner.
    mountBanner();

    expect(spotlight(createStep())).toBe(
      document.querySelector('[data-testid="quick-actions"]'),
    );
  });

  it("takes its stand-in node back out of the page afterwards", () => {
    mountBanner();
    withRect('[data-testid="quick-docx"]', {
      top: 0,
      left: 0,
      width: 100,
      height: 80,
    });

    const step = createStep();
    const node = spotlight(step)!;

    expect(node.isConnected).toBe(true);

    step.after?.(HOOK_DATA);

    expect(node.isConnected).toBe(false);
  });
});

describe("menuStep", () => {
  /**
   * A trigger that toggles a menu, the way MainButton's dropdown does: the
   * first click opens it, the next one closes it.
   */
  const mountToggle = () => {
    mount('<button id="trigger"></button>');

    document.querySelector("#trigger")!.addEventListener("click", () => {
      const open = document.querySelector(".p-contextmenu");

      if (open) {
        open.remove();
        return;
      }

      const menu = document.createElement("div");
      menu.className = "p-contextmenu";
      document.body.appendChild(menu);
    });
  };

  const step = () =>
    menuStep(
      "#trigger",
      ".p-contextmenu",
      "title",
      "body",
      undefined,
      LOG_LABEL,
    );

  it("opens the menu on the way in and closes it on the way out", async () => {
    mountToggle();

    const menuOpener = step();

    await menuOpener.before?.(HOOK_DATA);

    expect(document.querySelector(".p-contextmenu")).not.toBeNull();

    menuOpener.after?.(HOOK_DATA);

    expect(document.querySelector(".p-contextmenu")).toBeNull();
  });

  it("leaves an already-open menu alone", async () => {
    // Walking back to the step runs its hooks again; a blind second click on a
    // toggle would close the menu the step is about to spotlight.
    mountToggle();

    const menuOpener = step();

    await menuOpener.before?.(HOOK_DATA);
    const opened = document.querySelector(".p-contextmenu");
    await menuOpener.before?.(HOOK_DATA);

    expect(document.querySelector(".p-contextmenu")).toBe(opened);
  });

  it("survives the start-of-run DOM filter with its menu closed", () => {
    mountToggle();

    expect(isStepTargetPresent(step())).toBe(true);
  });

  it("takes the button into the spotlight when asked to", async () => {
    mountToggle();
    withRect("#trigger", { top: 0, left: 0, width: 120, height: 40 });

    const withButton = menuStep(
      "#trigger",
      ".p-contextmenu",
      "title",
      "body",
      undefined,
      LOG_LABEL,
      ["#trigger"],
    );

    await withButton.before?.(HOOK_DATA);
    withRect(".p-contextmenu", {
      top: 40,
      left: 0,
      width: 240,
      height: 300,
    });

    const node = spotlight(withButton)!;

    // One region around both: the button on top, the menu hanging off it.
    expect(node.style.top).toBe("0px");
    expect(node.style.width).toBe("240px");
    expect(node.style.height).toBe("340px");

    withButton.after?.(HOOK_DATA);

    // The menu is put away and the stand-in node goes with it.
    expect(document.querySelector(".p-contextmenu")).toBeNull();
    expect(document.getElementById("tour-spotlight-union")).toBeNull();
  });
});

describe("hoverRevealStep", () => {
  const shareIcon = '[data-testid="table-row-0"] .create-share-link';

  const mountRow = () =>
    mount(
      '<div data-testid="table-row-0">' +
        '<div class="badges__quickButtons">' +
        '<div class="badge copy-link create-share-link"></div>' +
        "</div></div>",
    );

  const step = () =>
    hoverRevealStep(shareIcon, "title", "body", undefined, LOG_LABEL);

  it("marks the control on the way in and unmarks it on the way out", async () => {
    // The row hides it until hover, and hover can't be faked — the class the
    // step adds is what the paired CSS rule keys off.
    mountRow();

    const revealer = step();

    await revealer.before?.(HOOK_DATA);

    expect(
      document
        .querySelector(shareIcon)
        ?.classList.contains("tour-reveal-hidden-control"),
    ).toBe(true);

    revealer.after?.(HOOK_DATA);

    expect(document.querySelector(".tour-reveal-hidden-control")).toBeNull();
  });

  it("survives the start-of-run filter while the control is still hidden", () => {
    // `display: none` makes the usual visibility check say no, which is exactly
    // how this step used to get dropped and never shown at all.
    mountRow();
    document
      .querySelector<HTMLElement>(shareIcon)!
      .style.setProperty("display", "none");

    expect(isStepTargetPresent(step())).toBe(true);
  });

  it("is dropped when the list has no such control at all", () => {
    mount('<div data-testid="table-row-0"></div>');

    expect(isStepTargetPresent(step())).toBe(false);
  });
});

describe("file-list row anchors", () => {
  /**
   * The shape a file list actually renders. The id every view puts on a row
   * sits on the drag-and-drop wrapper; ui-kit's own table row is nested inside
   * it and carries the `data-testid`. Both are `display: contents`, so the only
   * nodes with a box are the cells two levels down.
   */
  const mountTableRow = () => {
    mount(`
      <div id="folder_-1000">
        <div data-testid="table-row-0">
          <div class="name-cell"><span>Employee onboarding</span></div>
          <div class="modified-cell"></div>
        </div>
      </div>
    `);

    withRect("#folder_-1000", { top: 0, left: 0, width: 0, height: 0 });
    withRect('[data-testid="table-row-0"]', {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    });
    withRect(".name-cell", { top: 120, left: 390, width: 600, height: 48 });
    withRect(".modified-cell", { top: 120, left: 990, width: 260, height: 48 });
  };

  const rowStep = (selector: string) =>
    fileItemStep(selector, "title", "body", undefined, LOG_LABEL);

  it("lays a row out against its cells, however deep the boxless wrappers go", () => {
    // The regression: the search stopped one level below the anchor, which for
    // a row named by its id found nothing but the second `display: contents`
    // wrapper — 0×0 at (0,0) exactly like the first. Joyride laid the step out
    // against that and parked the tooltip in the corner of the viewport with
    // nothing under the spotlight.
    mountTableRow();

    const step = rowStep("#folder_-1000");
    const cell = document.querySelector(".name-cell");

    expect((step.target as () => HTMLElement | null)()).toBe(cell);
    expect(spotlight(step)).toBe(cell);
  });

  it("lands on the same cell whichever way the row is named", () => {
    // The two names sit a level apart, and a step points at whichever one its
    // section knows the row by — the anchor has to come out the same.
    mountTableRow();

    const step = rowStep('[data-testid="table-row-0"]');

    expect((step.target as () => HTMLElement | null)()).toBe(
      document.querySelector(".name-cell"),
    );
  });

  it("leaves a row that can be measured alone", () => {
    // The rows and tiles views render an ordinary box, which is the anchor.
    mount('<div data-testid="tile_0"><span class="title">Space</span></div>');
    withRect('[data-testid="tile_0"]', {
      top: 80,
      left: 40,
      width: 220,
      height: 180,
    });
    withRect(".title", { top: 240, left: 48, width: 200, height: 20 });

    const step = rowStep('[data-testid="tile_0"]');

    expect((step.target as () => HTMLElement | null)()).toBe(
      document.querySelector('[data-testid="tile_0"]'),
    );
  });

  it("keeps the row itself when nothing under it measures either", () => {
    // Giving up would drop a step whose target is on the page; a leaf that
    // measures nothing is no worse an anchor than none at all.
    mount('<div id="folder_-1000"><div data-testid="table-row-0"></div></div>');

    const step = rowStep("#folder_-1000");

    expect((step.target as () => HTMLElement | null)()).toBe(
      document.querySelector("#folder_-1000"),
    );
  });
});

describe("revealStep", () => {
  const TARGET = "#late-arrival";

  /**
   * How long the step actually waited before giving up. The wait is swallowed
   * on purpose (a missing anchor must not kill the tour), so the elapsed time
   * is the only thing that says which budget was used.
   */
  const waitedFor = async (hooks: Parameters<typeof revealStep>[5]) => {
    vi.useFakeTimers();

    try {
      const step = revealStep(TARGET, "title", "body", undefined, LOG_LABEL, hooks);

      let settled = false;
      const pending = step.before?.(HOOK_DATA).then(() => {
        settled = true;
      });

      // Nothing ever mounts `TARGET`, so the wait runs its full budget.
      await vi.advanceTimersByTimeAsync(STEP_TARGET_TIMEOUT + 1);
      const settledAtOrdinary = settled;

      await vi.advanceTimersByTimeAsync(NAVIGATION_TARGET_TIMEOUT);
      await pending;

      return { settledAtOrdinary, settled };
    } finally {
      vi.useRealTimers();
    }
  };

  it("gives a navigating reveal room for the route change to land", async () => {
    // The regression: a reveal that navigates was held to the ordinary budget,
    // so the wait expired before the section had finished fetching. Joyride
    // then laid the step out against a target that never arrived and pinned
    // the tooltip to the corner with nothing under the spotlight.
    const { settledAtOrdinary, settled } = await waitedFor({
      reveal: () => {},
      restore: () => {},
      navigates: true,
    });

    expect(settledAtOrdinary).toBe(false);
    expect(settled).toBe(true);
  });

  it("keeps the short budget for a reveal that only opens what is already there", async () => {
    // A panel the stores open is on screen within a tick; making everyone wait
    // the navigation budget would be seconds of staring at a spinner.
    const { settledAtOrdinary } = await waitedFor({
      reveal: () => {},
      restore: () => {},
    });

    expect(settledAtOrdinary).toBe(true);
  });

  it("is not overruled by joyride's own caps", async () => {
    // The budgets above only decide anything if joyride is still waiting when
    // they expire. `beforeTimeout` and `targetWaitTimeout` are its own caps on
    // the same wait, and the shorter of the two wins — set below the step
    // budget they silently undo it, and the step is laid out against a target
    // that has not arrived yet. That is the corner-tooltip bug, and it is
    // invisible from inside `revealStep`, so the invariant is asserted here.
    const { JOYRIDE_TIMEOUTS } = await import("../useTour");

    expect(JOYRIDE_TIMEOUTS.beforeTimeout).toBeGreaterThan(
      NAVIGATION_TARGET_TIMEOUT,
    );
    expect(JOYRIDE_TIMEOUTS.targetWaitTimeout).toBeGreaterThan(
      NAVIGATION_TARGET_TIMEOUT,
    );
  });
});
