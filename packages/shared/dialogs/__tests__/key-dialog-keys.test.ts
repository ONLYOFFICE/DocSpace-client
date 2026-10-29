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

import type React from "react";
import { describe, expect, it, vi } from "vitest";

import { activateOnEnter, submitOnEnter } from "../key-dialog-keys";

const keyEvent = (
  tag: "input" | "textarea" | "a",
  init: Partial<{ key: string; shiftKey: boolean; defaultPrevented: boolean }>,
) => {
  const currentTarget = document.createElement(tag);
  const preventDefault = vi.fn();
  const click = vi.fn();
  currentTarget.click = click;
  const event = {
    key: "Enter",
    shiftKey: false,
    defaultPrevented: false,
    ...init,
    currentTarget,
    preventDefault,
  } as unknown as React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>;
  return { event, preventDefault, click };
};

describe("submitOnEnter", () => {
  it("submits on Enter in a text field and takes the key", () => {
    const submit = vi.fn();
    const { event, preventDefault } = keyEvent("input", {});

    submitOnEnter(submit, true)(event);

    expect(submit).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("leaves Shift+Enter in a textarea to the line break", () => {
    const submit = vi.fn();
    const { event, preventDefault } = keyEvent("textarea", { shiftKey: true });

    submitOnEnter(submit, true)(event);

    expect(submit).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("submits on plain Enter in a textarea", () => {
    const submit = vi.fn();
    const { event } = keyEvent("textarea", {});

    submitOnEnter(submit, true)(event);

    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("does nothing while the action is disabled", () => {
    const submit = vi.fn();
    const { event, preventDefault } = keyEvent("input", {});

    submitOnEnter(submit, false)(event);

    expect(submit).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("does nothing for a key something else has handled", () => {
    const submit = vi.fn();
    const { event } = keyEvent("input", { defaultPrevented: true });

    submitOnEnter(submit, true)(event);

    expect(submit).not.toHaveBeenCalled();
  });

  it("ignores other keys", () => {
    const submit = vi.fn();
    const { event, preventDefault } = keyEvent("input", { key: "a" });

    submitOnEnter(submit, true)(event);

    expect(submit).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe("activateOnEnter", () => {
  it("clicks the link on Enter and takes the key", () => {
    const { event, preventDefault, click } = keyEvent("a", {});

    activateOnEnter(event);

    expect(click).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys and handled ones", () => {
    const space = keyEvent("a", { key: " " });
    const handled = keyEvent("a", { defaultPrevented: true });

    activateOnEnter(space.event);
    activateOnEnter(handled.event);

    expect(space.click).not.toHaveBeenCalled();
    expect(handled.click).not.toHaveBeenCalled();
  });
});
