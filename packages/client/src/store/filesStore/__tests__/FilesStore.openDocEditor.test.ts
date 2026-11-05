/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The harness registers the toast mock the store sees; import it first.
import { createTestFilesStore } from "./testHarness";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

const encryptedFile = { id: 7, title: "a1b2c3d4e5f6.docx", encrypted: true };
const plainFile = { id: 8, title: "Plain.docx", encrypted: false };

const storeWith = (isEncryptedEditingAvailable: boolean) => {
  const store = createTestFilesStore({
    filesSettingsStore: { isEncryptedEditingAvailable, openOnNewPage: false },
  });
  store.files = [encryptedFile, plainFile] as never;
  return store;
};

// Spec: private-rooms/editor-integration, "Document Server capability check before opening"
describe("FilesStore.openDocEditor on an encrypted file", () => {
  let open: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    open = vi.fn();
    vi.stubGlobal("open", open);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Capability absent", () => {
    storeWith(false).openDocEditor(7);

    expect(toastr.info).toHaveBeenCalledWith(
      "Common:PrivateRoomEditorNotSupported",
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("Capability present", () => {
    storeWith(true).openDocEditor(7);

    expect(toastr.info).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0][0])).toContain("fileId=7");
  });

  it("Plain file without the capability", () => {
    storeWith(false).openDocEditor(8);

    expect(toastr.info).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
  });
});
