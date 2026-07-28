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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  TemplateFetchError,
  clearEmptyTemplateCache,
  getEmptyTemplateBytes,
  isValidTemplateContent,
} from "../empty-template";

function ooxmlBytes(size = 32): ArrayBuffer {
  const bytes = new Uint8Array(size);
  bytes.set([0x50, 0x4b, 0x03, 0x04]);
  return bytes.buffer;
}

function pdfBytes(size = 32): ArrayBuffer {
  const bytes = new Uint8Array(size);
  bytes.set([0x25, 0x50, 0x44, 0x46]);
  return bytes.buffer;
}

function htmlBytes(): ArrayBuffer {
  return new TextEncoder().encode("<!doctype html><html></html>").buffer;
}

function okResponse(data: ArrayBuffer) {
  return {
    ok: true,
    arrayBuffer: async () => data,
  } as Response;
}

function errorResponse(status: number) {
  return {
    ok: false,
    status,
    arrayBuffer: async () => new ArrayBuffer(0),
  } as unknown as Response;
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  clearEmptyTemplateCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.ClientConfig = undefined;
});

describe("isValidTemplateContent", () => {
  it("accepts zip magic for OOXML formats and %PDF for pdf", () => {
    expect(isValidTemplateContent(ooxmlBytes(), "docx")).toBe(true);
    expect(isValidTemplateContent(ooxmlBytes(), "xlsx")).toBe(true);
    expect(isValidTemplateContent(ooxmlBytes(), "pptx")).toBe(true);
    expect(isValidTemplateContent(pdfBytes(), "pdf")).toBe(true);
  });

  it("rejects mismatched magic, HTML bodies and empty responses", () => {
    expect(isValidTemplateContent(htmlBytes(), "docx")).toBe(false);
    expect(isValidTemplateContent(ooxmlBytes(), "pdf")).toBe(false);
    expect(isValidTemplateContent(pdfBytes(), "docx")).toBe(false);
    expect(isValidTemplateContent(new ArrayBuffer(0), "docx")).toBe(false);
  });
});

describe("getEmptyTemplateBytes", () => {
  it("requests the authenticated empty-file handler", async () => {
    fetchMock.mockResolvedValueOnce(okResponse(ooxmlBytes()));

    const data = await getEmptyTemplateBytes({ extension: "docx" });

    expect(new Uint8Array(data)[0]).toBe(0x50);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/filehandler.ashx?action=empty&title=.docx",
    );
  });

  it("passes the extension of every supported format via the title", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse(ooxmlBytes()))
      .mockResolvedValueOnce(okResponse(ooxmlBytes()))
      .mockResolvedValueOnce(okResponse(ooxmlBytes()))
      .mockResolvedValueOnce(okResponse(pdfBytes()));

    await getEmptyTemplateBytes({ extension: "docx" });
    await getEmptyTemplateBytes({ extension: "xlsx" });
    await getEmptyTemplateBytes({ extension: "pptx" });
    await getEmptyTemplateBytes({ extension: "pdf" });

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "/filehandler.ashx?action=empty&title=.docx",
      "/filehandler.ashx?action=empty&title=.xlsx",
      "/filehandler.ashx?action=empty&title=.pptx",
      "/filehandler.ashx?action=empty&title=.pdf",
    ]);
  });

  it("prepends the proxy prefix from ClientConfig when set", async () => {
    window.ClientConfig = { proxy: { url: "/prefix" } } as never;
    fetchMock.mockResolvedValueOnce(okResponse(ooxmlBytes()));

    await getEmptyTemplateBytes({ extension: "docx" });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/prefix/filehandler.ashx?action=empty&title=.docx",
    );
  });

  it("throws TemplateFetchError on a non-OK response", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(404));

    await expect(
      getEmptyTemplateBytes({ extension: "docx" }),
    ).rejects.toBeInstanceOf(TemplateFetchError);
  });

  it("throws TemplateFetchError when the response is not a document", async () => {
    fetchMock.mockResolvedValueOnce(okResponse(htmlBytes()));

    await expect(
      getEmptyTemplateBytes({ extension: "docx" }),
    ).rejects.toBeInstanceOf(TemplateFetchError);
  });

  it("throws TemplateFetchError for an unsupported extension", async () => {
    await expect(
      getEmptyTemplateBytes({ extension: "exe" as never }),
    ).rejects.toBeInstanceOf(TemplateFetchError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not cache failed fetches", async () => {
    fetchMock
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(okResponse(ooxmlBytes()));

    await expect(
      getEmptyTemplateBytes({ extension: "docx" }),
    ).rejects.toBeInstanceOf(TemplateFetchError);

    const data = await getEmptyTemplateBytes({ extension: "docx" });
    expect(new Uint8Array(data)[0]).toBe(0x50);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("caches the template and hands out independent copies", async () => {
    fetchMock.mockResolvedValueOnce(okResponse(ooxmlBytes()));

    const first = await getEmptyTemplateBytes({ extension: "docx" });
    const second = await getEmptyTemplateBytes({ extension: "docx" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).not.toBe(first);

    new Uint8Array(first)[0] = 0x00;
    expect(new Uint8Array(second)[0]).toBe(0x50);

    const third = await getEmptyTemplateBytes({ extension: "docx" });
    expect(new Uint8Array(third)[0]).toBe(0x50);
  });

  it("passes the abort signal through to fetch", async () => {
    const controller = new AbortController();
    const abortError = new DOMException("Aborted", "AbortError");
    fetchMock.mockRejectedValueOnce(abortError);

    await expect(
      getEmptyTemplateBytes({
        extension: "docx",
        signal: controller.signal,
      }),
    ).rejects.toBe(abortError);

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      signal: controller.signal,
    });
  });
});
