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

/**
 * Types of the ONLYOFFICE template gallery (oforms) CMS.
 *
 * The CMS is Strapi v5: entities are flat (no `attributes` envelope), carry
 * both a numeric `id` and a string `documentId`, and relations are plain
 * arrays. The `TOformRaw*` types describe what the API answers with; the
 * client never passes them further than the normalizers in `./index.ts`,
 * which map them to the `TOform*` model the gallery is built on.
 */

/** A media entry (image or template file) as the gallery requests it. */
export type TOformRawMedia = {
  id: number;
  documentId: string;
  url?: string | null;
  name?: string | null;
  ext?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
};

/** A template entity of the `/oforms` collection. */
export type TOformRawTemplate = {
  id: number;
  documentId: string;
  name_form?: string | null;
  description_card?: string | null;
  template_desc?: string | null;
  url?: string | null;
  updatedAt?: string | null;
  card_prewiew?: TOformRawMedia | null;
  file_oform?: TOformRawMedia[] | null;
};

/** Pagination block of a list response (`meta.pagination`). */
export type TOformsPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

/** Body of the templates list response. */
export type TOformsRawListResponse = {
  data?: TOformRawTemplate[] | null;
  meta?: {
    pagination?: TOformsPagination;
  } | null;
};

/** A taxonomy entity: a subcategory, or a parent category without children. */
export type TOformRawCategory = {
  id: number;
  documentId: string;
  name?: string | null;
  urlReq?: string | null;
  /** How many templates of the requested type the category holds. */
  oforms?: { count?: number | null } | null;
};

/** A parent category with the subcategories it groups. */
export type TOformRawParentCategory = TOformRawCategory & {
  subcategories?: TOformRawCategory[] | null;
};

/** The top level of the taxonomy: Business or Personal. */
export type TOformRawPurpose = {
  id: number;
  documentId: string;
  key?: string | null;
  name?: string | null;
  parent_categories?: TOformRawParentCategory[] | null;
};

/** Body of the `/purposes` response. */
export type TOformRawPurposesResponse = {
  data?: TOformRawPurpose[] | null;
};

/** One entry of the `/i18n/locales` response. */
export type TOformRawLocale = {
  code: string;
};

/** The card image of a template, with the dimensions the tile lays out by. */
export type TOformPreview = {
  url: string;
  width: number;
  height: number;
};

/** The downloadable template file behind a gallery card. */
export type TOformSource = {
  url: string;
  name: string;
  /** Extension with the leading dot, as the CMS stores it (`.docx`). */
  ext: string;
  /** Size in kilobytes, as the CMS stores it. */
  size: number;
};

/**
 * A gallery template in client terms. Field names of the CMS stop here: every
 * consumer (tiles, info panel, create-file flow) reads this shape.
 */
export type TOformFile = {
  /** Numeric CMS id. Travels to the backend as `formId`. */
  id: number;
  documentId: string;
  title: string;
  /** Slug of the template page on the templates site. */
  slug: string;
  description: string;
  updatedAt: string;
  preview: TOformPreview | null;
  file: TOformSource | null;
};

/** A normalized templates list with its pagination. */
export type TOformsList = {
  templates: TOformFile[];
  pagination: TOformsPagination;
};

/** A leaf of the taxonomy the category filter selects by. */
export type TOformCategory = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  /**
   * Templates of the currently filtered extension behind this category. The
   * CMS keeps categories that hold nothing at all, and the gallery has no use
   * for a filter that can only end in an empty screen.
   */
  templatesCount: number;
};

/** A category group: one first-level item of the category filter. */
export type TOformParentCategory = TOformCategory & {
  subcategories: TOformCategory[];
};

/** Business or Personal, with the category tree it owns. */
export type TOformPurpose = {
  id: number;
  documentId: string;
  /** Machine key (`business` / `personal`), used as the filter value. */
  key: string;
  name: string;
  parentCategories: TOformParentCategory[];
};
