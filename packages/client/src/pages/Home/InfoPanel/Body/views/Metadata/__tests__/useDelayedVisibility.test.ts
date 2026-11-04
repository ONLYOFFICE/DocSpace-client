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

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HIDE_DELAY,
  SHOW_DELAY,
  useDelayedVisibility,
} from "../hooks/useDelayedVisibility";

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

const renderVisibility = () =>
  renderHook(({ isActive }) => useDelayedVisibility(isActive), {
    initialProps: { isActive: false },
  });

describe("useDelayedVisibility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("never shows a run that ends before the delay", () => {
    const { result, rerender } = renderVisibility();

    rerender({ isActive: true });
    advance(SHOW_DELAY - 1);
    rerender({ isActive: false });
    advance(SHOW_DELAY + HIDE_DELAY);

    expect(result.current).toBe(false);
  });

  it("shows a long run after the delay and keeps it a moment after it ends", () => {
    const { result, rerender } = renderVisibility();

    rerender({ isActive: true });
    advance(SHOW_DELAY);
    expect(result.current).toBe(true);

    rerender({ isActive: false });
    advance(HIDE_DELAY - 1);
    expect(result.current).toBe(true);

    advance(1);
    expect(result.current).toBe(false);
  });

  it("stays visible when a new run starts while the last one is held", () => {
    const { result, rerender } = renderVisibility();

    rerender({ isActive: true });
    advance(SHOW_DELAY);
    rerender({ isActive: false });
    advance(HIDE_DELAY - 1);
    rerender({ isActive: true });
    advance(HIDE_DELAY);

    expect(result.current).toBe(true);
  });
});
