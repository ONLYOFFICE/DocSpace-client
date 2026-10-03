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

import type { ConflictResolveType, MetadataFieldType } from "../../enums";

export type TMetadataEntryKind = "file" | "folder";

export type TMetadataFieldOption = {
  id: string;
  value: string;
};

export type TMetadataField = {
  id: number;
  templateId: number;
  name: string;
  type: MetadataFieldType;
  options: TMetadataFieldOption[] | null;
  order: number;
};

export type TMetadataTemplate = {
  id: number;
  name: string;
  visible: boolean;
  isSystem: boolean;
  createBy: string;
  createOn: string;
  modifiedBy: string;
  modifiedOn: string;
  fields: TMetadataField[] | null;
};

export type TMetadataValue = {
  fieldId: number;
  stringValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
  optionIds?: string[] | null;
};

export type TEntryMetadata = {
  template: TMetadataTemplate;
  values: TMetadataValue[] | null;
};

export type TMetadataOperation = {
  id: string;
  progress: number;
  isCompleted: boolean;
  error: string | null;
};

export type TMetadataFieldRequest = {
  name: string;
  type: MetadataFieldType;
  options?: { id?: string; value: string }[];
  order?: number;
};

export type TMetadataTemplateRequest = {
  name: string;
  visible?: boolean;
  fields?: TMetadataFieldRequest[];
};

export type TAssignMetadataTemplatesRequest = {
  templateIds: number[];
  cascade?: boolean;
  conflictResolveType?: ConflictResolveType.Skip | ConflictResolveType.Overwrite;
};

export type TMetadataFieldSuggestion = {
  title: string;
  type: MetadataFieldType;
  options: string[] | null;
  value: string | null;
};
