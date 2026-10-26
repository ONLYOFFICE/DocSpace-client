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

import { http } from "msw";
import { strToU8, zipSync } from "fflate";

import { BASE_URL } from "../../e2e/utils";

/**
 * MimeMapping of the templates the mock serves: the server ships new.docx,
 * new.xlsx, new.pptx and new.pdf in common/resources/DocStore/new.
 */
const TEMPLATE_MIME_TYPES: Record<string, string> = {
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".pdf": "application/pdf",
};

/**
 * Mock-only body: a minimal OOXML package or PDF in place of the stored
 * template, enough for a client that checks the file signature.
 */
const templateBytes = (extension: string) =>
  extension === ".pdf"
    ? strToU8("%PDF-1.7\n%%EOF\n")
    : zipSync({
        "[Content_Types].xml": strToU8(
          '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
        ),
      });

/**
 * Mirrors FileHandlerService.EmptyFile (filehandler.ashx?action=empty):
 * for a signed-in user GlobalStore.GetNewDocTemplate(ignoreTemplates: true)
 * picks the default template `new` + the title's extension and streams it as
 * an attachment with its MIME type and length; an extension without a
 * template answers 404.
 * @see server/products/ASC.Files/Core/HttpHandlers/FileHandler.ashx.cs
 */
export const emptyTemplateHandler = (port: string) =>
  http.get(`${BASE_URL}:${port}/filehandler.ashx`, ({ request }) => {
    const query = new URL(request.url).searchParams;
    if (query.get("action")?.toLowerCase() !== "empty") return undefined;

    const title = query.get("title") ?? "";
    const dot = title.lastIndexOf(".");
    const extension = dot >= 0 ? title.slice(dot).toLowerCase() : "";
    const mimeType = TEMPLATE_MIME_TYPES[extension];
    if (!mimeType) return new Response("The required file was not found", { status: 404 });

    const body = templateBytes(extension);
    return new Response(body.slice().buffer, {
      headers: {
        "Content-Disposition": `attachment; filename=new${extension}`,
        "Content-Type": mimeType,
        "Content-Length": String(body.byteLength),
      },
    });
  });
