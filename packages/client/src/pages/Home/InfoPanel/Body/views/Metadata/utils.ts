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

import type { TOption } from "@onlyoffice/apps-ui-kit/components/combobox";
import { MetadataFieldType } from "@docspace/shared/enums";
import type {
  TCustomField,
  TCustomFieldRequest,
  TEntryMetadata,
  TEntryMetadataField,
  TEntryMetadataTemplate,
  TMetadataEntryKind,
  TMetadataFieldOption,
  TMetadataTemplate,
  TMetadataValueRequest,
} from "@docspace/shared/api/metadata/types";
import {
  getMetadataDate,
  getMetadataInput,
  isMetadataNumber,
  METADATA_CUSTOM_FIELDS_MAX,
  toMetadataValue,
  type TMetadataInput,
} from "@docspace/shared/utils/metadata";
import { isFile, isRoom } from "@docspace/shared/utils/typeGuards";

import type {
  TCustomFieldDraft,
  TMetadataItemType,
  TMetadataSelection,
  TTemplateForm,
} from "./types";

export const getEntryKind = (item: TMetadataSelection): TMetadataEntryKind =>
  isFile(item) ? "file" : "folder";

export const getMetadataItemType = (
  item: TMetadataSelection,
): TMetadataItemType => {
  if (isFile(item)) return "file";

  return isRoom(item) ? "room" : "folder";
};

export const canEditMetadata = (item: TMetadataSelection) => {
  if (isRoom(item)) return !!item.security?.EditRoom;
  if (isFile(item)) return !!item.security?.Edit;

  return !!item.security?.Create;
};

export const isEmptyMetadata = ({ templates, customFields }: TEntryMetadata) =>
  !templates.length && !customFields.length;

export const canAddCustomField = (count: number) =>
  count < METADATA_CUSTOM_FIELDS_MAX;

export const sortTemplates = (templates: TEntryMetadataTemplate[]) =>
  [...templates].sort((a, b) => a.name.localeCompare(b.name));

export const getUnassignedTemplates = (
  templates: TMetadataTemplate[],
  assigned: TEntryMetadataTemplate[],
) => {
  const assignedIds = new Set(assigned.map((template) => template.id));

  return templates.filter((template) => !assignedIds.has(template.id));
};

export const filterTemplatesByName = (
  templates: TMetadataTemplate[],
  search: string,
) => {
  const query = search.trim().toLowerCase();

  return query
    ? templates.filter((template) =>
        template.name.toLowerCase().includes(query),
      )
    : templates;
};

export const toEntryTemplate = ({
  id,
  name,
  visible,
  fields = [],
}: TMetadataTemplate): TEntryMetadataTemplate => ({
  id,
  name,
  visible,
  fields,
});

export const toComboOptions = (options: TMetadataFieldOption[]): TOption[] =>
  options.map(({ id, value }) => ({ key: id, label: value }));

export const getSelectedOptions = (
  options: TMetadataFieldOption[] = [],
  optionIds: string[] = [],
) => options.filter((option) => optionIds.includes(option.id));

export const toggleOption = (optionIds: string[], optionId: string) =>
  optionIds.includes(optionId)
    ? optionIds.filter((id) => id !== optionId)
    : [...optionIds, optionId];

export const isValidNumberInput = (input: string) =>
  !input.trim() || isMetadataNumber(input.trim());

const normalizeInput = (input: TMetadataInput) =>
  Array.isArray(input) ? [...input].sort() : input.trim();

export const isSameInput = (a: TMetadataInput, b: TMetadataInput) =>
  JSON.stringify(normalizeInput(a)) === JSON.stringify(normalizeInput(b));

export const createTemplateForm = (
  template: TEntryMetadataTemplate,
): TTemplateForm => ({
  template,
  inputs: Object.fromEntries(
    template.fields.map((field) => [field.id, getMetadataInput(field)]),
  ),
});

export const getChangedValues = ({
  template,
  inputs,
}: TTemplateForm): TMetadataValueRequest[] =>
  template.fields
    .filter((field) => !isSameInput(getMetadataInput(field), inputs[field.id]))
    .map((field) => toMetadataValue(field, inputs[field.id]));

export const isValidFieldInput = (
  { type }: Pick<TEntryMetadataField, "type">,
  input: TMetadataInput,
) =>
  type !== MetadataFieldType.Number ||
  (typeof input === "string" && isValidNumberInput(input));

export const isTemplateFormValid = ({ template, inputs }: TTemplateForm) =>
  template.fields.every((field) => isValidFieldInput(field, inputs[field.id]));

export const formatMetadataValue = (
  { type, value, options }: TEntryMetadataField,
  locale: string,
) => {
  if (!value) return "";

  switch (type) {
    case MetadataFieldType.Number:
      return value.numberValue?.toLocaleString(locale) ?? "";
    case MetadataFieldType.Date: {
      const date = getMetadataDate(value.dateValue);

      return date
        ? DateTime.fromISO(date)
            .setLocale(locale)
            .toLocaleString(DateTime.DATE_MED)
        : "";
    }
    case MetadataFieldType.SingleChoice:
    case MetadataFieldType.MultiChoice:
      return getSelectedOptions(options, value.optionIds)
        .map((option) => option.value)
        .join(", ");
    default:
      return value.stringValue ?? "";
  }
};

export const toCustomFieldDrafts = (
  fields: TCustomField[],
): TCustomFieldDraft[] =>
  fields.map(({ name, value }) => ({ key: name, name, value, isNew: false }));

export const createCustomFieldDraft = (key: string): TCustomFieldDraft => ({
  key,
  name: "",
  value: "",
  isNew: true,
});

const normalizeName = (name: string) => name.trim().toLowerCase();

export const isCustomFieldNameTaken = (
  draft: TCustomFieldDraft,
  fields: TCustomField[],
  drafts: TCustomFieldDraft[],
) => {
  const name = normalizeName(draft.name);
  const newDrafts = drafts.filter(
    (item) => item.isNew && item.key !== draft.key,
  );

  return (
    !!name &&
    [...fields, ...newDrafts].some((item) => normalizeName(item.name) === name)
  );
};

export const isValidCustomFieldDraft = (
  draft: TCustomFieldDraft,
  fields: TCustomField[],
  drafts: TCustomFieldDraft[],
) =>
  !draft.isNew ||
  (!!draft.name.trim() &&
    !!draft.value.trim() &&
    !isCustomFieldNameTaken(draft, fields, drafts));

export const getCustomFieldChanges = (
  fields: TCustomField[],
  drafts: TCustomFieldDraft[],
): TCustomFieldRequest[] => {
  const kept = new Map(
    drafts
      .filter((draft) => !draft.isNew)
      .map((draft): [string, string] => [draft.name, draft.value]),
  );

  return [
    ...fields
      .filter(({ name, value }) => kept.get(name) !== value)
      .map(({ name }) => ({ name, value: kept.get(name) || null })),
    ...drafts
      .filter((draft) => draft.isNew)
      .map(({ name, value }) => ({ name: name.trim(), value })),
  ];
};
