/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import type { TFilesSettings } from "@docspace/shared/api/files/types";

import { DocsSettingsStore } from "./DocsSettingsStore";

describe("DocsSettingsStore encrypted editing", () => {
  it("Capability absent: nothing loaded yet", () => {
    expect(new DocsSettingsStore().isEncryptedEditingAvailable).toBe(false);
  });

  it("Capability present", () => {
    const store = new DocsSettingsStore();
    store.setFilesSettings({
      docServiceEncryptionSupported: true,
    } as TFilesSettings);
    expect(store.isEncryptedEditingAvailable).toBe(true);
  });
});
