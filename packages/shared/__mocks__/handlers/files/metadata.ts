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

import { http, HttpResponse } from "msw";
import { BASE_URL, API_PREFIX } from "../../e2e/utils";
import { myDocumentsResolver } from "./documents";

export const PATH_ENTRY_METADATA = "files/metadata/:kind/:id";
export const PATH_METADATA_TEMPLATES = "files/metadata/templates";

export const METADATA_FIELD = {
  counterparty: 11,
  amount: 12,
  status: 13,
} as const;

export const METADATA_OPTION = {
  draft: "a0000000-0000-0000-0000-000000000001",
  signed: "a0000000-0000-0000-0000-000000000002",
} as const;

type TMockField = {
  id: number;
  name: string;
  type: number;
  order: number;
  options?: { id: string; value: string }[];
};

const CONTRACT_FIELDS: TMockField[] = [
  { id: METADATA_FIELD.counterparty, name: "Counterparty", type: 0, order: 0 },
  { id: METADATA_FIELD.amount, name: "Amount", type: 2, order: 1 },
  {
    id: METADATA_FIELD.status,
    name: "Status",
    type: 3,
    order: 2,
    options: [
      { id: METADATA_OPTION.draft, value: "Draft" },
      { id: METADATA_OPTION.signed, value: "Signed" },
    ],
  },
];

const AUTHOR = {
  id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  displayName: "Administrator",
  avatarSmall: "",
  profileUrl: "",
  hasAvatar: false,
  isAnonim: false,
};

const MODIFIED_ON = "2026-10-01T10:00:00.0000000+00:00";

const template = (
  id: number,
  name: string,
  fields: TMockField[],
  visible = true,
) => ({
  id,
  name,
  visible,
  createBy: AUTHOR,
  createOn: MODIFIED_ON,
  modifiedBy: AUTHOR,
  modifiedOn: MODIFIED_ON,
  fields: fields.map((field) => ({ ...field, templateId: id })),
});

export const METADATA_TEMPLATES = [
  template(1, "Contract", CONTRACT_FIELDS),
  template(2, "Invoice", [
    { id: 21, name: "Invoice number", type: 0, order: 0 },
    { id: 22, name: "Due date", type: 1, order: 1 },
  ]),
  template(
    3,
    "Internal review",
    [{ id: 31, name: "Reviewer", type: 0, order: 0 }],
    false,
  ),
];

export const ENTRY_METADATA = {
  templates: [
    {
      id: 1,
      name: "Contract",
      visible: true,
      cascade: false,
      fields: CONTRACT_FIELDS,
    },
  ],
  customFields: [{ name: "Project", value: "Apollo" }],
};

export const EMPTY_ENTRY_METADATA = { templates: [], customFields: [] };

const METADATA_OPERATION_IDLE = {
  progress: 0,
  isCompleted: true,
  templateIds: [],
};

const envelope = (response: unknown) =>
  HttpResponse.json({ response, count: 1, status: 0, statusCode: 200 });

const readBody = async (request: Request) =>
  (await request.json()) as Record<string, unknown>;

export const entryMetadataHandler = (
  port: string,
  metadata: unknown = ENTRY_METADATA,
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/${PATH_ENTRY_METADATA}`, () =>
    envelope(metadata),
  );

export const entryMetadataSaveHandlers = (
  port: string,
  metadata: typeof ENTRY_METADATA = ENTRY_METADATA,
) => [
  http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ENTRY_METADATA}/values`,
    () => envelope(metadata),
  ),
  http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ENTRY_METADATA}/customFields`,
    () => envelope(metadata.customFields),
  ),
];

export const entryTemplateHandlers = (port: string) => [
  http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ENTRY_METADATA}/templates`,
    () => envelope(null),
  ),
  http.delete(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ENTRY_METADATA}/templates/:templateId`,
    () => envelope(null),
  ),
];

export const metadataCascadeHandlers = (
  port: string,
  {
    launched = METADATA_OPERATION_IDLE,
    progress = METADATA_OPERATION_IDLE,
  }: { launched?: unknown; progress?: unknown } = {},
) => [
  http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ENTRY_METADATA}/templates/:templateId`,
    () => envelope(launched),
  ),
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ENTRY_METADATA}/templates/progress`,
    () => envelope(progress),
  ),
];

export const myDocumentsMetadataFilterHandler = (port: string) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/12764`,
    async ({ request }) => {
      const list = await myDocumentsResolver(true).json();

      if (!new URL(request.url).searchParams.has("metadataTemplateId")) {
        return HttpResponse.json(list);
      }

      return HttpResponse.json({
        ...list,
        response: {
          ...list.response,
          files: [],
          folders: [],
          total: 0,
          count: 0,
        },
      });
    },
  );

export const metadataTemplatesHandlers = (
  port: string,
  templates: typeof METADATA_TEMPLATES = METADATA_TEMPLATES,
) => {
  const url = `${BASE_URL}:${port}/${API_PREFIX}/${PATH_METADATA_TEMPLATES}`;

  return [
    http.get(url, ({ request }) => {
      const visible = new URL(request.url).searchParams.get("visible");

      return envelope(
        visible === "true" ? templates.filter((item) => item.visible) : templates,
      );
    }),
    http.post(url, async ({ request }) =>
      envelope({ ...(await readBody(request)), id: 100 }),
    ),
    http.put(`${url}/:templateId`, async ({ params, request }) =>
      envelope({
        ...templates.find(({ id }) => id === Number(params.templateId)),
        ...(await readBody(request)),
      }),
    ),
    http.delete(`${url}/:templateId`, () => envelope(null)),
    http.post(`${url}/:templateId/fields`, async ({ request }) =>
      envelope(await readBody(request)),
    ),
    http.put(`${url}/:templateId/fields/:fieldId`, async ({ request }) =>
      envelope(await readBody(request)),
    ),
    http.delete(`${url}/:templateId/fields/:fieldId`, () => envelope(null)),
  ];
};
