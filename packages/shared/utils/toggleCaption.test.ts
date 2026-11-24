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

import { describe, expect, it, vi } from "vitest";

import { findCaptionToggle, onToggleCaptionClick } from "./toggleCaption";

const toggle = (disabled = false) => `
  <div data-testid="toggle-button">
    <label data-testid="toggle-button-container">
      <input type="checkbox" ${disabled ? "disabled" : ""} />
    </label>
  </div>`;

const mount = (html: string) => {
  document.body.innerHTML = html;
  return document.body;
};

const clickOn = (caption: Element, target: Element = caption) =>
  onToggleCaptionClick({ currentTarget: caption, target });

describe("toggle caption", () => {
  it("finds the toggle of its own row", () => {
    const root = mount(`<div class="row"><p id="c">Caption</p>${toggle()}</div>`);
    const input = root.querySelector("input")!;
    expect(findCaptionToggle(root.querySelector("#c")!)).toBe(input);
  });

  it("finds a toggle a few levels up (caption inside a text block)", () => {
    const root = mount(
      `<div>${toggle()}<div class="caption"><div class="title"><p id="c">T</p></div></div></div>`,
    );
    expect(findCaptionToggle(root.querySelector("#c")!)).toBe(
      root.querySelector("input"),
    );
  });

  it("gives up when several toggles share the ancestor", () => {
    const root = mount(`<div><p id="c">T</p>${toggle()}${toggle()}</div>`);
    expect(findCaptionToggle(root.querySelector("#c")!)).toBeNull();
  });

  it("a click on the caption clicks the toggle once", () => {
    const root = mount(`<div><p id="c">Caption</p>${toggle()}</div>`);
    const input = root.querySelector("input")!;
    const onClick = vi.fn();
    input.addEventListener("click", onClick);

    clickOn(root.querySelector("#c")!);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);
  });

  it("leaves a disabled toggle alone", () => {
    const root = mount(`<div><p id="c">Caption</p>${toggle(true)}</div>`);
    const input = root.querySelector("input")!;

    clickOn(root.querySelector("#c")!);

    expect(input.checked).toBe(false);
  });

  it("leaves a link in the caption to itself", () => {
    const root = mount(
      `<div><p id="c">Caption <a id="l" href="#">more</a></p>${toggle()}</div>`,
    );
    const input = root.querySelector("input")!;

    clickOn(root.querySelector("#c")!, root.querySelector("#l")!);

    expect(input.checked).toBe(false);
  });

  it("does not click again for the toggle's own click bubbling up", () => {
    const root = mount(`<h3 id="c">Caption ${toggle()}</h3>`);
    const input = root.querySelector("input")!;
    const onClick = vi.fn();
    input.addEventListener("click", onClick);

    clickOn(root.querySelector("#c")!, input);

    expect(onClick).not.toHaveBeenCalled();
  });
});
