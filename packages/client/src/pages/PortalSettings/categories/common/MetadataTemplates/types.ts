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

import type { MetadataFieldType } from "@docspace/shared/enums";
import type {
  TMetadataFieldRequest,
  TMetadataTemplate,
} from "@docspace/shared/api/metadata/types";

export type TFieldOptionDraft = {
  id?: string;
  value: string;
};

export type TFieldDraft = {
  key: string;
  id?: number;
  order?: number;
  name: string;
  type: MetadataFieldType;
  options: TFieldOptionDraft[];
};

export type TFieldForm = Omit<TFieldDraft, "type"> & {
  type?: MetadataFieldType;
};

export type TDragState = {
  from: number;
  position: number;
};

export type TDropLine = "before" | "after";

export type TTemplateDraft = {
  name: string;
  visible: boolean;
  fields: TFieldDraft[];
};

export type TTemplateChanges = {
  isTemplateChanged: boolean;
  removed: number[];
  created: TMetadataFieldRequest[];
  updated: { id: number; data: TMetadataFieldRequest }[];
};

export type TTemplateActions = {
  onEdit: (item: TMetadataTemplate) => void;
  onDelete: (item: TMetadataTemplate) => void;
  onToggleVisible: (item: TMetadataTemplate) => void;
};

export type TTemplatesViewProps = TTemplateActions & {
  items: TMetadataTemplate[];
  authors: Record<string, string>;
};

export type TTemplatesListProps = TTemplatesViewProps & {
  sectionWidth: number;
};

export type TTemplateItemProps = TTemplateActions & {
  item: TMetadataTemplate;
  author: string;
};
