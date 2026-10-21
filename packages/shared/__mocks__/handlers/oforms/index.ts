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

import { BASE_URL } from "../../e2e/utils";

const CMS_PATH = "oforms-cms/api";

const SEARCH_FILTER = "filters[name_form][$containsi]";
const PURPOSE_FILTER =
  "filters[subcategories][parent_categories][purpose][key][$eq]";
const CATEGORY_FILTER =
  "filters[subcategories][parent_categories][documentId][$in]";

type TLocale = "en" | "de";

type TCategory = {
  documentId: string;
  purpose: "business" | "personal";
  names: Partial<Record<TLocale, string>>;
};

type TTemplate = {
  id: number;
  categoryId: string;
  names: Partial<Record<TLocale, string>>;
};

const PURPOSE_NAMES: Record<string, Record<TLocale, string>> = {
  business: { en: "Business", de: "Unternehmen" },
  personal: { en: "Personal", de: "Privat" },
};

const OFORMS_CATEGORIES: TCategory[] = [
  {
    documentId: "pc-finance",
    purpose: "business",
    names: { en: "Finance", de: "Finanzen" },
  },
  {
    documentId: "pc-hr",
    purpose: "business",
    names: { en: "HR & Employment", de: "Personalwesen" },
  },
  {
    documentId: "pc-real-estate",
    purpose: "business",
    names: { en: "Real Estate" },
  },
  {
    documentId: "pc-everyday",
    purpose: "personal",
    names: { en: "Everyday Life", de: "Alltag" },
  },
];

const OFORMS_TEMPLATES: TTemplate[] = [
  {
    id: 1,
    categoryId: "pc-finance",
    names: { en: "Invoice", de: "Rechnung" },
  },
  {
    id: 2,
    categoryId: "pc-hr",
    names: { en: "Job offer", de: "Arbeitsangebot" },
  },
  { id: 3, categoryId: "pc-real-estate", names: { en: "Lease agreement" } },
  {
    id: 4,
    categoryId: "pc-everyday",
    names: { en: "Grocery list", de: "Einkaufsliste" },
  },
];

const cmsUrl = (port: string, path: string) =>
  `${BASE_URL}:${port}/${CMS_PATH}/${path}`;

export const oformsFormGallerySettings = (port: string) => ({
  formGallery: {
    url: "",
    ext: ".docx",
    uploadUrl: "",
    uploadExt: ".docx",
    domain: `${BASE_URL}:${port}`,
    path: `/${CMS_PATH}/oforms`,
    uploadDomain: "",
    uploadPath: "",
  },
});

const toLocale = (value: string | null): TLocale =>
  value === "de" ? "de" : "en";

const categoriesOf = (locale: TLocale, purpose: string) =>
  OFORMS_CATEGORIES.filter(
    (category) => category.purpose === purpose && category.names[locale],
  ).map((category, index) => ({
    id: index + 1,
    documentId: category.documentId,
    name: category.names[locale],
    urlReq: category.documentId,
    subcategories: [
      {
        id: index + 101,
        documentId: `${category.documentId}-sub`,
        name: category.names[locale],
        urlReq: `${category.documentId}-sub`,
        oforms: { count: 1 },
      },
    ],
  }));

const purposesResponse = (locale: TLocale) => ({
  data: Object.entries(PURPOSE_NAMES).map(([key, names], index) => ({
    id: index + 1,
    documentId: `purpose-${key}`,
    key,
    name: names[locale],
    parent_categories: categoriesOf(locale, key),
  })),
});

const templatesResponse = (params: URLSearchParams) => {
  const locale = toLocale(params.get("locale"));
  const search = (params.get(SEARCH_FILTER) ?? "").toLowerCase();
  const purpose = params.get(PURPOSE_FILTER) ?? "";
  const categoryIds = Array.from(params.entries())
    .filter(([key]) => key.startsWith(CATEGORY_FILTER))
    .map(([, value]) => value);

  const purposeOf = (categoryId: string) =>
    OFORMS_CATEGORIES.find(({ documentId }) => documentId === categoryId)
      ?.purpose;

  const data = OFORMS_TEMPLATES.filter(({ names }) => names[locale])
    .filter(({ categoryId }) => !purpose || purposeOf(categoryId) === purpose)
    .filter(
      ({ categoryId }) =>
        !categoryIds.length || categoryIds.includes(categoryId),
    )
    .filter(({ names }) => names[locale]!.toLowerCase().includes(search))
    .map(({ id, names }) => ({
      id,
      documentId: `template-${id}`,
      name_form: names[locale],
      updatedAt: "2026-10-01T10:00:00.000Z",
      description_card: "",
      template_desc: "",
      url: `template-${id}`,
      card_prewiew: null,
      file_oform: [],
    }));

  return {
    data,
    meta: {
      pagination: {
        page: 1,
        pageSize: 150,
        pageCount: 1,
        total: data.length,
      },
    },
  };
};

const json = (body: unknown) => new Response(JSON.stringify(body));

export const oformsHandlers = (port: string) => [
  http.get(cmsUrl(port, "i18n/locales"), () =>
    json([{ code: "en" }, { code: "de" }]),
  ),
  http.get(cmsUrl(port, "purposes"), ({ request }) =>
    json(
      purposesResponse(toLocale(new URL(request.url).searchParams.get("locale"))),
    ),
  ),
  http.get(cmsUrl(port, "oforms"), ({ request }) =>
    json(templatesResponse(new URL(request.url).searchParams)),
  ),
];
