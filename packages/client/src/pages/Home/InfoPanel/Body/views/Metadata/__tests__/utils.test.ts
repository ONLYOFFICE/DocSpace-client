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

import { describe, it, expect } from "vitest";

import { MetadataFieldType } from "@docspace/shared/enums";
import type {
  TCustomField,
  TEntryMetadataField,
  TEntryMetadataTemplate,
  TMetadataTemplate,
} from "@docspace/shared/api/metadata/types";
import { METADATA_CUSTOM_FIELDS_MAX } from "@docspace/shared/utils/metadata";

import type { TCustomFieldDraft, TMetadataSelection } from "../types";
import {
  canAddCustomField,
  canEditMetadata,
  createCustomFieldDraft,
  createTemplateForm,
  filterTemplatesByName,
  formatMetadataValue,
  getCascadeState,
  getChangedValues,
  getCustomFieldChanges,
  getEntryKind,
  getMetadataItemType,
  getUnassignedTemplates,
  isEmptyMetadata,
  isSameInput,
  isTemplateFormValid,
  isValidCustomFieldDraft,
  isValidNumberInput,
  sortTemplates,
  toCustomFieldDrafts,
  toggleOption,
} from "../utils";

const asSelection = (item: object) => item as unknown as TMetadataSelection;

const room = (EditRoom: boolean) =>
  asSelection({ id: 1, roomType: 6, security: { EditRoom } });
const folder = (Create: boolean) =>
  asSelection({ id: 2, isFolder: true, security: { Create } });
const file = (Edit: boolean) =>
  asSelection({ id: 3, fileExst: ".docx", security: { Edit } });

const template = (id: number, name: string) =>
  ({ id, name, visible: true }) as TMetadataTemplate;

const entryTemplate = (id: number, name: string): TEntryMetadataTemplate => ({
  id,
  name,
  visible: true,
  fields: [],
});

const field = (
  type: MetadataFieldType,
  value?: TEntryMetadataField["value"],
): TEntryMetadataField => ({
  id: 1,
  name: "Field",
  type,
  order: 0,
  value,
  options: [
    { id: "a", value: "Litigation" },
    { id: "b", value: "Tax" },
  ],
});

describe("getEntryKind", () => {
  it("addresses rooms and folders as folders", () => {
    expect(getEntryKind(file(true))).toBe("file");
    expect(getEntryKind(folder(true))).toBe("folder");
    expect(getEntryKind(room(true))).toBe("folder");
  });

  it("still tells rooms apart for the wording", () => {
    expect(getMetadataItemType(file(true))).toBe("file");
    expect(getMetadataItemType(folder(true))).toBe("folder");
    expect(getMetadataItemType(room(true))).toBe("room");
  });
});

describe("canEditMetadata", () => {
  it("follows the edit right of each entry kind", () => {
    expect(canEditMetadata(room(true))).toBe(true);
    expect(canEditMetadata(room(false))).toBe(false);
    expect(canEditMetadata(folder(true))).toBe(true);
    expect(canEditMetadata(folder(false))).toBe(false);
    expect(canEditMetadata(file(true))).toBe(true);
    expect(canEditMetadata(file(false))).toBe(false);
  });
});

describe("entry metadata state", () => {
  it("is empty without templates and custom fields", () => {
    expect(isEmptyMetadata({ templates: [], customFields: [] })).toBe(true);
    expect(
      isEmptyMetadata({
        templates: [],
        customFields: [{ name: "Client", value: "ACME" }],
      }),
    ).toBe(false);
  });

  it("stops adding custom fields at the server limit", () => {
    expect(canAddCustomField(METADATA_CUSTOM_FIELDS_MAX)).toBe(false);
    expect(canAddCustomField(METADATA_CUSTOM_FIELDS_MAX - 1)).toBe(true);
  });
});

describe("templates", () => {
  it("sorts assigned templates by name", () => {
    const sorted = sortTemplates([
      entryTemplate(1, "Invoice"),
      entryTemplate(2, "Case file"),
    ]);

    expect(sorted.map((item) => item.name)).toEqual(["Case file", "Invoice"]);
  });

  it("offers only templates that are not assigned yet", () => {
    const all = [template(1, "Case file"), template(2, "Invoice")];

    const assigned = [entryTemplate(1, "Case file")];

    expect(getUnassignedTemplates(all, assigned)).toEqual([all[1]]);
  });

  it("searches templates by name, ignoring case and spaces", () => {
    const all = [template(1, "Case file"), template(2, "Invoice")];

    expect(filterTemplatesByName(all, "  CASE ")).toEqual([all[0]]);
    expect(filterTemplatesByName(all, "")).toBe(all);
  });
});

describe("isSameInput", () => {
  it("ignores option order and surrounding spaces", () => {
    expect(isSameInput(["a", "b"], ["b", "a"])).toBe(true);
    expect(isSameInput(" ACME ", "ACME")).toBe(true);
    expect(isSameInput("ACME", "ACME Ltd")).toBe(false);
  });
});

describe("formatMetadataValue", () => {
  it("formats every field type for reading", () => {
    expect(
      formatMetadataValue(
        field(MetadataFieldType.String, { stringValue: "A40" }),
        "en",
      ),
    ).toBe("A40");
    expect(
      formatMetadataValue(
        field(MetadataFieldType.Number, { numberValue: 1250000 }),
        "en",
      ),
    ).toBe("1,250,000");
    expect(
      formatMetadataValue(
        field(MetadataFieldType.Date, {
          dateValue: "2026-09-15T03:00:00.0000000+03:00",
        }),
        "en",
      ),
    ).toBe("Sep 15, 2026");
    expect(
      formatMetadataValue(
        field(MetadataFieldType.MultiChoice, { optionIds: ["b", "a"] }),
        "en",
      ),
    ).toBe("Litigation, Tax");
  });

  it("shows nothing for an empty field", () => {
    expect(formatMetadataValue(field(MetadataFieldType.String), "en")).toBe("");
  });
});

describe("template form", () => {
  const caseFile: TEntryMetadataTemplate = {
    id: 5,
    name: "Case file",
    visible: true,
    fields: [
      {
        id: 1,
        name: "Case number",
        type: MetadataFieldType.String,
        order: 0,
        value: { stringValue: "A40" },
      },
      { id: 2, name: "Claim amount", type: MetadataFieldType.Number, order: 1 },
      {
        id: 3,
        name: "Practice areas",
        type: MetadataFieldType.MultiChoice,
        order: 2,
        options: [
          { id: "a", value: "Litigation" },
          { id: "b", value: "Tax" },
        ],
        value: { optionIds: ["a"] },
      },
    ],
  };

  it("starts from the current values and sends nothing untouched", () => {
    const form = createTemplateForm(caseFile);

    expect(form.inputs).toEqual({ 1: "A40", 2: "", 3: ["a"] });
    expect(getChangedValues(form)).toEqual([]);
  });

  it("sends only the fields the user changed, cleared ones included", () => {
    const form = createTemplateForm(caseFile);

    expect(
      getChangedValues({
        ...form,
        inputs: { 1: "", 2: " 1250000 ", 3: ["a"] },
      }),
    ).toEqual([{ fieldId: 1 }, { fieldId: 2, numberValue: 1250000 }]);
  });

  it("accepts only whole numbers", () => {
    const form = createTemplateForm(caseFile);

    expect(isTemplateFormValid(form)).toBe(true);
    expect(
      isTemplateFormValid({ ...form, inputs: { ...form.inputs, 2: "1.5" } }),
    ).toBe(false);
    expect(isValidNumberInput(" -42 ")).toBe(true);
    expect(isValidNumberInput("1e3")).toBe(false);
  });

  it("toggles options in and out of a multi select", () => {
    expect(toggleOption(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleOption(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("custom fields", () => {
  const fields: TCustomField[] = [
    { name: "Client", value: "ACME" },
    { name: "Owner", value: "Legal" },
  ];

  const newDraft = (key: string, name: string, value: string) => ({
    ...createCustomFieldDraft(key),
    name,
    value,
  });

  it("sends removed, changed and new fields only", () => {
    const [, owner] = toCustomFieldDrafts(fields);
    const drafts: TCustomFieldDraft[] = [
      { ...owner, value: "" },
      newDraft("new-1", " Region ", "EU"),
    ];

    expect(getCustomFieldChanges(fields, drafts)).toEqual([
      { name: "Client", value: null },
      { name: "Owner", value: null },
      { name: "Region", value: "EU" },
    ]);
    expect(getCustomFieldChanges(fields, toCustomFieldDrafts(fields))).toEqual(
      [],
    );
  });

  it("requires a free name and a value for a new field", () => {
    const valid = newDraft("new-1", "Region", "EU");
    const taken = newDraft("new-2", " client ", "x");
    const twin = newDraft("new-3", "REGION", "x");
    const drafts = [valid, taken, twin];

    expect(isValidCustomFieldDraft(valid, fields, [valid])).toBe(true);
    expect(isValidCustomFieldDraft(taken, fields, drafts)).toBe(false);
    expect(isValidCustomFieldDraft(twin, fields, drafts)).toBe(false);
    expect(
      isValidCustomFieldDraft(newDraft("new-4", "Region", " "), fields, []),
    ).toBe(false);
  });
});

describe("cascade", () => {
  const running = { id: "a", progress: 40, isCompleted: false };

  it("shows a run on the template that started it", () => {
    const context = { appliedIds: new Set([1]), runningTemplateId: 1 };

    expect(getCascadeState(running, { ...context, templateId: 1 })).toEqual({
      isRunning: true,
      isApplied: true,
      progress: 40,
    });
    expect(getCascadeState(running, { ...context, templateId: 2 })).toEqual({
      isRunning: false,
      isApplied: false,
      progress: 40,
    });
  });

  it("shows a run of an unknown template on every template", () => {
    expect(getCascadeState(running, { templateId: 2 }).isRunning).toBe(true);
  });

  it("keeps a template applied once its cascade has run", () => {
    expect(
      getCascadeState(
        { id: "a", progress: 100, isCompleted: true },
        { templateId: 1, appliedIds: new Set([1]) },
      ),
    ).toEqual({ isRunning: false, isApplied: true, progress: 100 });
    expect(getCascadeState(null, { templateId: 1 })).toEqual({
      isRunning: false,
      isApplied: false,
      progress: 0,
    });
  });
});
