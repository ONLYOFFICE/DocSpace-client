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
  openUrlWithExportToast,
  OPEN_URL_DELAY_MS,
} from "./openUrlWithExportToast";

const URL = "https://portal.example.com/doceditor?fileId=42";

const T = ((key: string) => key) as unknown as Parameters<
  typeof openUrlWithExportToast
>[0]["t"];

const TEXTS = {
  fileName: "report.xlsx",
  sectionName: "Documents",
};

let openSpy: ReturnType<typeof vi.fn>;

const flushOpen = () => vi.advanceTimersByTime(OPEN_URL_DELAY_MS);

const getExportToastCall = () => {
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

describe("openUrlWithExportToast", () => {
  it("opens a new tab and still names the file in a persistent toast", () => {
    openUrlWithExportToast({
      url: URL,
      openOnNewPage: true,
      t: T,
      texts: TEXTS,
    });

    expect(openSpy).not.toHaveBeenCalled();

    const content = getExportToastCall();
    render(content);

    const link = screen.getByText(TEXTS.fileName);
    expect(link).toHaveAttribute("href", URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText(TEXTS.sectionName, { exact: false })).toBeVisible();

    flushOpen();
    expect(openSpy).toHaveBeenCalledWith(URL, "_blank");
  });

  it("shows the same toast when the popup is blocked", () => {
    openSpy.mockReturnValue(null);

    openUrlWithExportToast({
      url: URL,
      openOnNewPage: true,
      t: T,
      texts: TEXTS,
    });
    flushOpen();

    render(getExportToastCall());
    expect(screen.getByText(TEXTS.fileName)).toHaveAttribute("href", URL);
  });

  it("shows the same toast when the open attempt throws", () => {
    openSpy.mockImplementation(() => {
      throw new Error("blocked");
    });

    openUrlWithExportToast({
      url: URL,
      openOnNewPage: true,
      t: T,
      texts: TEXTS,
    });

    expect(() => flushOpen()).not.toThrow();

    render(getExportToastCall());
    expect(screen.getByText(TEXTS.fileName)).toHaveAttribute("href", URL);
  });

  it("mounts the toast before a same-tab navigation starts", () => {
    openUrlWithExportToast({
      url: URL,
      openOnNewPage: false,
      t: T,
      texts: TEXTS,
    });

    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(openSpy).not.toHaveBeenCalled();

    flushOpen();

    expect(openSpy).toHaveBeenCalledWith(URL, "_self");
    expect(toastr.success).toHaveBeenCalledTimes(1);
  });

  it("dismisses the toast when the file link is clicked", () => {
    openUrlWithExportToast({
      url: URL,
      openOnNewPage: true,
      t: T,
      texts: TEXTS,
    });

    render(getExportToastCall());
    fireEvent.click(screen.getByText(TEXTS.fileName));

    expect(toastr.clear).toHaveBeenCalled();
  });

  it("skips the open attempt but keeps the toast", () => {
    openUrlWithExportToast({
      url: URL,
      openOnNewPage: true,
      skipAutoOpen: true,
      t: T,
      texts: TEXTS,
    });
    flushOpen();

    expect(openSpy).not.toHaveBeenCalled();

    render(getExportToastCall());
    expect(screen.getByText(TEXTS.fileName)).toHaveAttribute("href", URL);
  });

  it("keeps the file link in the same tab when new pages are turned off", () => {
    openUrlWithExportToast({
      url: URL,
      openOnNewPage: false,
      skipAutoOpen: true,
      t: T,
      texts: TEXTS,
    });
    flushOpen();

    render(getExportToastCall());
    expect(screen.getByText(TEXTS.fileName)).toHaveAttribute("target", "_self");
  });
});
