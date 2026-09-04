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

import type { TagType } from "@docspace/ui-kit/components/tag";
import {
  transformTagsData,
  unionTagsData,
  searchFilter,
} from "./TagManagement.utils";
import type { TTag } from "./TagManagement.types";

describe("TagManagement.utils", () => {
  describe("transformTagsData", () => {
    it("transforms string tags to TTag format", () => {
      const input = ["tag1", "tag2", "tag3"];
      const result = transformTagsData(input, false);

      expect(result).toEqual([
        { label: "tag1", checked: false },
        { label: "tag2", checked: false },
        { label: "tag3", checked: false },
      ]);
    });

    it("transforms TagType objects to TTag format", () => {
      const input: TagType[] = [
        { label: "tag1", isDefault: false, isThirdParty: false },
        { label: "tag2", isDefault: true, isThirdParty: false },
      ];
      const result = transformTagsData(input, true);

      expect(result).toEqual([
        { label: "tag1", checked: true },
        { label: "tag2", checked: true },
      ]);
    });

    it("transforms mixed array of strings and TagType objects", () => {
      const input: Array<string | TagType> = [
        "stringTag",
        { label: "objectTag", isDefault: false, isThirdParty: false },
      ];
      const result = transformTagsData(input, false);

      expect(result).toEqual([
        { label: "stringTag", checked: false },
        { label: "objectTag", checked: false },
      ]);
    });

    it("handles empty array", () => {
      const result = transformTagsData([], false);
      expect(result).toEqual([]);
    });

    it("applies checked state correctly", () => {
      const input = ["tag1"];
      const checkedResult = transformTagsData(input, true);
      const uncheckedResult = transformTagsData(input, false);

      expect(checkedResult[0].checked).toBe(true);
      expect(uncheckedResult[0].checked).toBe(false);
    });
  });

  describe("unionTagsData", () => {
    it("returns only room tags when fetched data is undefined", () => {
      const roomTags = ["tag1", "tag2"];
      const result = unionTagsData(roomTags, undefined);

      expect(result).toEqual([
        { label: "tag1", checked: true },
        { label: "tag2", checked: true },
      ]);
    });

    it("merges room tags and fetched tags without duplicates", () => {
      const roomTags = ["tag1", "tag2"];
      const fetchedTags = ["tag2", "tag3", "tag4"];
      const result = unionTagsData(roomTags, fetchedTags);

      expect(result).toHaveLength(4);
      expect(result).toEqual([
        { label: "tag1", checked: true },
        { label: "tag2", checked: true },
        { label: "tag3", checked: false },
        { label: "tag4", checked: false },
      ]);
    });

    it("filters out default tags from room tags", () => {
      const roomTags: TagType[] = [
        { label: "normalTag", isDefault: false, isThirdParty: false },
        { label: "defaultTag", isDefault: true, isThirdParty: false },
      ];
      const fetchedTags = ["tag3"];
      const result = unionTagsData(roomTags, fetchedTags);

      expect(result).toHaveLength(2);
      expect(result.find((t) => t.label === "defaultTag")).toBeUndefined();
      expect(result.find((t) => t.label === "normalTag")).toBeDefined();
    });

    it("handles empty room tags", () => {
      const fetchedTags = ["tag1", "tag2"];
      const result = unionTagsData([], fetchedTags);

      expect(result).toEqual([
        { label: "tag1", checked: false },
        { label: "tag2", checked: false },
      ]);
    });

    it("handles empty fetched tags", () => {
      const roomTags = ["tag1"];
      const result = unionTagsData(roomTags, []);

      expect(result).toEqual([{ label: "tag1", checked: true }]);
    });
  });

  describe("searchFilter", () => {
    const mockTags: TTag[] = [
      { label: "test", checked: false },
      { label: "test 2", checked: false },
      { label: "test 3", checked: false },
      { label: "testing", checked: false },
      { label: "my test", checked: false },
      { label: "latest", checked: false },
      { label: "production", checked: false },
      { label: "development", checked: false },
    ];

    it("returns all tags when query is empty", () => {
      const result = searchFilter(mockTags, "");
      expect(result).toEqual(mockTags);
    });

    it("returns all tags when query is whitespace", () => {
      const result = searchFilter(mockTags, "   ");
      expect(result).toEqual(mockTags);
    });

    it("prioritizes exact matches first", () => {
      const result = searchFilter(mockTags, "test");
      expect(result[0].label).toBe("test");
    });

    it("prioritizes startsWith matches after exact matches", () => {
      const result = searchFilter(mockTags, "test");
      const startsWithTest = result.filter((t) => t.label.startsWith("test"));
      expect(startsWithTest.length).toBeGreaterThan(0);
      expect(startsWithTest[0].label).toBe("test");
    });

    it("includes contains matches", () => {
      const result = searchFilter(mockTags, "test");
      const containsTest = result.find((t) => t.label === "my test");
      expect(containsTest).toBeDefined();
    });

    it("filters out non-matching tags", () => {
      const result = searchFilter(mockTags, "xyz");
      expect(result).toHaveLength(0);
    });

    it("is case insensitive", () => {
      const result = searchFilter(mockTags, "TEST");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].label.toLowerCase()).toContain("test");
    });

    it("handles fuzzy matching", () => {
      const result = searchFilter(mockTags, "tst");
      const fuzzyMatch = result.find((t) => t.label === "test");
      expect(fuzzyMatch).toBeDefined();
    });

    it("sorts by relevance score", () => {
      const result = searchFilter(mockTags, "test");
      expect(result[0].label).toBe("test");
      expect(result[1].label).toMatch(/^test/);
    });

    it("trims search query", () => {
      const result = searchFilter(mockTags, "  test  ");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].label).toBe("test");
    });

    it("handles special characters in search", () => {
      const specialTags: TTag[] = [
        { label: "tag-1", checked: false },
        { label: "tag_2", checked: false },
      ];
      const result = searchFilter(specialTags, "tag-");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns empty array for no matches", () => {
      const result = searchFilter(mockTags, "nonexistent");
      expect(result).toEqual([]);
    });

    it("maintains tag properties in results", () => {
      const tagsWithChecked: TTag[] = [
        { label: "test", checked: true },
        { label: "testing", checked: false },
      ];
      const result = searchFilter(tagsWithChecked, "test");
      expect(result[0].checked).toBe(true);
      expect(result[1].checked).toBe(false);
    });
  });
});
