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

// Mirror of the server-side FileChecker.IsExtendedPDFFile: keep in sync.

export const PDF_FORM_SNIFF_LIMIT = 300;

const PDF_FORM_SIGNATURE = "ONLYOFFICEFORM";

const PDF_BINARY_COMMENT = "%\xCD\xCA\xD2\xA9\x0D";

const PDF_FIRST_OBJECT = "1 0 obj\x0A<<\x0A";

const PDF_STREAM_MARKER = "stream\x0D\x0A";

function latin1(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

export function isPdfFormContent(bytes: Uint8Array): boolean {
  const text = latin1(bytes.subarray(0, PDF_FORM_SNIFF_LIMIT));
  if (!text) return false;

  const indexFirst = text.indexOf(PDF_BINARY_COMMENT);
  if (indexFirst === -1) return false;

  let pFirst = text.substring(indexFirst + PDF_BINARY_COMMENT.length);
  if (!pFirst.startsWith(PDF_FIRST_OBJECT)) return false;
  pFirst = pFirst.substring(PDF_FIRST_OBJECT.length);

  const indexStream = pFirst.indexOf(PDF_STREAM_MARKER);
  const indexMeta = pFirst.indexOf(PDF_FORM_SIGNATURE);
  if (indexStream === -1 || indexMeta === -1 || indexStream < indexMeta) {
    return false;
  }

  let pMeta = pFirst.substring(indexMeta + PDF_FORM_SIGNATURE.length + 3);
  let indexMetaLast = pMeta.indexOf(" ");
  if (indexMetaLast === -1) return false;
  pMeta = pMeta.substring(indexMetaLast + 1);
  indexMetaLast = pMeta.indexOf(" ");
  return indexMetaLast !== -1;
}

export async function sniffPdfFormBlob(file: Blob): Promise<boolean> {
  const head = new Uint8Array(
    await file.slice(0, PDF_FORM_SNIFF_LIMIT).arrayBuffer(),
  );
  return isPdfFormContent(head);
}
