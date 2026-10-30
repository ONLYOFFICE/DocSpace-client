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

import { afterEach, describe, expect, it } from "vitest";

import {
  focusListOnSelectionKey,
  isContextMenuOpen,
  isKeyOwnedByFocus,
} from "../hotkeys";

// Dispatches a keydown on the element and reports what the helper says.
const owns = (target: Element, key: string) => {
  let result: boolean | undefined;
  const listener = (e: Event) => {
    if (e instanceof KeyboardEvent) result = isKeyOwnedByFocus(e);
  };
  window.addEventListener("keydown", listener);
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  window.removeEventListener("keydown", listener);
  return result;
};

const mount = (html: string) => {
  document.body.innerHTML = html;
  return document.body.firstElementChild!;
};

describe("isKeyOwnedByFocus", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("leaves Tab to the focused element whatever it is", () => {
    expect(owns(document.body, "Tab")).toBe(true);
  });

  // Shift's own keydown arrives before the Tab of Shift+Tab; the list must
  // not take the focus there, or the Tab runs backwards from the list.
  it("leaves a lone modifier to the focused element", () => {
    const button = mount("<button>Rooms</button>");
    for (const key of ["Shift", "Control", "Alt", "Meta"]) {
      expect(owns(button, key), key).toBe(true);
    }
  });

  it("gives Enter and Space to buttons, links and menu triggers", () => {
    for (const html of [
      "<button>New</button>",
      '<a href="/rooms">Rooms</a>',
      '<div role="tab" tabindex="0">Share</div>',
      '<div role="button" tabindex="0" aria-haspopup="menu">...</div>',
    ]) {
      const el = mount(html);
      expect(owns(el, "Enter"), html).toBe(true);
      expect(owns(el, " "), html).toBe(true);
    }
  });

  // The section and every file row are react-dropzone roots with
  // role="button": Enter there opens the selected item.
  it("keeps Enter for the list on a row or the section dropzone", () => {
    const section = mount(
      '<div role="button" tabindex="0"><div role="button" tabindex="0" id="row">Doc</div></div>',
    );
    expect(owns(section, "Enter")).toBe(false);
    expect(owns(document.getElementById("row")!, "Enter")).toBe(false);
  });

  it("gives the arrows to widgets that move within themselves", () => {
    const tablist = mount(
      '<div role="tablist"><div role="tab" tabindex="0" id="tab">A</div></div>',
    );
    expect(owns(document.getElementById("tab")!, "ArrowRight")).toBe(true);
    expect(owns(tablist, "Home")).toBe(true);
  });

  it("keeps the arrows for the list on a plain button and in the file grid", () => {
    expect(owns(mount("<button>New</button>"), "ArrowDown")).toBe(false);
    expect(
      owns(mount('<div role="grid" tabindex="-1"></div>'), "ArrowDown"),
    ).toBe(false);
  });

  it("gives every navigation key to a trigger whose menu is open", () => {
    const trigger = mount('<button aria-expanded="true">New</button>');
    expect(owns(trigger, "ArrowDown")).toBe(true);
    expect(owns(trigger, "Enter")).toBe(true);
  });

  it("leaves letter hotkeys to the page on a focused button", () => {
    expect(owns(mount("<button>New</button>"), "x")).toBe(false);
  });
});

describe("isContextMenuOpen", () => {
  it("is true only while a context menu is on screen", () => {
    expect(isContextMenuOpen()).toBe(false);
    document.body.innerHTML = '<div class="p-contextmenu"></div>';
    expect(isContextMenuOpen()).toBe(true);
    document.body.innerHTML = "";
  });
});

describe("focusListOnSelectionKey", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const mountList = () => {
    document.body.innerHTML =
      '<div class="section-scroll"><div id="list" tabindex="-1"><div class="row"><button id="more">...</button></div></div></div>';
    return {
      list: document.getElementById("list")!,
      more: document.getElementById("more")!,
    };
  };

  // A closed menu gave the focus back to a row's "..." button; the arrows
  // then moved the selection, and Enter reopened that menu.
  it("takes the focus off a row's button once the arrows move the selection", () => {
    const { list, more } = mountList();
    more.focus();

    focusListOnSelectionKey(new KeyboardEvent("keydown", { key: "ArrowDown" }));

    expect(document.activeElement).toBe(list);
  });

  it("focuses the section's list, not the info panel's scroller before it", () => {
    document.body.innerHTML =
      '<div class="section-scroll info-panel-scroll"><div id="panel" tabindex="-1"></div></div>' +
      '<div class="section-scroll"><div id="list" tabindex="-1"></div></div>';

    focusListOnSelectionKey(new KeyboardEvent("keydown", { key: "ArrowDown" }));

    expect(document.activeElement).toBe(document.getElementById("list"));
  });

  it("leaves the focus alone for any other key", () => {
    const { more } = mountList();
    more.focus();

    focusListOnSelectionKey(new KeyboardEvent("keydown", { key: "Enter" }));
    focusListOnSelectionKey(new KeyboardEvent("keydown", { key: "x" }));

    expect(document.activeElement).toBe(more);
  });
});
