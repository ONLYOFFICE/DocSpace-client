// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestFilesActionsStore } from "./testHarness";

let navigate: ReturnType<typeof vi.fn>;
beforeEach(() => {
  navigate = vi.fn();
  (window as unknown as { DocSpace: unknown }).DocSpace = {
    location: { pathname: "/rooms", search: "", state: {}, hash: "" },
    navigate,
  };
});

describe("FilesActionsStore — checkAndOpenLocationAction search handoff", () => {
  it("puts the title into the URL search for a plain file", async () => {
    const setPendingClientSearch = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { setPendingClientSearch },
    });

    await store.checkAndOpenLocationAction({
      id: 5,
      title: "report.docx",
      parentId: 42,
    });

    expect(navigate).toHaveBeenCalledTimes(1);
    const url = navigate.mock.calls[0][0] as string;
    expect(url).toContain("search=report.docx");
    expect(setPendingClientSearch).not.toHaveBeenCalled();
  });

  it("hands the title to the client search for an encrypted file", async () => {
    const setPendingClientSearch = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { setPendingClientSearch },
    });

    await store.checkAndOpenLocationAction({
      id: 5,
      title: "secret.docx",
      parentId: 42,
      encrypted: true,
    });

    expect(navigate).toHaveBeenCalledTimes(1);
    const url = navigate.mock.calls[0][0] as string;
    expect(url).not.toContain("search=");
    expect(setPendingClientSearch).toHaveBeenCalledWith({
      folderId: 42,
      query: "secret.docx",
    });
  });
});
