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

import { describe, expect, it } from "vitest";

import {
  isPdfFormContent,
  PDF_FORM_SNIFF_LIMIT,
  sniffPdfFormBlob,
} from "../pdf-form-signature";

const latin1Bytes = (s: string): Uint8Array =>
  Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

const BINARY_COMMENT = "%\xCD\xCA\xD2\xA9\x0D";

const FORM_PREFIX =
  "%PDF-1.7\x0A" +
  BINARY_COMMENT +
  "1 0 obj\x0A<<\x0A" +
  "/ONLYOFFICEFORM 12 0 R\x0A>>\x0A" +
  "stream\x0D\x0A";

describe("pdfFormSignature", () => {
  describe("isPdfFormContent", () => {
    it("detects a well-formed form prefix", () => {
      expect(isPdfFormContent(latin1Bytes(FORM_PREFIX))).toBe(true);
    });

    it("rejects a plain PDF with a generic binary comment", () => {
      const plain =
        "%PDF-1.7\x0A%\xE2\xE3\xCF\xD3\x0A1 0 obj\x0A<<\x0A>>\x0Astream\x0D\x0A";
      expect(isPdfFormContent(latin1Bytes(plain))).toBe(false);
    });

    it("rejects empty input", () => {
      expect(isPdfFormContent(new Uint8Array(0))).toBe(false);
    });

    it("rejects when the first object does not follow the binary comment", () => {
      const text =
        "%PDF-1.7\x0A" + BINARY_COMMENT + "2 0 obj\x0A<<\x0AONLYOFFICEFORM";
      expect(isPdfFormContent(latin1Bytes(text))).toBe(false);
    });

    it("rejects when the signature appears only after the stream marker", () => {
      const text =
        "%PDF-1.7\x0A" +
        BINARY_COMMENT +
        "1 0 obj\x0A<<\x0A>>\x0Astream\x0D\x0A/ONLYOFFICEFORM 12 0 R  ";
      expect(isPdfFormContent(latin1Bytes(text))).toBe(false);
    });

    it("rejects when the signature is not followed by two more tokens", () => {
      const text =
        "%PDF-1.7\x0A" +
        BINARY_COMMENT +
        "1 0 obj\x0A<<\x0A/ONLYOFFICEFORM 1\x0Astream\x0D\x0A";
      expect(isPdfFormContent(latin1Bytes(text))).toBe(false);
    });

    it("ignores a marker that starts beyond the sniff window", () => {
      const text =
        "%PDF-1.7\x0A" +
        BINARY_COMMENT +
        "1 0 obj\x0A<<\x0A" +
        "A".repeat(PDF_FORM_SNIFF_LIMIT) +
        "/ONLYOFFICEFORM 12 0 R\x0Astream\x0D\x0A";
      expect(isPdfFormContent(latin1Bytes(text))).toBe(false);
    });

    it("detects the marker when extra bytes follow the sniff window", () => {
      const withBody = latin1Bytes(FORM_PREFIX + "x".repeat(4096));
      expect(isPdfFormContent(withBody)).toBe(true);
    });
  });

  describe("sniffPdfFormBlob", () => {
    it("reads the sniff window from a Blob and detects a form", async () => {
      const blob = new Blob([
        latin1Bytes(FORM_PREFIX) as BlobPart,
        new Uint8Array(4096) as BlobPart,
      ]);
      await expect(sniffPdfFormBlob(blob)).resolves.toBe(true);
    });

    it("returns false for a non-form Blob", async () => {
      const blob = new Blob([latin1Bytes("%PDF-1.7\x0Aplain") as BlobPart]);
      await expect(sniffPdfFormBlob(blob)).resolves.toBe(false);
    });
  });
});
