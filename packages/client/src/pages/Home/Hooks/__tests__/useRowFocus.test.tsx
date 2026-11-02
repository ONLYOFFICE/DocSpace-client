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

import { act, fireEvent, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRowFocus } from "../useRowFocus";

// A table view of two rows: each row is display: contents, so its first cell
// holds the focus for it. The section's scroller wraps its content, the
// sticky header with the search box included; the arrows focus that content
// wrapper. Outside the list, an info panel draws a files item of its own.
const buildPage = () => {
  document.body.innerHTML = `
    <div class="section-scroll">
     <div data-testid="list" tabindex="-1">
      <div class="section-sticky-container">
        <input data-testid="search" />
      </div>
      <div id="file_1" class="files-item row-a_docx" style="display: contents">
        <div class="table-container_cell" data-testid="a-name">A</div>
        <div class="table-container_cell" data-testid="a-date">
          <button type="button" data-testid="a-menu">menu</button>
        </div>
      </div>
      <div id="file_2" class="files-item row-b_docx" style="display: contents">
        <div class="table-container_cell" data-testid="b-name">B</div>
        <div class="table-container_cell">
          <button type="button" data-testid="b-menu">menu</button>
        </div>
      </div>
     </div>
    </div>
    <div class="section-scroll info-panel-scroll">
      <div class="files-item">
        <button type="button" data-testid="panel-button">panel</button>
      </div>
    </div>
    <button type="button" data-testid="outside">outside</button>
  `;
};

const byTestId = (id: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

const CARET_A = { id: "row-a", fileExst: "docx" };

// The caret moved to row A from the keyboard: its first cell takes the focus.
const focusRowA = async () => {
  const onRowFocus = vi.fn();
  const hook = renderHook(
    ({ caret }) => useRowFocus(caret, onRowFocus),
    { initialProps: { caret: null as typeof CARET_A | null } },
  );
  fireEvent.keyDown(window, { key: "ArrowDown" });
  hook.rerender({ caret: CARET_A });
  await waitFor(() => expect(byTestId("a-name")).toHaveFocus());
  return hook;
};

describe("useRowFocus", () => {
  beforeEach(() => {
    buildPage();
    // jsdom lays nothing out: every element counts as rendered.
    vi.spyOn(Element.prototype, "getClientRects").mockImplementation(() => {
      const rects = [new DOMRect(0, 0, 10, 10)];
      return Object.assign(rects, { item: (i: number) => rects[i] ?? null });
    });
    // jsdom has no CSS.escape; the class names here need no escaping.
    if (!globalThis.CSS?.escape)
      vi.stubGlobal("CSS", { escape: (value: string) => value });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  // The caret moved from the keyboard pulls the focus along - from the list
  // the arrows focused, not from a control that only shares its scroller.
  describe("the caret moving", () => {
    const moveCaret = (from: HTMLElement) => {
      const onRowFocus = vi.fn();
      const hook = renderHook(
        ({ caret }) => useRowFocus(caret, onRowFocus),
        { initialProps: { caret: null as typeof CARET_A | null } },
      );
      act(() => from.focus());
      fireEvent.keyDown(from, { key: "ArrowDown" });
      hook.rerender({ caret: CARET_A });
      return hook;
    };

    it("takes the focus from the list to the caret's row", async () => {
      moveCaret(byTestId("list"));
      await waitFor(() => expect(byTestId("a-name")).toHaveFocus());
    });

    // A delete run from the keyboard moves the caret off the removed rows
    // when it ends: the user typing in the search box by then lost the focus
    // to a row.
    it("leaves the focus in the search box above the rows", async () => {
      moveCaret(byTestId("search"));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(byTestId("search")).toHaveFocus();
    });
  });

  // A tile is the item's own card inside a drag-and-drop wrapper, and the card
  // handles its context menu. The wrapper held the focus: Shift+F10 or the
  // Menu key fired the context menu on it, past the card, and the section's
  // menu opened instead of the item's - and its ring stood off the card's
  // own border, two frames with a gap between them.
  it("focuses a tile's own card, which takes the keyboard's context menu", async () => {
    document.body.innerHTML = `
      <div class="section-scroll">
        <div class="tile-container">
          <div id="folder_7" class="files-item 7">
            <div data-testid="card">
              <button type="button" data-testid="card-menu">menu</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const onContextMenu = vi.fn();
    byTestId("card").addEventListener("contextmenu", onContextMenu);
    const hook = renderHook(({ caret }) => useRowFocus(caret, vi.fn()), {
      initialProps: { caret: null as { id: number } | null },
    });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    hook.rerender({ caret: { id: 7 } });

    await waitFor(() => expect(byTestId("card")).toHaveFocus());
    expect(byTestId("card")).toHaveAttribute("data-row-focus");

    // What the browser does for Shift+F10: a contextmenu on the focused element.
    fireEvent.contextMenu(document.activeElement!);
    expect(onContextMenu).toHaveBeenCalledOnce();
  });

  // A table row is several cells: a press on any of them is still on the
  // row, which must stay able to take the focus back.
  it("keeps the row held when the pointer presses another of its cells", async () => {
    await focusRowA();
    const holder = byTestId("a-name");

    fireEvent.pointerDown(byTestId("a-date"));

    expect(holder).toHaveAttribute("data-row-focus");
    expect(holder).toHaveAttribute("tabindex", "-1");

    fireEvent.pointerDown(byTestId("b-name"));

    expect(holder).not.toHaveAttribute("data-row-focus");
    expect(holder).not.toHaveAttribute("tabindex");
  });

  // A dialog or a panel the row opened (Rename, the media viewer, Move to)
  // takes the pointer's presses too: one of them released the row, and the
  // dialog closing gave the focus back to a cell that could no longer take
  // it - the focus fell to the page's body.
  it.each([
    ["a modal dialog", '<div role="dialog" aria-modal="true">'],
    ["a side panel", "<aside>"],
  ])("keeps the row held through a press inside %s it opened", async (_, open) => {
    await focusRowA();
    const holder = byTestId("a-name");
    const close = open.startsWith("<aside") ? "</aside>" : "</div>";
    document.body.insertAdjacentHTML(
      "beforeend",
      `${open}<input data-testid="layer-input" />${close}`,
    );
    act(() => byTestId("layer-input").focus());

    fireEvent.pointerDown(byTestId("layer-input"));

    expect(holder).toHaveAttribute("data-row-focus");
    act(() => holder.focus());
    expect(holder).toHaveFocus();
  });

  // The focus left the list for a dialog: the row stays held for it to come
  // back, but the list going away must not leave that behind.
  it("releases a row still held when the list goes away", async () => {
    const hook = await focusRowA();
    const holder = byTestId("a-name");

    act(() => byTestId("outside").focus());
    expect(holder).toHaveAttribute("data-row-focus");

    hook.unmount();

    expect(holder).not.toHaveAttribute("data-row-focus");
    expect(holder).not.toHaveAttribute("tabindex");
  });

  // Each list holds its own rows: another one going away leaves them be.
  it("releases only its own held rows when it goes away", async () => {
    await focusRowA();
    const other = renderHook(() => useRowFocus(null, vi.fn()));
    const holder = byTestId("a-name");

    act(() => byTestId("outside").focus());
    other.unmount();

    expect(holder).toHaveAttribute("data-row-focus");
  });

  // Back from the browser's toolbar - left with Tab, come back with
  // Shift+Tab onto a row's control - the focus goes to the caret's row.
  // Back from Alt+Tab or another window it is left where it lands.
  describe("focus coming back to the page", () => {
    const leavePage = () => {
      act(() => (document.activeElement as HTMLElement | null)?.blur());
      fireEvent.blur(window);
    };

    it("goes to the caret's row after a Tab left the page", async () => {
      await focusRowA();

      fireEvent.keyDown(window, { key: "Tab" });
      leavePage();
      act(() => byTestId("b-menu").focus());

      expect(byTestId("a-name")).toHaveFocus();
    });

    it("is left where it lands after Alt+Tab", async () => {
      await focusRowA();

      fireEvent.keyDown(window, { key: "Alt", altKey: true });
      leavePage();
      act(() => byTestId("b-menu").focus());

      expect(byTestId("b-menu")).toHaveFocus();
    });
  });

  // Tab out of the list takes the other rows' controls out of the order for
  // that one key - the list's rows, not a files item elsewhere on the page.
  it("takes only the list's other rows out of the Tab order when Tab leaves", async () => {
    await focusRowA();

    fireEvent.keyDown(byTestId("a-name"), { key: "Tab" });

    expect(byTestId("b-menu")).toHaveAttribute("tabindex", "-1");
    expect(byTestId("panel-button")).not.toHaveAttribute("tabindex");
  });
});
