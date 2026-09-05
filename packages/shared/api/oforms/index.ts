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

import axios from "axios";

import type OformsFilter from "./filter";
import type {
  TOformCategory,
  TOformFile,
  TOformParentCategory,
  TOformPreview,
  TOformPurpose,
  TOformRawCategory,
  TOformRawLocale,
  TOformRawMedia,
  TOformRawParentCategory,
  TOformRawPurposesResponse,
  TOformRawTemplate,
  TOformSource,
  TOformsList,
  TOformsPagination,
  TOformsRawListResponse,
} from "./types";

/**
 * The fields a gallery card and its info panel need. Everything the CMS keeps
 * per template besides these (SEO texts, page screenshots, countries) stays
 * out of the response.
 */
const TEMPLATE_FIELDS = [
  "fields[0]=name_form",
  "fields[1]=updatedAt",
  "fields[2]=description_card",
  "fields[3]=template_desc",
  "fields[4]=url",
  "populate[card_prewiew][fields][0]=url",
  "populate[card_prewiew][fields][1]=width",
  "populate[card_prewiew][fields][2]=height",
  "populate[file_oform][fields][0]=url",
  "populate[file_oform][fields][1]=name",
  "populate[file_oform][fields][2]=ext",
  "populate[file_oform][fields][3]=size",
].join("&");

const SUBCATEGORIES = "populate[parent_categories][populate][subcategories]";

/**
 * The taxonomy comes down as one tree: purpose -> parent category -> leaf,
 * every leaf carrying the number of templates of the requested extension it
 * holds (the CMS keeps leaves that hold none).
 */
const purposeQuery = (locale: string, extension: string) =>
  [
    "fields[0]=name",
    "fields[1]=key",
    "populate[parent_categories][fields][0]=name",
    "populate[parent_categories][fields][1]=urlReq",
    `${SUBCATEGORIES}[fields][0]=name`,
    `${SUBCATEGORIES}[fields][1]=urlReq`,
    `${SUBCATEGORIES}[populate][oforms][count]=true`,
    extension
      ? `${SUBCATEGORIES}[populate][oforms][filters][form_exts][ext][$eq]=${extension}`
      : "",
    `locale=${locale}`,
  ]
    .filter(Boolean)
    .join("&");

const EMPTY_PAGINATION: TOformsPagination = {
  page: 1,
  pageSize: 0,
  pageCount: 0,
  total: 0,
};

/**
 * Media urls are absolute on the CMS that serves the catalog today, but the
 * CMS may also answer with a root-relative one — resolve it against the host
 * the response came from rather than against the portal.
 */
const toAbsoluteUrl = (url: string | null | undefined, baseUrl: string) => {
  if (!url) return "";

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
};

const normalizePreview = (
  media: TOformRawMedia | null | undefined,
  baseUrl: string,
): TOformPreview | null => {
  const url = toAbsoluteUrl(media?.url, baseUrl);
  if (!url) return null;

  return {
    url,
    width: media?.width ?? 0,
    height: media?.height ?? 0,
  };
};

const normalizeSource = (
  files: TOformRawMedia[] | null | undefined,
  baseUrl: string,
): TOformSource | null => {
  const [media] = files ?? [];
  if (!media) return null;

  return {
    url: toAbsoluteUrl(media.url, baseUrl),
    name: media.name ?? "",
    ext: media.ext ?? "",
    size: media.size ?? 0,
  };
};

const normalizeTemplate = (
  template: TOformRawTemplate,
  baseUrl: string,
): TOformFile => ({
  id: template.id,
  documentId: template.documentId,
  title: template.name_form ?? "",
  slug: template.url ?? "",
  // `template_desc` is the long text of the template page; the card
  // description is the one every template has.
  description: template.template_desc || template.description_card || "",
  updatedAt: template.updatedAt ?? "",
  preview: normalizePreview(template.card_prewiew, baseUrl),
  file: normalizeSource(template.file_oform, baseUrl),
});

const normalizeCategory = (category: TOformRawCategory): TOformCategory => ({
  id: category.id,
  documentId: category.documentId,
  name: category.name ?? "",
  slug: category.urlReq ?? "",
  templatesCount: category.oforms?.count ?? 0,
});

const normalizeParentCategory = (
  category: TOformRawParentCategory,
): TOformParentCategory => ({
  ...normalizeCategory(category),
  subcategories: (category.subcategories ?? []).map(normalizeCategory),
});

export const getOforms = async (
  url: string,
  filter: OformsFilter,
): Promise<TOformsList> => {
  const res = await axios.get<TOformsRawListResponse>(
    `${url}?${TEMPLATE_FIELDS}&${filter.toApiUrlParams()}`,
  );

  const templates = (res?.data?.data ?? []).map((template) =>
    normalizeTemplate(template, url),
  );

  return {
    templates,
    pagination: res?.data?.meta?.pagination ?? {
      ...EMPTY_PAGINATION,
      total: templates.length,
    },
  };
};

export const getOformLocales = async (url: string): Promise<string[]> => {
  const res = await axios.get<TOformRawLocale[]>(url);

  return (res?.data ?? []).map((locale) => locale.code).filter(Boolean);
};

export const getOformPurposes = async (
  url: string,
  locale: string,
  extension: string,
): Promise<TOformPurpose[]> => {
  const res = await axios.get<TOformRawPurposesResponse>(
    `${url}?${purposeQuery(locale, extension)}`,
  );

  return (res?.data?.data ?? []).map((purpose) => ({
    id: purpose.id,
    documentId: purpose.documentId,
    key: purpose.key ?? "",
    name: purpose.name ?? "",
    parentCategories: (purpose.parent_categories ?? []).map(
      normalizeParentCategory,
    ),
  }));
};

export function submitToGallery(
  url: string,
  file: File,
  formName: string,
  language: string,
  signal: AbortSignal | null,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("formName", formName);
  formData.append("language", language);

  return axios.post(url, formData, { signal: signal ?? undefined });
}
