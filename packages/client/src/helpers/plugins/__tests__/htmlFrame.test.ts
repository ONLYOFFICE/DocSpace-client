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

import { describe, it, expect, vi, beforeEach } from "vitest";

import { showHtmlInFrame } from "../htmlFrame";

const PAGE = `${window.location.origin}/static/html-frame/html-frame.html`;

const addFrame = (id: string) => {
  const frame = document.createElement("iframe");
  frame.id = id;
  frame.setAttribute("sandbox", "allow-popups");
  frame.setAttribute("srcdoc", "<p>fallback</p>");
  document.body.appendChild(frame);
  return frame;
};

const ready = (frame: HTMLIFrameElement, origin = window.location.origin) =>
  window.dispatchEvent(
    new MessageEvent("message", {
      origin,
      data: { type: "html-frame-ready" },
      source: frame.contentWindow,
    }),
  );

describe("showHtmlInFrame", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("points the frame at the page and drops the plugin's sandbox and srcdoc", () => {
    const frame = addFrame("body-1");

    showHtmlInFrame({ frameId: "body-1", html: "<p>one</p>", title: "One" });

    expect(frame.src).toBe(PAGE);
    expect(frame.hasAttribute("sandbox")).toBe(false);
    expect(frame.hasAttribute("srcdoc")).toBe(false);
    expect(frame.title).toBe("One");
  });

  it("hands the HTML over once the page is ready, and new HTML at once", () => {
    const frame = addFrame("body-2");

    showHtmlInFrame({ frameId: "body-2", html: "<p>one</p>", title: "One" });
    const postMessage = vi.spyOn(frame.contentWindow!, "postMessage");
    expect(postMessage).not.toHaveBeenCalled();

    ready(frame);
    expect(postMessage).toHaveBeenLastCalledWith(
      { type: "html-frame-content", html: "<p>one</p>", title: "One" },
      window.location.origin,
    );

    showHtmlInFrame({ frameId: "body-2", html: "<p>two</p>" });
    expect(postMessage).toHaveBeenLastCalledWith(
      { type: "html-frame-content", html: "<p>two</p>", title: undefined },
      window.location.origin,
    );
  });

  it("ignores a ready message from another origin", () => {
    const frame = addFrame("body-3");

    showHtmlInFrame({ frameId: "body-3", html: "<p>one</p>" });
    const postMessage = vi.spyOn(frame.contentWindow!, "postMessage");
    ready(frame, "https://elsewhere.test");

    expect(postMessage).not.toHaveBeenCalled();
  });

  it("does nothing when no frame has the id", () => {
    expect(() =>
      showHtmlInFrame({ frameId: "missing", html: "<p>one</p>" }),
    ).not.toThrow();
  });
});
