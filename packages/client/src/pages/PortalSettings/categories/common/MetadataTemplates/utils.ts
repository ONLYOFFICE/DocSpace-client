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

import { MetadataFieldType } from "@docspace/shared/enums";
import type {
  TMetadataField,
  TMetadataFieldRequest,
  TMetadataTemplate,
} from "@docspace/shared/api/metadata/types";
import type { TTranslation } from "@docspace/shared/types";

import type {
  TFieldDraft,
  TFieldForm,
  TTemplateChanges,
  TTemplateDraft,
} from "./types";

export const isChoiceType = (type?: MetadataFieldType) =>
  type === MetadataFieldType.SingleChoice ||
  type === MetadataFieldType.MultiChoice;

export const getFieldTypeLabel = (t: TTranslation, type: MetadataFieldType) => {
  switch (type) {
    case MetadataFieldType.Number:
      return t("Metadata:FieldTypeNumber");
    case MetadataFieldType.Date:
      return t("Common:Date");
    case MetadataFieldType.SingleChoice:
      return t("Metadata:FieldTypeSingleChoice");
    case MetadataFieldType.MultiChoice:
      return t("Metadata:FieldTypeMultiChoice");
    default:
      return t("Metadata:FieldTypeText");
  }
};

export const moveItem = <T>(items: T[], from: number, to: number): T[] => {
  if (from === to || to < 0 || to >= items.length) return items;

  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);

  return next;
};

export const toFieldDrafts = (fields: TMetadataField[] = []): TFieldDraft[] =>
  [...fields]
    .sort((a, b) => a.order - b.order)
    .map((field) => ({
      key: `field-${field.id}`,
      id: field.id,
      order: field.order,
      name: field.name,
      type: field.type,
      options: field.options?.map(({ id, value }) => ({ id, value })) ?? [],
    }));

export const toTemplateDraft = (
  template: TMetadataTemplate | null,
): TTemplateDraft => ({
  name: template?.name ?? "",
  visible: template?.visible ?? true,
  fields: toFieldDrafts(template?.fields),
});

export const createFieldForm = (key: string): TFieldForm => ({
  key,
  name: "",
  options: [],
});

export const setFieldType = (
  form: TFieldForm,
  type: MetadataFieldType,
): TFieldForm => ({
  ...form,
  type,
  options:
    isChoiceType(type) && !form.options.length ? [{ value: "" }] : form.options,
});

export const addOption = (form: TFieldForm): TFieldForm => ({
  ...form,
  options: [...form.options, { value: "" }],
});

export const setOptionValue = (
  form: TFieldForm,
  index: number,
  value: string,
): TFieldForm => ({
  ...form,
  options: form.options.map((option, i) =>
    i === index ? { ...option, value } : option,
  ),
});

export const removeOption = (form: TFieldForm, index: number): TFieldForm => ({
  ...form,
  options: form.options.filter((_, i) => i !== index),
});

export const isValidField = (form: TFieldForm): form is TFieldDraft => {
  if (!form.name.trim() || form.type === undefined) return false;
  if (!isChoiceType(form.type)) return true;

  const values = form.options
    .map((option) => option.value.trim().toLowerCase())
    .filter(Boolean);

  return values.length > 0 && new Set(values).size === values.length;
};

export const upsertField = (fields: TFieldDraft[], field: TFieldDraft) =>
  fields.some((item) => item.key === field.key)
    ? fields.map((item) => (item.key === field.key ? field : item))
    : [...fields, field];

export const toFieldRequest = (
  field: TFieldDraft,
  order: number,
): TMetadataFieldRequest => ({
  name: field.name.trim(),
  type: field.type,
  options: isChoiceType(field.type)
    ? field.options
        .filter((option) => option.value.trim())
        .map((option) => ({ id: option.id, value: option.value.trim() }))
    : [],
  order,
});

const isSameField = (before: TFieldDraft, after: TMetadataFieldRequest) =>
  JSON.stringify(toFieldRequest(before, before.order ?? -1)) ===
  JSON.stringify(after);

export const getTemplateChanges = (
  template: TMetadataTemplate,
  draft: TTemplateDraft,
): TTemplateChanges => {
  const original = toFieldDrafts(template.fields);
  const keptIds = new Set(draft.fields.map((field) => field.id));

  const changes: TTemplateChanges = {
    isTemplateChanged:
      draft.name.trim() !== template.name ||
      draft.visible !== template.visible,
    removed: original.flatMap((field) =>
      field.id !== undefined && !keptIds.has(field.id) ? [field.id] : [],
    ),
    created: [],
    updated: [],
  };

  draft.fields.forEach((field, index) => {
    const data = toFieldRequest(field, index);
    const before = original.find((item) => item.id === field.id);

    if (field.id === undefined) changes.created.push(data);
    else if (!before || !isSameField(before, data))
      changes.updated.push({ id: field.id, data });
  });

  return changes;
};

export const hasTemplateChanges = (changes: TTemplateChanges) =>
  changes.isTemplateChanged ||
  changes.removed.length > 0 ||
  changes.created.length > 0 ||
  changes.updated.length > 0;

export const canSaveTemplate = (
  template: TMetadataTemplate | null,
  draft: TTemplateDraft,
) =>
  !!draft.name.trim() &&
  (!template || hasTemplateChanges(getTemplateChanges(template, draft)));
