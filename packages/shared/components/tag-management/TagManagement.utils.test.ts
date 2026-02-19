// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
