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

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), clear: vi.fn() },
}));

// the real Trans needs an initialized i18next instance; the toast only has to
// put the file name inside the link and the rest of the phrase around it
vi.mock("react-i18next", () => ({
  Trans: ({
    values,
    components,
  }: {
    values: { fileName: string; sectionName: string };
    components: Record<number, React.ReactElement>;
  }) => (
    <span>
      {React.cloneElement(components[1], {}, values.fileName)}
      {` file exported to ${values.sectionName}`}
    </span>
  ),
}));

import { toastr } from "@docspace/ui-kit/components/toast";

import {
  openUrlWithFallbackToast,
  OPEN_URL_DELAY_MS,
} from "./openUrlWithFallbackToast";

const URL = "https://portal.example.com/doceditor?fileId=42";

const T = ((key: string) => key) as unknown as Parameters<
  typeof openUrlWithFallbackToast
>[0]["t"];

const TEXTS = {
  success: "Saved to Documents",
  fileName: "report.xlsx",
  sectionName: "Documents",
};

let openSpy: ReturnType<typeof vi.fn>;

const flushOpen = () => vi.advanceTimersByTime(OPEN_URL_DELAY_MS);

const getFallbackToastCall = () => {
  expect(toastr.success).toHaveBeenCalledTimes(1);
  const call = vi.mocked(toastr.success).mock.calls[0];
  expect(call[1]).toBeUndefined();
  expect(call[2]).toBe(0);
  expect(call[3]).toBe(true);
  return call[0] as React.ReactElement;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();

  openSpy = vi.fn().mockReturnValue({} as Window);
  window.open = openSpy as unknown as typeof window.open;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("openUrlWithFallbackToast", () => {
  it("opens a new tab and shows the plain success toast", () => {
    openUrlWithFallbackToast({
      url: URL,
      openOnNewPage: true,
      t: T,
      texts: TEXTS,
    });

    expect(openSpy).not.toHaveBeenCalled();
    flushOpen();

    expect(openSpy).toHaveBeenCalledWith(URL, "_blank");
    expect(toastr.success).toHaveBeenCalledWith(TEXTS.success);
  });

  it("shows no toast on success when no success text is given", () => {
    openUrlWithFallbackToast({
      url: URL,
      openOnNewPage: true,
      t: T,
      texts: { fileName: TEXTS.fileName, sectionName: TEXTS.sectionName },
    });
    flushOpen();

    expect(openSpy).toHaveBeenCalledWith(URL, "_blank");
    expect(toastr.success).not.toHaveBeenCalled();
  });

  it("falls back to a persistent toast naming the file when the popup is blocked", () => {
    openSpy.mockReturnValue(null);

    openUrlWithFallbackToast({
      url: URL,
      openOnNewPage: true,
      t: T,
      texts: TEXTS,
    });
    flushOpen();

    const content = getFallbackToastCall();
    render(content);

    const link = screen.getByText(TEXTS.fileName);
    expect(link).toHaveAttribute("href", URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText(TEXTS.sectionName, { exact: false })).toBeVisible();

    fireEvent.click(link);
    expect(toastr.clear).toHaveBeenCalled();
  });

  it("treats a null result of a same-tab navigation as a success", () => {
    openSpy.mockReturnValue(null);

    openUrlWithFallbackToast({
      url: URL,
      openOnNewPage: false,
      t: T,
      texts: TEXTS,
    });
    flushOpen();

    expect(openSpy).toHaveBeenCalledWith(URL, "_self");
    expect(toastr.success).toHaveBeenCalledWith(TEXTS.success);
  });

  it("skips the open attempt and goes straight to the file toast", () => {
    openUrlWithFallbackToast({
      url: URL,
      openOnNewPage: true,
      skipAutoOpen: true,
      t: T,
      texts: TEXTS,
    });
    flushOpen();

    expect(openSpy).not.toHaveBeenCalled();

    const content = getFallbackToastCall();
    render(content);
    expect(screen.getByText(TEXTS.fileName)).toHaveAttribute("href", URL);
  });

  it("keeps the file link in the same tab when new pages are turned off", () => {
    openUrlWithFallbackToast({
      url: URL,
      openOnNewPage: false,
      skipAutoOpen: true,
      t: T,
      texts: TEXTS,
    });
    flushOpen();

    render(getFallbackToastCall());
    expect(screen.getByText(TEXTS.fileName)).toHaveAttribute("target", "_self");
  });
});
