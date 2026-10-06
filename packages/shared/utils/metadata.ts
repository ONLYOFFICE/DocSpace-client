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

import { DateTime } from "luxon";

import { FolderType, MetadataFieldType } from "../enums";
import type {
  TEntryMetadataField,
  TMetadataValueRequest,
} from "../api/metadata/types";

export type TMetadataInput = string | string[];

export const METADATA_NAME_MAX_LENGTH = 255;
export const METADATA_VALUE_MAX_LENGTH = 8000;
export const METADATA_CUSTOM_FIELDS_MAX = 50;

const UNSUPPORTED_ROOT_TYPES: (FolderType | undefined)[] = [
  FolderType.TRASH,
  FolderType.Privacy,
  FolderType.AIAgents,
];

export const isMetadataSupported = ({
  id,
  providerKey,
  rootFolderType,
}: {
  id?: number | string;
  providerKey?: string | null;
  rootFolderType?: FolderType;
}) =>
  typeof id === "number" &&
  !providerKey &&
  !UNSUPPORTED_ROOT_TYPES.includes(rootFolderType);

export const getMetadataDate = (value?: string) =>
  value ? (DateTime.fromISO(value, { zone: "utc" }).toISODate() ?? "") : "";

export const isMetadataNumber = (input: string) =>
  /^-?\d+$/.test(input) && Number.isSafeInteger(Number(input));

export const getMetadataInput = ({
  type,
  value,
}: Pick<TEntryMetadataField, "type" | "value">): TMetadataInput => {
  switch (type) {
    case MetadataFieldType.SingleChoice:
    case MetadataFieldType.MultiChoice:
      return value?.optionIds ?? [];
    case MetadataFieldType.Number:
      return value?.numberValue?.toString() ?? "";
    case MetadataFieldType.Date:
      return getMetadataDate(value?.dateValue);
    default:
      return value?.stringValue ?? "";
  }
};

export const toMetadataValue = (
  { id: fieldId, type }: Pick<TEntryMetadataField, "id" | "type">,
  input: TMetadataInput,
): TMetadataValueRequest => {
  if (Array.isArray(input)) return { fieldId, optionIds: input };
  if (!input.trim()) return { fieldId };

  switch (type) {
    case MetadataFieldType.Number:
      return { fieldId, numberValue: Number(input) };
    case MetadataFieldType.Date:
      return { fieldId, dateValue: `${input}T00:00:00.000Z` };
    default:
      return { fieldId, stringValue: input };
  }
};
