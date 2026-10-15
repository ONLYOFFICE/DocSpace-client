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

import { MetadataFieldType } from "@docspace/shared/enums";
import type { TMetadataField } from "@docspace/shared/api/metadata/types";
import type { TTranslation } from "@docspace/shared/types";

import type { TConditionDraft } from "../types";
import {
  addMetadataGroup,
  applyMetadataFilter,
  dropMetadataChip,
  fromFilterCondition,
  getDrafts,
  getInputLabel,
  getMetadataFilterValue,
  getMetadataSelectedItem,
  getOperators,
  METADATA_FILTER_GROUP,
  parseMetadataFilter,
  removeMetadataChip,
  serializeMetadataFilter,
  TEMPLATE_CHIP_KEY,
  toFilterCondition,
  toFilterState,
} from "../utils";

const field = (
  id: number,
  name: string,
  type: MetadataFieldType,
  options?: TMetadataField["options"],
) => ({ id, templateId: 1, name, type, options, order: id }) as TMetadataField;

const client = field(1, "Client", MetadataFieldType.String);
const amount = field(2, "Claim amount", MetadataFieldType.Number);
const hearing = field(3, "Hearing date", MetadataFieldType.Date);
const stage = field(4, "Stage", MetadataFieldType.SingleChoice, [
  { id: "a", value: "Intake" },
  { id: "b", value: "Discovery" },
]);
const areas = field(5, "Practice areas", MetadataFieldType.MultiChoice, [
  { id: "x", value: "Tax" },
  { id: "y", value: "IP" },
]);

const template = {
  id: 1,
  name: "Case file",
  fields: [client, amount, hearing, stage, areas],
};

const t = ((key: string, options?: Record<string, string>) =>
  options ? `${key}:${Object.values(options).join("/")}` : key) as TTranslation;

describe("operators", () => {
  it("offers what the server can evaluate for each field type", () => {
    expect(getOperators(MetadataFieldType.String)).toEqual(["contains", "is"]);
    expect(getOperators(MetadataFieldType.Number)).toEqual([
      "equals",
      "greaterThan",
      "lessThan",
    ]);
    expect(getOperators(MetadataFieldType.Date)).toEqual([
      "on",
      "before",
      "after",
    ]);
    expect(getOperators(MetadataFieldType.MultiChoice)).toEqual(["isAnyOf"]);
  });
});

describe("conditions", () => {
  it("sends strict comparisons as gt and lt and text search as contains", () => {
    expect(
      toFilterCondition(amount, { operator: "greaterThan", input: "100" }),
    ).toEqual({ fieldId: 2, op: "gt", value: "100" });
    expect(
      toFilterCondition(amount, { operator: "lessThan", input: "100" }),
    ).toEqual({ fieldId: 2, op: "lt", value: "100" });
    expect(
      toFilterCondition(hearing, { operator: "before", input: "2026-09-15" }),
    ).toEqual({ fieldId: 3, op: "lt", value: "2026-09-15" });
    expect(
      toFilterCondition(hearing, { operator: "after", input: "2026-12-31" }),
    ).toEqual({ fieldId: 3, op: "gt", value: "2026-12-31" });
    expect(
      toFilterCondition(client, { operator: "contains", input: " acm " }),
    ).toEqual({ fieldId: 1, op: "contains", value: "acm" });
  });

  it("still reads links saved with shifted inclusive ranges", () => {
    expect(
      fromFilterCondition(amount, { fieldId: 2, op: "range", from: "101" }),
    ).toEqual({ operator: "greaterThan", input: "100" });
    expect(
      fromFilterCondition(hearing, {
        fieldId: 3,
        op: "range",
        to: "2026-09-14",
      }),
    ).toEqual({ operator: "before", input: "2026-09-15" });
  });

  it("skips empty and invalid values", () => {
    expect(toFilterCondition(client, { operator: "is", input: " " })).toBe(
      null,
    );
    expect(
      toFilterCondition(amount, { operator: "equals", input: "1.5" }),
    ).toBe(null);
    expect(toFilterCondition(stage, { operator: "is", input: [] })).toBe(null);
  });

  it("restores every draft it produced", () => {
    const drafts: [TMetadataField, TConditionDraft][] = [
      [client, { operator: "is", input: "ACME" }],
      [client, { operator: "contains", input: "ACM" }],
      [amount, { operator: "equals", input: "42" }],
      [amount, { operator: "greaterThan", input: "100" }],
      [amount, { operator: "lessThan", input: "100" }],
      [hearing, { operator: "on", input: "2026-09-15" }],
      [hearing, { operator: "before", input: "2026-09-15" }],
      [hearing, { operator: "after", input: "2026-09-15" }],
      [stage, { operator: "is", input: ["b"] }],
      [areas, { operator: "isAnyOf", input: ["x", "y"] }],
    ];

    drafts.forEach(([item, draft]) => {
      const condition = toFilterCondition(item, draft)!;

      expect(fromFilterCondition(item, condition)).toEqual(draft);
    });
  });

  it("writes dates the way the info panel does", () => {
    expect(getInputLabel(hearing, "2026-09-15", "en")).toBe("Sep 15, 2026");
    expect(getInputLabel(areas, ["x", "y"], "en")).toBe("Tax, IP");
  });

  it("leaves conditions it cannot show unread", () => {
    expect(
      fromFilterCondition(hearing, {
        fieldId: 3,
        op: "range",
        from: "2026-01-01",
        to: "2026-06-30",
      }),
    ).toBe(null);
    expect(
      fromFilterCondition(amount, { fieldId: 2, op: "gte", value: "100" }),
    ).toBe(null);
  });
});

describe("filter state", () => {
  it("restores the drafts of the same template only", () => {
    const state = {
      templateId: 1,
      conditions: [{ fieldId: 4, op: "in" as const, optionIds: ["b"] }],
    };

    expect(getDrafts(template, state)[4]).toEqual({
      operator: "is",
      input: ["b"],
    });
    expect(getDrafts(template, { ...state, templateId: 2 })[4]).toEqual({
      operator: "is",
      input: [],
    });
  });

  it("keeps only the filled conditions", () => {
    const drafts = getDrafts(template, null);
    drafts[1] = { operator: "is", input: "ACME" };

    expect(toFilterState(template, drafts)).toEqual({
      templateId: 1,
      conditions: [{ fieldId: 1, op: "eq", value: "ACME" }],
    });
  });

  it("writes the state into the listing filter, leaving no empty list", () => {
    const filter = {
      metadataTemplateId: null as number | null,
      metadataFilters: null as null | { fieldId: number; op: "eq" }[],
    };

    applyMetadataFilter(filter, { templateId: 1, conditions: [] });
    expect(filter).toEqual({ metadataTemplateId: 1, metadataFilters: null });

    applyMetadataFilter(filter, null);
    expect(filter).toEqual({ metadataTemplateId: null, metadataFilters: null });
  });

  it("reads the panel value back and refuses anything else", () => {
    const state = { templateId: 1, conditions: [] };

    expect(parseMetadataFilter(serializeMetadataFilter(state))).toEqual(state);
    expect(parseMetadataFilter("metadata")).toBe(null);
    expect(parseMetadataFilter('{"templateId":"1","conditions":[]}')).toBe(
      null,
    );
    expect(
      getMetadataFilterValue([
        { group: "filter-type", key: "1" },
        { group: METADATA_FILTER_GROUP, key: serializeMetadataFilter(state) },
      ]),
    ).toEqual(state);
  });
});

describe("chips", () => {
  const state = {
    templateId: 1,
    conditions: [
      { fieldId: 4, op: "in" as const, optionIds: ["b"] },
      { fieldId: 2, op: "range" as const, from: "101" },
    ],
  };

  it("shows one chip per condition", () => {
    expect(getMetadataSelectedItem(t, state, template, "en").chips).toEqual([
      {
        key: "metadata-4",
        label: "Metadata:ConditionLabel:Stage/Metadata:OperatorIs/Discovery",
      },
      {
        key: "metadata-2",
        label:
          "Metadata:ConditionLabel:Claim amount/Metadata:OperatorGreaterThan/100",
      },
    ]);
  });

  it("shows the template alone when nothing narrows it", () => {
    const item = getMetadataSelectedItem(
      t,
      { templateId: 1, conditions: [] },
      template,
      "en",
    );

    expect(item.chips).toEqual([
      { key: TEMPLATE_CHIP_KEY, label: "Metadata:TemplateValue:Case file" },
    ]);
  });

  it("drops a condition by its chip and the whole filter by the template chip", () => {
    expect(removeMetadataChip(state, "metadata-4")?.conditions).toEqual([
      { fieldId: 2, op: "range", from: "101" },
    ]);
    expect(removeMetadataChip(state, TEMPLATE_CHIP_KEY)).toBe(null);
  });

  it("drops the whole filter with its last condition", () => {
    const last = { ...state, conditions: state.conditions.slice(0, 1) };

    expect(removeMetadataChip(last, "metadata-4")).toBe(null);
  });

  it("removes a chip straight from the listing filter", () => {
    const filter = {
      metadataTemplateId: 1 as number | null,
      metadataFilters: state.conditions as typeof state.conditions | null,
    };

    dropMetadataChip(filter, "metadata-4");
    expect(filter.metadataFilters).toEqual([
      { fieldId: 2, op: "range", from: "101" },
    ]);

    dropMetadataChip(filter, "metadata-2");
    expect(filter).toEqual({ metadataTemplateId: null, metadataFilters: null });
  });
});

describe("panel group", () => {
  it("goes last and takes the closing flag from the group before it", () => {
    const options = [
      { key: "type", group: "filter-type", label: "Type", isHeader: true, isLast: true },
      { key: "1", group: "filter-type", label: "Documents" },
    ];

    addMetadataGroup(options, "Metadata");

    expect(options.map(({ key, isLast }) => [key, isLast])).toEqual([
      ["type", false],
      ["1", undefined],
      [METADATA_FILTER_GROUP, true],
      ["metadata", undefined],
    ]);
  });
});
