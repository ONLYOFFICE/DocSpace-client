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

import {
  TAG_NAMESPACE,
  TAG_WIZARD,
  TAG_EXPERT,
  TAG_ARBITER,
  sessionTag,
  wizardTags,
  expertTags,
  arbiterTags,
  isWizardTag,
  isExpertTag,
  isArbiterTag,
  isSessionTag,
  extractSessionId,
} from "./tags";

describe("tag builders", () => {
  it("wizardTags returns namespace + wizard", () => {
    expect(wizardTags()).toEqual([TAG_NAMESPACE, TAG_WIZARD]);
  });

  it("expertTags includes session sub-tag", () => {
    expect(expertTags("abc-123")).toEqual([
      TAG_NAMESPACE,
      TAG_EXPERT,
      "ai-arbiter:session:abc-123",
    ]);
  });

  it("arbiterTags includes session sub-tag", () => {
    expect(arbiterTags("xyz-789")).toEqual([
      TAG_NAMESPACE,
      TAG_ARBITER,
      "ai-arbiter:session:xyz-789",
    ]);
  });

  it("sessionTag prefixes the sessionId", () => {
    expect(sessionTag("foo")).toBe("ai-arbiter:session:foo");
  });
});

describe("tag predicates", () => {
  it("isWizardTag matches exact wizard tag", () => {
    expect(isWizardTag(TAG_WIZARD)).toBe(true);
    expect(isWizardTag(TAG_EXPERT)).toBe(false);
    expect(isWizardTag(TAG_ARBITER)).toBe(false);
  });

  it("isExpertTag / isArbiterTag exact match", () => {
    expect(isExpertTag(TAG_EXPERT)).toBe(true);
    expect(isExpertTag(TAG_ARBITER)).toBe(false);
    expect(isArbiterTag(TAG_ARBITER)).toBe(true);
    expect(isArbiterTag(TAG_EXPERT)).toBe(false);
  });

  it("isSessionTag matches any session sub-tag", () => {
    expect(isSessionTag("ai-arbiter:session:foo")).toBe(true);
    expect(isSessionTag(TAG_WIZARD)).toBe(false);
    expect(isSessionTag(TAG_NAMESPACE)).toBe(false);
  });
});

describe("extractSessionId", () => {
  it("returns the sessionId when present", () => {
    expect(extractSessionId(arbiterTags("my-session"))).toBe("my-session");
    expect(extractSessionId(expertTags("other"))).toBe("other");
  });

  it("returns null when no session tag is present", () => {
    expect(extractSessionId(wizardTags())).toBeNull();
    expect(extractSessionId([])).toBeNull();
    expect(extractSessionId(undefined)).toBeNull();
  });

  it("returns null for a session tag with empty id", () => {
    expect(extractSessionId(["ai-arbiter:session:"])).toBeNull();
  });

  it("picks the first session tag if multiple are present", () => {
    expect(
      extractSessionId([
        "ai-arbiter:session:first",
        "ai-arbiter:session:second",
      ]),
    ).toBe("first");
  });
});
