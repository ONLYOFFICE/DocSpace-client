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
