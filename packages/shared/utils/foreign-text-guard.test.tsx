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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";

import { createForeignTextGuard } from "./foreign-text-guard";

// The title is rendered next to a sibling, so React gives it a text node of
// its own (a lone string child would be set through textContent instead).
const Title = ({ title, ext }: { title: string; ext?: string }) => (
  <p data-testid="title">
    {title}
    {ext ? <span>{ext}</span> : null}
  </p>
);

// Lets MutationObserver deliver its records.
const flush = () => act(() => new Promise((resolve) => setTimeout(resolve)));

// What a dictionary extension (Lingualeo) does on selection.
const wrapLikeExtension = (text: Node, start: number, end: number) => {
  const range = document.createRange();
  range.setStart(text, start);
  range.setEnd(text, end);
  const mark = document.createElement("wtf");
  range.surroundContents(mark);
  return mark;
};

describe("foreign text guard", () => {
  let disconnect: () => void;

  beforeEach(() => {
    disconnect = createForeignTextGuard(document.body);
  });

  afterEach(() => disconnect());

  it("drops the leftovers once React updates a split text", async () => {
    const { getByTestId, rerender } = render(<Title title="Backend team" ext=".docx" />);
    const p = getByTestId("title");

    wrapLikeExtension(p.firstChild!, 0, 7);
    await flush();
    expect(p.textContent).toBe("Backend team.docx");

    rerender(<Title title="Connectors team" ext=".docx" />);
    await flush();

    expect(p.textContent).toBe("Connectors team.docx");
  });

  it("leaves the extension markup alone until React touches the text", async () => {
    const { getByTestId } = render(<Title title="Backend team" ext=".docx" />);
    const p = getByTestId("title");

    const mark = wrapLikeExtension(p.firstChild!, 0, 7);
    await flush();

    expect(mark.isConnected).toBe(true);
    expect(p.textContent).toBe("Backend team.docx");
  });

  it("cleans up after the extension has already unwrapped its markup", async () => {
    const { getByTestId, rerender } = render(<Title title="Backend team" />);
    const p = getByTestId("title");

    const mark = wrapLikeExtension(p.firstChild!, 3, 7);
    await flush();
    mark.replaceWith(...Array.from(mark.childNodes));
    await flush();

    rerender(<Title title="Connectors team" />);
    await flush();

    expect(p.textContent).toBe("Connectors team");
  });

  it("drops the leftovers when React removes a split text", async () => {
    const Toggle = ({ show }: { show: boolean }) => (
      <p data-testid="title">
        {show ? "Backend team" : null}
        <span>!</span>
      </p>
    );
    const { getByTestId, rerender } = render(<Toggle show />);
    const p = getByTestId("title");

    wrapLikeExtension(p.firstChild!, 0, 7);
    await flush();

    rerender(<Toggle show={false} />);
    await flush();

    expect(p.textContent).toBe("!");
  });

  it("keeps foreign nodes that did not come from a split", async () => {
    const { getByTestId, rerender } = render(<Title title="Backend team" ext=".docx" />);
    const p = getByTestId("title");

    const badge = document.createElement("i");
    badge.textContent = "*";
    p.firstChild!.after(badge);
    await flush();

    rerender(<Title title="Connectors team" ext=".docx" />);
    await flush();

    expect(p.textContent).toBe("Connectors team*.docx");
  });

  it("does not remove a foreign wrapper that holds React nodes", async () => {
    const { getByTestId, rerender } = render(<Title title="Backend team" ext=".docx" />);
    const p = getByTestId("title");
    const ext = p.querySelector("span")!;

    // selection from the middle of the title through the whole extension
    const range = document.createRange();
    range.setStart(p.firstChild!, 8);
    range.setEndAfter(ext);
    range.surroundContents(document.createElement("wtf"));
    await flush();

    rerender(<Title title="Connectors team" ext=".docx" />);
    await flush();

    expect(p.querySelector("span")).toBe(ext);
  });
});
