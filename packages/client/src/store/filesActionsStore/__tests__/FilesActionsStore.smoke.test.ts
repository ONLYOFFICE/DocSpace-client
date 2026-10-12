// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";
import { createTestFilesActionsStore } from "./testHarness";

describe("FilesActionsStore — construction", () => {
  it("constructs with inert fakes", () => {
    const store = createTestFilesActionsStore();
    expect(store).toBeDefined();
    expect(typeof store.deleteAction).toBe("function");
    expect(typeof store.getHeaderMenu).toBe("function");
  });
});
