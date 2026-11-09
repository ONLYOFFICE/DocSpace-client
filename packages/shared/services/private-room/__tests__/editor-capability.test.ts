/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { isEncryptedEditingAvailable } from "../editor-capability";

describe("isEncryptedEditingAvailable", () => {
  it("Capability present", () => {
    expect(
      isEncryptedEditingAvailable({ docServiceEncryptionSupported: true }),
    ).toBe(true);
  });

  it("Capability false", () => {
    expect(
      isEncryptedEditingAvailable({ docServiceEncryptionSupported: false }),
    ).toBe(false);
  });

  it("Capability absent", () => {
    expect(isEncryptedEditingAvailable({})).toBe(false);
    expect(isEncryptedEditingAvailable(null)).toBe(false);
    expect(isEncryptedEditingAvailable(undefined)).toBe(false);
  });
});
