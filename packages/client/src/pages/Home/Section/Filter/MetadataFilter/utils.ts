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

import { MetadataFieldType } from "@docspace/shared/enums";
import type {
  TMetadataField,
  TMetadataFilterCondition,
  TMetadataTemplate,
} from "@docspace/shared/api/metadata/types";
import type { TTranslation } from "@docspace/shared/types";
import {
  isMetadataNumber,
  type TMetadataInput,
} from "@docspace/shared/utils/metadata";

import type {
  TConditionDraft,
  TFilterOperator,
  TMetadataFilterState,
} from "./types";

type TFilterField = Pick<TMetadataField, "id" | "name" | "type" | "options">;

type TFilterOption = {
  key: unknown;
  group: string;
  label: string;
  isHeader?: boolean;
  isLast?: boolean;
  withoutHeader?: boolean;
  isCustom?: boolean;
};

type TMetadataFilterFields = {
  metadataTemplateId: number | null;
  metadataFilters: TMetadataFilterCondition[] | null;
};

export const METADATA_FILTER_GROUP = "filter-metadata";

export const TEMPLATE_CHIP_KEY = "metadata-template";

const OPERATORS: Record<MetadataFieldType, TFilterOperator[]> = {
  [MetadataFieldType.String]: ["is"],
  [MetadataFieldType.Number]: ["equals", "greaterThan", "lessThan"],
  [MetadataFieldType.Date]: ["on", "before", "after"],
  [MetadataFieldType.SingleChoice]: ["is"],
  [MetadataFieldType.MultiChoice]: ["isAnyOf"],
};

const isChoice = (type: MetadataFieldType) =>
  type === MetadataFieldType.SingleChoice ||
  type === MetadataFieldType.MultiChoice;

const shiftDay = (date: string, days: number) =>
  DateTime.fromISO(date, { zone: "utc" }).plus({ days }).toISODate() ?? "";

const shiftNumber = (value: string, delta: number) =>
  String(Number(value) + delta);

export const getOperators = (type: MetadataFieldType) => OPERATORS[type];

export const getEmptyDraft = ({
  type,
}: Pick<TMetadataField, "type">): TConditionDraft => ({
  operator: getOperators(type)[0],
  input: isChoice(type) ? [] : "",
});

export const toFilterCondition = (
  { id: fieldId }: Pick<TMetadataField, "id">,
  { operator, input }: TConditionDraft,
): TMetadataFilterCondition | null => {
  if (Array.isArray(input)) {
    return input.length ? { fieldId, op: "in", optionIds: input } : null;
  }

  const value = input.trim();
  if (!value) return null;

  switch (operator) {
    case "equals":
      return isMetadataNumber(value) ? { fieldId, op: "eq", value } : null;
    case "greaterThan":
      return isMetadataNumber(value)
        ? { fieldId, op: "range", from: shiftNumber(value, 1) }
        : null;
    case "lessThan":
      return isMetadataNumber(value)
        ? { fieldId, op: "range", to: shiftNumber(value, -1) }
        : null;
    case "on":
      return { fieldId, op: "range", from: value, to: value };
    case "before":
      return { fieldId, op: "range", to: shiftDay(value, -1) };
    case "after":
      return { fieldId, op: "range", from: shiftDay(value, 1) };
    default:
      return { fieldId, op: "eq", value };
  }
};

export const fromFilterCondition = (
  { type }: Pick<TMetadataField, "type">,
  { op, value, from, to, optionIds }: TMetadataFilterCondition,
): TConditionDraft | null => {
  if (op === "in") {
    return {
      operator: type === MetadataFieldType.MultiChoice ? "isAnyOf" : "is",
      input: optionIds ?? [],
    };
  }

  if (op === "eq") {
    return {
      operator: type === MetadataFieldType.Number ? "equals" : "is",
      input: value ?? "",
    };
  }

  const isDate = type === MetadataFieldType.Date;

  if (from && from === to) {
    return { operator: isDate ? "on" : "equals", input: from };
  }

  if (from && !to) {
    return isDate
      ? { operator: "after", input: shiftDay(from, -1) }
      : { operator: "greaterThan", input: shiftNumber(from, -1) };
  }

  if (to && !from) {
    return isDate
      ? { operator: "before", input: shiftDay(to, 1) }
      : { operator: "lessThan", input: shiftNumber(to, 1) };
  }

  return null;
};

export const getDrafts = (
  { id, fields = [] }: Pick<TMetadataTemplate, "id" | "fields">,
  state: TMetadataFilterState | null,
): Record<number, TConditionDraft> =>
  Object.fromEntries(
    fields.map((field) => {
      const condition =
        state?.templateId === id
          ? state.conditions.find(({ fieldId }) => fieldId === field.id)
          : undefined;

      return [
        field.id,
        (condition && fromFilterCondition(field, condition)) ??
          getEmptyDraft(field),
      ];
    }),
  );

export const toFilterState = (
  { id, fields = [] }: Pick<TMetadataTemplate, "id" | "fields">,
  drafts: Record<number, TConditionDraft>,
): TMetadataFilterState => ({
  templateId: id,
  conditions: fields.flatMap((field) => {
    const condition = drafts[field.id]
      ? toFilterCondition(field, drafts[field.id])
      : null;

    return condition ? [condition] : [];
  }),
});

export const serializeMetadataFilter = (state: TMetadataFilterState) =>
  JSON.stringify(state);

export const parseMetadataFilter = (
  key?: unknown,
): TMetadataFilterState | null => {
  try {
    const state = JSON.parse(String(key ?? ""));

    return Number.isInteger(state?.templateId) &&
      Array.isArray(state.conditions)
      ? state
      : null;
  } catch {
    return null;
  }
};

export const getMetadataFilterState = ({
  metadataTemplateId,
  metadataFilters,
}: TMetadataFilterFields): TMetadataFilterState | null =>
  metadataTemplateId
    ? { templateId: metadataTemplateId, conditions: metadataFilters ?? [] }
    : null;

export const applyMetadataFilter = (
  filter: TMetadataFilterFields,
  state: TMetadataFilterState | null,
) => {
  filter.metadataTemplateId = state?.templateId ?? null;
  filter.metadataFilters = state?.conditions.length ? state.conditions : null;
};

export const dropMetadataChip = (
  filter: TMetadataFilterFields,
  chipKey: string,
) => {
  const state = getMetadataFilterState(filter);

  applyMetadataFilter(filter, state && removeMetadataChip(state, chipKey));
};

export const addMetadataGroup = (options: TFilterOption[], label: string) => {
  options.forEach((option) => {
    if (option.isHeader) option.isLast = false;
  });

  options.push(
    {
      key: METADATA_FILTER_GROUP,
      group: METADATA_FILTER_GROUP,
      label,
      isHeader: true,
      isLast: true,
      withoutHeader: true,
    },
    { key: "metadata", group: METADATA_FILTER_GROUP, label: "", isCustom: true },
  );
};

export const getMetadataFilterValue = (
  data: { group?: string; key?: unknown }[],
) =>
  parseMetadataFilter(
    data.find(({ group }) => group === METADATA_FILTER_GROUP)?.key,
  );

export const getChipKey = ({ fieldId }: TMetadataFilterCondition) =>
  `metadata-${fieldId}`;

export const removeMetadataChip = (
  state: TMetadataFilterState,
  chipKey: string,
): TMetadataFilterState | null => {
  const conditions = state.conditions.filter(
    (condition) => getChipKey(condition) !== chipKey,
  );

  return chipKey !== TEMPLATE_CHIP_KEY && conditions.length
    ? { ...state, conditions }
    : null;
};

export const getOperatorLabel = (
  t: TTranslation,
  operator: TFilterOperator,
) => {
  switch (operator) {
    case "isAnyOf":
      return t("Metadata:OperatorIsAnyOf");
    case "equals":
      return t("Metadata:OperatorEquals");
    case "greaterThan":
      return t("Metadata:OperatorGreaterThan");
    case "lessThan":
      return t("Metadata:OperatorLessThan");
    case "on":
      return t("Metadata:OperatorOn");
    case "before":
      return t("Metadata:OperatorBefore");
    case "after":
      return t("Metadata:OperatorAfter");
    default:
      return t("Metadata:OperatorIs");
  }
};

export const getInputLabel = (
  { type, options }: Pick<TMetadataField, "type" | "options">,
  input: TMetadataInput,
  locale: string,
) => {
  if (Array.isArray(input)) {
    return (options ?? [])
      .filter(({ id }) => input.includes(id))
      .map(({ value }) => value)
      .join(", ");
  }

  return type === MetadataFieldType.Date
    ? DateTime.fromISO(input, { zone: "utc" })
        .setLocale(locale)
        .toFormat("dd MMM yyyy")
    : input;
};

export const getConditionLabel = (
  t: TTranslation,
  field: TFilterField,
  condition: TMetadataFilterCondition,
  locale: string,
) => {
  const draft = fromFilterCondition(field, condition);

  return draft
    ? t("Metadata:ConditionLabel", {
        field: field.name,
        operator: getOperatorLabel(t, draft.operator),
        value: getInputLabel(field, draft.input, locale),
      })
    : field.name;
};

export const getConditionChips = (
  t: TTranslation,
  state: TMetadataFilterState,
  template: Pick<TMetadataTemplate, "fields"> | undefined,
  locale: string,
) =>
  state.conditions.flatMap((condition) => {
    const field = template?.fields?.find(({ id }) => id === condition.fieldId);

    return field
      ? [
          {
            key: getChipKey(condition),
            label: getConditionLabel(t, field, condition, locale),
          },
        ]
      : [];
  });

export const getMetadataSelectedItem = (
  t: TTranslation,
  state: TMetadataFilterState,
  template: Pick<TMetadataTemplate, "name" | "fields"> | undefined,
  locale: string,
) => {
  const templateName = template?.name ?? String(state.templateId);
  const chips = getConditionChips(t, state, template, locale);

  return {
    key: serializeMetadataFilter(state),
    group: METADATA_FILTER_GROUP,
    label: templateName,
    chips: chips.length
      ? chips
      : [
          {
            key: TEMPLATE_CHIP_KEY,
            label: t("Metadata:TemplateValue", { template: templateName }),
          },
        ],
  };
};
