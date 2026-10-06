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
import type { TMetadataTemplate } from "@docspace/shared/api/metadata/types";

import {
  canSaveTemplate,
  createFieldForm,
  getTemplateChanges,
  isValidField,
  moveItem,
  setFieldType,
  toTemplateDraft,
  upsertField,
} from "../utils";
import type { TFieldDraft } from "../types";

const template: TMetadataTemplate = {
  id: 1,
  name: "Case file",
  visible: true,
  createBy: "user",
  createOn: "2026-10-03T10:00:00.0000000+03:00",
  modifiedBy: "user",
  modifiedOn: "2026-10-03T10:00:00.0000000+03:00",
  fields: [
    {
      id: 2,
      templateId: 1,
      name: "Court",
      type: MetadataFieldType.SingleChoice,
      options: [
        { id: "a", value: "Arbitration" },
        { id: "b", value: "Civil" },
      ],
      order: 1,
    },
    {
      id: 1,
      templateId: 1,
      name: "Case number",
      type: MetadataFieldType.String,
      order: 0,
    },
  ],
};

const draft = toTemplateDraft(template);
const [caseNumber, court] = draft.fields;

describe("moveItem", () => {
  it("moves an item and keeps the source untouched", () => {
    const items = ["a", "b", "c"];

    expect(moveItem(items, 0, 2)).toEqual(["b", "c", "a"]);
    expect(items).toEqual(["a", "b", "c"]);
  });

  it("ignores moves outside the list", () => {
    const items = ["a", "b"];

    expect(moveItem(items, 0, -1)).toBe(items);
    expect(moveItem(items, 1, 2)).toBe(items);
  });
});

describe("toTemplateDraft", () => {
  it("orders fields by their server order", () => {
    expect(draft.fields.map((field) => field.id)).toEqual([1, 2]);
  });

  it("starts a new template visible and empty", () => {
    expect(toTemplateDraft(null)).toEqual({
      name: "",
      visible: true,
      fields: [],
    });
  });
});

describe("field form", () => {
  it("seeds one option when a choice type is picked", () => {
    const form = setFieldType(
      createFieldForm("k"),
      MetadataFieldType.MultiChoice,
    );

    expect(form.options).toEqual([{ value: "" }]);
    expect(setFieldType(form, MetadataFieldType.Number).options).toBe(
      form.options,
    );
  });

  it("needs a name, a type and unique non-empty options", () => {
    const form = { ...createFieldForm("k"), name: "Stage" };
    const choice = { ...form, type: MetadataFieldType.SingleChoice };

    expect(isValidField(form)).toBe(false);
    expect(isValidField({ ...form, type: MetadataFieldType.Date })).toBe(true);
    expect(
      isValidField({ ...form, name: " ", type: MetadataFieldType.Date }),
    ).toBe(false);
    expect(isValidField({ ...choice, options: [{ value: " " }] })).toBe(false);
    expect(
      isValidField({
        ...choice,
        options: [{ value: "Tax" }, { value: "tax " }],
      }),
    ).toBe(false);
    expect(
      isValidField({ ...choice, options: [{ value: "Tax" }, { value: "" }] }),
    ).toBe(true);
  });

  it("replaces an edited field and appends a new one", () => {
    const renamed = { ...court, name: "Court name" };
    const added: TFieldDraft = {
      key: "new-1",
      name: "Stage",
      type: MetadataFieldType.String,
      options: [],
    };

    expect(upsertField(draft.fields, renamed)).toEqual([caseNumber, renamed]);
    expect(upsertField(draft.fields, added)).toEqual([...draft.fields, added]);
  });
});

describe("getTemplateChanges", () => {
  it("finds nothing to save for an untouched template", () => {
    expect(getTemplateChanges(template, draft)).toEqual({
      isTemplateChanged: false,
      removed: [],
      created: [],
      updated: [],
    });
    expect(canSaveTemplate(template, draft)).toBe(false);
  });

  it("updates every moved field with its new position", () => {
    const { updated } = getTemplateChanges(template, {
      ...draft,
      fields: moveItem(draft.fields, 1, 0),
    });

    expect(updated.map(({ id, data }) => [id, data.order])).toEqual([
      [2, 0],
      [1, 1],
    ]);
  });

  it("keeps option ids so a renamed option is not removed", () => {
    const options = [{ id: "a", value: "Arbitration court" }, court.options[1]];
    const { updated } = getTemplateChanges(template, {
      ...draft,
      fields: [caseNumber, { ...court, options }],
    });

    expect(updated).toEqual([
      {
        id: 2,
        data: {
          name: "Court",
          type: MetadataFieldType.SingleChoice,
          options,
          order: 1,
        },
      },
    ]);
  });

  it("splits removed and new fields and clears options of other types", () => {
    const changes = getTemplateChanges(template, {
      ...draft,
      fields: [
        caseNumber,
        {
          key: "new-1",
          name: " Hearing date ",
          type: MetadataFieldType.Date,
          options: [{ value: "leftover" }],
        },
      ],
    });

    expect(changes.removed).toEqual([2]);
    expect(changes.updated).toEqual([]);
    expect(changes.created).toEqual([
      {
        name: "Hearing date",
        type: MetadataFieldType.Date,
        options: [],
        order: 1,
      },
    ]);
  });

  it("ignores spaces around an unchanged name", () => {
    expect(
      getTemplateChanges(template, { ...draft, name: " Case file " })
        .isTemplateChanged,
    ).toBe(false);
    expect(
      getTemplateChanges(template, { ...draft, visible: false })
        .isTemplateChanged,
    ).toBe(true);
  });
});

describe("canSaveTemplate", () => {
  it("requires a name for a new template", () => {
    expect(canSaveTemplate(null, toTemplateDraft(null))).toBe(false);
    expect(
      canSaveTemplate(null, { ...toTemplateDraft(null), name: "Tax" }),
    ).toBe(true);
  });

  it("requires a change for an existing template", () => {
    expect(canSaveTemplate(template, { ...draft, name: "Case" })).toBe(true);
    expect(canSaveTemplate(template, { ...draft, name: " " })).toBe(false);
  });
});
