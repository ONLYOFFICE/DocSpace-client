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

import { FolderType } from "@docspace/shared/enums";
import type {
  TMetadataAIError,
  TMetadataAIField,
  TMetadataAIFilledField,
  TMetadataAISkipped,
  TMetadataAIUnresolvedField,
} from "@docspace/shared/api/ai/types";
import type {
  TCustomFieldRequest,
  TEntryMetadata,
} from "@docspace/shared/api/metadata/types";
import type { TTranslation } from "@docspace/shared/types";
import {
  getMetadataInput,
  isMetadataSupported,
} from "@docspace/shared/utils/metadata";
import { isFile } from "@docspace/shared/utils/typeGuards";

import type {
  TCustomFieldDraft,
  TTemplateForm,
} from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/types";
import {
  canEditMetadata,
  createTemplateForm,
  getVisibleTemplates,
  isCustomFieldNameTaken,
  isSameInput,
} from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/utils";

import type { TMetadataAIContext, TMetadataAIItem } from "./types";

export const FILL_METADATA_AI = "fill-metadata-ai";
export const SUGGEST_METADATA_AI = "suggest-metadata-ai";
export const METADATA_AI_OPTIONS = [FILL_METADATA_AI, SUGGEST_METADATA_AI];
export const METADATA_AI_PROMPT_MAX_LENGTH = 2000;

const TEXT_EXTENSIONS = [".txt", ".csv"];

const CLOSED_ROOT_TYPES = [FolderType.Archive, FolderType.RoomTemplates];

const NOT_FOUND_REASONS = ["not_found", "invalid_value", "unknown_option"];

const isSameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export const canReadAsText = (
  extension: string | undefined,
  extsConvertible: TMetadataAIContext["extsConvertible"],
) => {
  if (!extension) return false;
  if (TEXT_EXTENSIONS.includes(extension)) return true;

  const targets = Array.isArray(extsConvertible)
    ? []
    : (extsConvertible?.[extension] ?? []);

  return targets.some((target) => TEXT_EXTENSIONS.includes(target));
};

export const getMetadataAIOptions = (
  item: TMetadataAIItem,
  { isAIEnabled, isGuest, isPublicRoom, extsConvertible }: TMetadataAIContext,
) => {
  const isAvailable =
    isAIEnabled &&
    !isGuest &&
    !isPublicRoom &&
    !item.private &&
    !item.encrypted &&
    isMetadataSupported(item) &&
    !CLOSED_ROOT_TYPES.includes(item.rootFolderType as FolderType) &&
    canEditMetadata(item) &&
    (!isFile(item) || canReadAsText(item.fileExst, extsConvertible));

  return isAvailable ? METADATA_AI_OPTIONS : [];
};

export const getTemplateForms = ({ templates }: TEntryMetadata) =>
  getVisibleTemplates(templates).map(createTemplateForm);

export const applyAIValues = (
  forms: TTemplateForm[],
  filled: TMetadataAIFilledField[],
) => {
  let count = 0;

  const next = forms.map((form) => {
    const inputs = { ...form.inputs };

    form.template.fields.forEach((field) => {
      const value = filled.find(({ fieldId }) => fieldId === field.id)?.value;

      if (!value || typeof value === "string") return;

      const input = getMetadataInput({ type: field.type, value });

      if (isSameInput(input, inputs[field.id])) return;

      inputs[field.id] = input;
      count += 1;
    });

    return { ...form, inputs };
  });

  return { forms: next, count };
};

export const applyAICustomValues = (
  drafts: TCustomFieldDraft[],
  filled: TMetadataAIFilledField[],
) => {
  let count = 0;

  const next = drafts.map((draft) => {
    const value = filled.find(
      (field) =>
        field.fieldId === undefined && isSameName(field.name, draft.name),
    )?.value;
    const text = typeof value === "string" ? value.trim() : "";

    if (!text || text === draft.value) return draft;

    count += 1;

    return { ...draft, value: text };
  });

  return { drafts: next, count };
};

export const getFillNotFound = (
  unresolved: TMetadataAIUnresolvedField[],
  forms: TTemplateForm[],
) => {
  const emptyFieldIds = forms.flatMap(({ template, inputs }) =>
    template.fields
      .filter(({ id }) => !inputs[id]?.length)
      .map(({ id }) => id),
  );

  return unresolved
    .filter(({ reason }) => NOT_FOUND_REASONS.includes(reason))
    .filter(
      ({ fieldId }) =>
        fieldId !== undefined && emptyFieldIds.includes(fieldId),
    )
    .map(({ name }) => name);
};

const getProposals = (fields: TMetadataAIField[], metadata: TEntryMetadata) => {
  const templateFieldNames = metadata.templates.flatMap(({ fields }) =>
    fields.map(({ name }) => name),
  );

  return fields.filter(
    ({ name }) =>
      !templateFieldNames.some((fieldName) => isSameName(fieldName, name)),
  );
};

export const toSuggestionDrafts = (
  fields: TMetadataAIField[],
  metadata: TEntryMetadata,
): TCustomFieldDraft[] =>
  getProposals(fields, metadata).flatMap(({ name, value }) => {
    const text = value?.trim() ?? "";
    const current = metadata.customFields.find((field) =>
      isSameName(field.name, name),
    );

    if (current && (!text || text === current.value)) return [];

    return [
      {
        key: `suggestion-${name.trim().toLowerCase()}`,
        name: current?.name ?? name.trim(),
        value: text,
        isNew: !current,
      },
    ];
  });

export const getSuggestNotFound = (
  fields: TMetadataAIField[],
  metadata: TEntryMetadata,
) =>
  getProposals(fields, metadata)
    .filter(({ value }) => !value?.trim())
    .map(({ name }) => name);

export const isValidSuggestion = (
  draft: TCustomFieldDraft,
  metadata: TEntryMetadata,
  drafts: TCustomFieldDraft[],
) =>
  draft.isNew
    ? !!draft.name.trim() &&
      !isCustomFieldNameTaken(draft, metadata.customFields, drafts)
    : !!draft.value.trim();

export const toCustomFieldRequests = (
  drafts: TCustomFieldDraft[],
): TCustomFieldRequest[] =>
  drafts
    .map(({ name, value }) => ({ name: name.trim(), value: value.trim() }))
    .filter(({ value }) => value);

export const getSkippedTitles = (skipped: TMetadataAISkipped[]) =>
  skipped
    .filter(({ reason }) => reason !== "limit")
    .map(({ id, title }) => title ?? id);

export const getMetadataAIError = (t: TTranslation, error: unknown) => {
  const { status, skipped } = (error ?? {}) as TMetadataAIError;

  switch (status) {
    case 403:
      return t("Common:AccessDenied");
    case 422:
      return skipped
        ? t("Metadata:AINothingToRead")
        : t("Metadata:AINothingToFill");
    case 429:
      return t("Metadata:AIBusy");
    case 502:
      return t("Metadata:AIFailed");
    case 503:
      return t("Metadata:AINoModel");
    case 504:
      return t("Metadata:AITimeout");
    default:
      return t("Common:SomethingWentWrong");
  }
};
