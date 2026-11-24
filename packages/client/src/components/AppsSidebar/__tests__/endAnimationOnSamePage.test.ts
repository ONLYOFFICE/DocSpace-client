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


import { afterEach, describe, expect, it, vi } from "vitest";

import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";

import { endAnimationOnSamePage } from "../endAnimationOnSamePage";

const listen = () => {
  const ended = vi.fn();
  window.addEventListener(AnimationEvents.END_ANIMATION, ended);
  return {
    ended,
    stop: () =>
      window.removeEventListener(AnimationEvents.END_ANIMATION, ended),
  };
};

describe("endAnimationOnSamePage", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, "", "/");
  });

  it("finishes the fill when the entry opens the page on screen", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/ai-rooms/filter?page=1");
    const onClick = vi.fn((_entry: unknown, _meta: unknown) => "handled");
    const { ended, stop } = listen();

    const entry = endAnimationOnSamePage({
      linkData: { path: "/ai-rooms/filter?page=1" },
      onClick,
    });
    const meta = { isLink: true };

    expect(entry.onClick?.(entry, meta)).toBe("handled");
    expect(onClick).toHaveBeenCalledWith(entry, meta);
    expect(ended).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(ended).toHaveBeenCalledTimes(1);
    stop();
  });

  it("leaves it to the page when the entry opens another one", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/rooms/shared/filter");
    const { ended, stop } = listen();

    endAnimationOnSamePage({
      linkData: { path: "/ai-rooms/filter?page=1" },
      onClick: vi.fn(),
    }).onClick?.();
    vi.runAllTimers();

    expect(ended).not.toHaveBeenCalled();
    stop();
  });

  it("leaves an entry without a page untouched", () => {
    const entry = { onClick: vi.fn() };
    expect(endAnimationOnSamePage(entry)).toBe(entry);
  });
});
