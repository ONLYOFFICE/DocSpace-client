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

import { http, HttpResponse, type JsonBodyType } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import {
  ENTRY_METADATA,
  METADATA_FIELD,
  METADATA_OPTION,
} from "../files/metadata";

const SOURCES = [
  { id: "10", title: "ONLYOFFICE Document Sample.docx", truncated: false },
];

export const META_FILL_RESULT = {
  metadata: ENTRY_METADATA,
  filled: [
    {
      fieldId: METADATA_FIELD.counterparty,
      name: "Counterparty",
      value: { stringValue: "Northwind Traders" },
    },
    {
      fieldId: METADATA_FIELD.amount,
      name: "Amount",
      value: { numberValue: 12500 },
    },
    {
      fieldId: METADATA_FIELD.status,
      name: "Status",
      value: { optionIds: [METADATA_OPTION.signed] },
    },
    { name: "Project", value: "Apollo Phase 2" },
  ],
  unresolved: [],
  sources: SOURCES,
  skipped: [],
  dryRun: true,
};

export const META_GENERATE_RESULT = {
  fields: [
    { name: "Department", value: "Legal" },
    { name: "Region", value: "EMEA" },
    { name: "Project", value: "Apollo Phase 2" },
  ],
  sources: SOURCES,
  skipped: [],
};

export const META_SERVICE_LIMIT_ERROR = {
  error: "The model request failed",
  code: "auth",
  providerMessage:
    "403 Service limit exceeded: Service limit exceeded for customer No.10000001. " +
    "Service group 'ai-services', amount limit 1.2000000000, available -0.1026610350 until 2026-10-23 23:59:59Z",
};

type MetaOptions = {
  status?: number;
  result?: JsonBodyType;
  /** The body of a failed answer, when `status` is set. */
  error?: JsonBodyType;
};

const metaHandler = (
  port: string,
  route: "fill" | "generate",
  result: JsonBodyType,
  status?: number,
  error: JsonBodyType = { error: "Mocked failure" },
) =>
  http.post(`${BASE_URL}:${port}/${API_PREFIX}/ai/meta/${route}`, () =>
    status
      ? HttpResponse.json(error, { status })
      : HttpResponse.json(result),
  );

export const aiMetaFillHandler = (
  port: string,
  { status, result = META_FILL_RESULT, error }: MetaOptions = {},
) => metaHandler(port, "fill", result, status, error);

export const aiMetaGenerateHandler = (
  port: string,
  { status, result = META_GENERATE_RESULT, error }: MetaOptions = {},
) => metaHandler(port, "generate", result, status, error);
