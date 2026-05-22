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

import { countActiveUploadsForRoom, isQuotaError } from "./uploadErrors";

describe("isQuotaError", () => {
  it("matches HTTP 507 on response", () => {
    expect(isQuotaError({ response: { status: 507 } })).toBe(true);
  });

  it("matches HTTP 507 on plain status", () => {
    expect(isQuotaError({ status: 507 })).toBe(true);
    expect(isQuotaError({ statusCode: 507 })).toBe(true);
  });

  it("matches TenantQuotaException type (case-insensitive)", () => {
    expect(
      isQuotaError({
        response: { data: { error: { type: "TenantQuotaException" } } },
      }),
    ).toBe(true);
    expect(isQuotaError({ type: "TENANTQUOTAEXCEPTION" })).toBe(true);
    expect(isQuotaError({ type: "RoomQuotaException" })).toBe(true);
  });

  it("matches quota-related text in response message", () => {
    expect(
      isQuotaError({
        response: {
          data: {
            error: {
              message: "TenantQuotaException: storage limit reached",
            },
          },
        },
      }),
    ).toBe(true);
  });

  it("matches quota-related text in plain message", () => {
    expect(isQuotaError({ message: "Storage quota exceeded" })).toBe(true);
    expect(isQuotaError({ message: "insufficient storage" })).toBe(true);
    expect(isQuotaError({ message: "Room space quota exceeded (10 GB)" })).toBe(
      true,
    );
  });

  it("matches quota text in statusText", () => {
    expect(isQuotaError({ statusText: "Insufficient Storage" })).toBe(true);
  });

  it("matches plain string error containing quota text", () => {
    expect(isQuotaError("Tenant quota exceeded")).toBe(true);
  });

  it("does not match generic HTTP errors", () => {
    expect(isQuotaError({ response: { status: 500 } })).toBe(false);
    expect(isQuotaError({ response: { status: 403 } })).toBe(false);
    expect(isQuotaError({ message: "Network Error" })).toBe(false);
    expect(isQuotaError({ message: "Forbidden" })).toBe(false);
  });

  it("handles null / undefined / empty", () => {
    expect(isQuotaError(null)).toBe(false);
    expect(isQuotaError(undefined)).toBe(false);
    expect(isQuotaError("")).toBe(false);
    expect(isQuotaError({})).toBe(false);
  });

  it("ignores 507 mention inside an unrelated message", () => {
    // status field wins; raw "507" in a message without quota wording
    // should not trigger a false positive
    expect(isQuotaError({ message: "Got code 507 from upstream" })).toBe(false);
  });

  it("matches case-insensitively across message channels", () => {
    expect(isQuotaError({ message: "QUOTA EXCEEDED" })).toBe(true);
    expect(isQuotaError({ message: "Not enough space on storage" })).toBe(true);
  });

  it("ignores non-string status fields", () => {
    expect(isQuotaError({ status: "507" })).toBe(false);
  });
});

describe("countActiveUploadsForRoom", () => {
  const queued = (toFolderId: string | number, overrides = {}) => ({
    toFolderId,
    action: "upload",
    error: null,
    cancel: false,
    ...overrides,
  });

  it("returns 0 when roomId is null or undefined", () => {
    expect(countActiveUploadsForRoom([queued(42)], null)).toBe(0);
    expect(countActiveUploadsForRoom([queued(42)], undefined)).toBe(0);
  });

  it("returns 0 for an empty queue", () => {
    expect(countActiveUploadsForRoom([], 42)).toBe(0);
  });

  it("counts queued and in-flight uploads against the matching room", () => {
    const files = [queued(42), queued(42), queued(99)];
    expect(countActiveUploadsForRoom(files, 42)).toBe(2);
    expect(countActiveUploadsForRoom(files, 99)).toBe(1);
  });

  it("matches roomId across number vs string", () => {
    expect(countActiveUploadsForRoom([queued("42")], 42)).toBe(1);
    expect(countActiveUploadsForRoom([queued(42)], "42")).toBe(1);
  });

  it("skips uploaded / converted / convert actions", () => {
    const files = [
      queued(42, { action: "uploaded" }),
      queued(42, { action: "converted" }),
      queued(42, { action: "convert" }),
      queued(42),
    ];
    expect(countActiveUploadsForRoom(files, 42)).toBe(1);
  });

  it("skips cancelled or errored files (they need an explicit retry)", () => {
    const files = [
      queued(42, { cancel: true }),
      queued(42, { error: "boom" }),
      queued(42, { error: "" }),
      queued(42),
    ];
    expect(countActiveUploadsForRoom(files, 42)).toBe(2);
  });

  it("skips files with missing toFolderId", () => {
    const files = [
      queued(42),
      { action: "upload", error: null, cancel: false },
    ];
    expect(countActiveUploadsForRoom(files, 42)).toBe(1);
  });
});
