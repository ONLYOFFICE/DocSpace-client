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

import { combineUrl } from "../../utils/combineUrl";

export type TEmptyTemplateExtension = "docx" | "xlsx" | "pptx" | "pdf";

export const EMPTY_TEMPLATE_EXTENSIONS: TEmptyTemplateExtension[] = [
  "docx",
  "xlsx",
  "pptx",
  "pdf",
];

const EMPTY_FILE_HANDLER_PATH = "/filehandler.ashx";

const OOXML_MAGIC = [0x50, 0x4b, 0x03, 0x04];
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46];

export class TemplateFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateFetchError";
  }
}

export type GetEmptyTemplateOptions = {
  extension: TEmptyTemplateExtension;
  signal?: AbortSignal;
};

const templateCache = new Map<TEmptyTemplateExtension, ArrayBuffer>();

export function clearEmptyTemplateCache(): void {
  templateCache.clear();
}

function hasMagicBytes(bytes: Uint8Array, magic: number[]): boolean {
  if (bytes.byteLength < magic.length) return false;
  return magic.every((byte, i) => bytes[i] === byte);
}

export function isValidTemplateContent(
  data: ArrayBuffer,
  extension: TEmptyTemplateExtension,
): boolean {
  if (data.byteLength === 0) return false;
  const bytes = new Uint8Array(data);
  return extension === "pdf"
    ? hasMagicBytes(bytes, PDF_MAGIC)
    : hasMagicBytes(bytes, OOXML_MAGIC);
}

function buildTemplateUrl(extension: TEmptyTemplateExtension) {
  const proxyUrl =
    typeof window !== "undefined" ? window.ClientConfig?.proxy?.url : "";
  return combineUrl(
    proxyUrl ?? "",
    `${EMPTY_FILE_HANDLER_PATH}?action=empty&title=.${extension}`,
  );
}

export async function getEmptyTemplateBytes(
  options: GetEmptyTemplateOptions,
): Promise<ArrayBuffer> {
  const { extension, signal } = options;

  if (!EMPTY_TEMPLATE_EXTENSIONS.includes(extension)) {
    throw new TemplateFetchError(`Unsupported extension: ${extension}`);
  }

  const cached = templateCache.get(extension);
  if (cached) return cached.slice(0);

  const response = await fetch(buildTemplateUrl(extension), { signal });
  if (!response.ok) {
    throw new TemplateFetchError(
      `Empty template for "${extension}" is not available on the server (HTTP ${response.status})`,
    );
  }

  const data = await response.arrayBuffer();

  if (!isValidTemplateContent(data, extension)) {
    throw new TemplateFetchError(
      `Empty template response for "${extension}" is not a valid document`,
    );
  }

  templateCache.set(extension, data);
  return data.slice(0);
}
