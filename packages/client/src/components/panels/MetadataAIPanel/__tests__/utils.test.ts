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

import { describe, expect, it } from "vitest";

import { FolderType, MetadataFieldType } from "@docspace/shared/enums";
import type { TEntryMetadata } from "@docspace/shared/api/metadata/types";
import type { TTranslation } from "@docspace/shared/types";

import { getChangedValues } from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/utils";

import type { TMetadataAIContext, TMetadataAIItem } from "../types";
import {
  applyAICustomValues,
  applyAIValues,
  canReadAsText,
  getFillNotFound,
  getMetadataAIError,
  getMetadataAIOptions,
  getSkippedTitles,
  getSuggestNotFound,
  getTemplateForms,
  isValidSuggestion,
  toCustomFieldRequests,
  toSuggestionDrafts,
} from "../utils";

const metadata = {
  templates: [
    {
      id: 1,
      name: "Case file",
      visible: true,
      cascade: false,
      fields: [
        {
          id: 12,
          name: "Client",
          type: MetadataFieldType.String,
          order: 0,
          value: { stringValue: "ACME" },
        },
        {
          id: 13,
          name: "Stage",
          type: MetadataFieldType.SingleChoice,
          order: 1,
          options: [
            { id: "a", value: "Intake" },
            { id: "b", value: "Discovery" },
          ],
        },
        { id: 14, name: "Hearing date", type: MetadataFieldType.Date, order: 2 },
        { id: 15, name: "Claim amount", type: MetadataFieldType.Number, order: 3 },
      ],
    },
    {
      id: 2,
      name: "Service",
      visible: false,
      cascade: false,
      fields: [
        { id: 30, name: "Sync id", type: MetadataFieldType.String, order: 0 },
      ],
    },
  ],
  customFields: [{ name: "Reviewer", value: "Ann" }],
} as TEntryMetadata;

const context: TMetadataAIContext = {
  isAIEnabled: true,
  isGuest: false,
  isPublicRoom: false,
  extsConvertible: { ".docx": [".pdf", ".txt"], ".png": [".jpg"] },
};

const file = (patch: Partial<TMetadataAIItem> = {}) =>
  ({
    id: 7,
    fileExst: ".docx",
    rootFolderType: FolderType.USER,
    security: { Edit: true },
    ...patch,
  }) as unknown as TMetadataAIItem;

const room = (patch: Partial<TMetadataAIItem> = {}) =>
  ({
    id: 8,
    roomType: 6,
    rootFolderType: FolderType.Rooms,
    security: { EditRoom: true },
    ...patch,
  }) as unknown as TMetadataAIItem;

describe("context menu options", () => {
  it("offers both actions on files, folders and rooms", () => {
    const both = ["fill-metadata-ai", "suggest-metadata-ai"];

    expect(getMetadataAIOptions(file(), context)).toEqual(both);
    expect(getMetadataAIOptions(room(), context)).toEqual(both);
  });

  it("hides both where AI cannot read or write the metadata", () => {
    const hidden = [
      getMetadataAIOptions(file({ fileExst: ".png" }), context),
      getMetadataAIOptions(file({ security: {} } as never), context),
      getMetadataAIOptions(file({ id: "box-7" } as never), context),
      getMetadataAIOptions(file({ encrypted: true }), context),
      getMetadataAIOptions(room({ rootFolderType: FolderType.Archive }), context),
      getMetadataAIOptions(file(), { ...context, isAIEnabled: false }),
      getMetadataAIOptions(file(), { ...context, isGuest: true }),
      getMetadataAIOptions(file(), { ...context, isPublicRoom: true }),
    ];

    expect(hidden.every((options) => options.length === 0)).toBe(true);
  });

  it("reads plain text as it is and the rest through a text conversion", () => {
    expect(canReadAsText(".csv", [])).toBe(true);
    expect(canReadAsText(".docx", context.extsConvertible)).toBe(true);
    expect(canReadAsText(".png", context.extsConvertible)).toBe(false);
    expect(canReadAsText(".docx", undefined)).toBe(false);
  });
});

describe("fill", () => {
  const forms = getTemplateForms(metadata);

  it("edits the visible templates only", () => {
    expect(forms.map(({ template }) => template.name)).toEqual(["Case file"]);
  });

  it("puts the values AI found into the form and saves only those", () => {
    const { forms: filled, count } = applyAIValues(forms, [
      { fieldId: 12, name: "Client", value: { stringValue: "ACME" } },
      { fieldId: 13, name: "Stage", value: { optionIds: ["b"] } },
      { fieldId: 15, name: "Claim amount", value: { numberValue: 1248500 } },
      { fieldId: 30, name: "Sync id", value: { stringValue: "x" } },
      { name: "Reviewer", value: "Bob" },
    ]);

    expect(count).toBe(2);
    expect(filled.flatMap(getChangedValues)).toEqual([
      { fieldId: 13, optionIds: ["b"] },
      { fieldId: 15, numberValue: 1248500 },
    ]);
  });

  it("puts the custom values AI found into their fields", () => {
    const drafts = [
      { key: "Reviewer", name: "Reviewer", value: "Ann", isNew: false },
      { key: "Court", name: "Court", value: "Superior", isNew: false },
    ];

    const { drafts: filled, count } = applyAICustomValues(drafts, [
      { fieldId: 12, name: "Reviewer", value: { stringValue: "Bob" } },
      { name: "reviewer", value: " Bob " },
      { name: "Court", value: "Superior" },
    ]);

    expect(count).toBe(1);
    expect(filled.map(({ value }) => value)).toEqual(["Bob", "Superior"]);
  });

  it("names the visible fields AI found nothing for", () => {
    expect(
      getFillNotFound(
        [
          { fieldId: 14, name: "Hearing date", reason: "not_found" },
          { fieldId: 30, name: "Sync id", reason: "not_found" },
          { fieldId: 12, name: "Client", reason: "already_set" },
          { name: "Reviewer", reason: "not_found" },
          { name: "Gone", reason: "not_found" },
        ],
        forms,
        [{ key: "Reviewer", name: "Reviewer", value: "Ann", isNew: false }],
      ),
    ).toEqual(["Hearing date", "Reviewer"]);
  });
});

describe("suggest", () => {
  const fields = [
    { name: "Counterparty", type: "text" as const, value: " Globex " },
    { name: "client", type: "text" as const, value: "Initech" },
    { name: "reviewer", type: "text" as const, value: "Bob" },
    { name: "Contract date", type: "date" as const },
    { name: "Reviewer", type: "text" as const },
  ];

  it("turns the proposals no template covers into custom field drafts, with or without a value", () => {
    expect(toSuggestionDrafts(fields, metadata)).toEqual([
      {
        key: "suggestion-counterparty",
        name: "Counterparty",
        value: "Globex",
        isNew: true,
      },
      {
        key: "suggestion-reviewer",
        name: "Reviewer",
        value: "Bob",
        isNew: false,
      },
      {
        key: "suggestion-contract date",
        name: "Contract date",
        value: "",
        isNew: true,
      },
    ]);
    expect(getSuggestNotFound(fields, metadata)).toEqual([
      "Contract date",
      "Reviewer",
    ]);
  });

  it("saves new fields even without a value, but never empties an existing one", () => {
    const drafts = toSuggestionDrafts(fields, metadata);

    expect(toCustomFieldRequests(drafts)).toEqual([
      { name: "Counterparty", value: "Globex" },
      { name: "Reviewer", value: "Bob" },
      { name: "Contract date", value: "" },
    ]);
    expect(isValidSuggestion(drafts[2], metadata, drafts)).toBe(true);
    expect(
      isValidSuggestion({ ...drafts[1], value: " " }, metadata, drafts),
    ).toBe(false);
    expect(
      isValidSuggestion({ ...drafts[0], name: "reviewer" }, metadata, drafts),
    ).toBe(false);
  });
});

describe("service answers", () => {
  const t = ((key: string) => key) as TTranslation;

  it("lists the files AI could not read, leaving out the ones over the limit", () => {
    expect(
      getSkippedTitles([
        { id: "9", title: "scan.png", reason: "unsupported" },
        { id: "10", title: "old.docx", reason: "limit" },
        { id: "11", reason: "forbidden" },
      ]),
    ).toEqual(["scan.png", "11"]);
  });

  it("explains each refusal of the AI service", () => {
    expect(getMetadataAIError(t, { status: 503 })).toBe("Metadata:AINoModel");
    expect(getMetadataAIError(t, { status: 422, skipped: [] })).toBe(
      "Metadata:AINothingToRead",
    );
    expect(getMetadataAIError(t, { status: 422 })).toBe(
      "Metadata:AINothingToFill",
    );
    expect(getMetadataAIError(t, { status: 504 })).toBe("Metadata:AITimeout");
    expect(getMetadataAIError(t, new Error("offline"))).toBe(
      "Common:SomethingWentWrong",
    );
  });
});
