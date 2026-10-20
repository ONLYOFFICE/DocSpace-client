// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../filesStore/__tests__/testHarness";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";

import * as filesApi from "@docspace/shared/api/files";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import type { TTranslation } from "@docspace/shared/types";
import type UploadDataStore from "../../UploadDataStore";

declare function allowConsoleError(matcher: RegExp | string): void;

const t = ((key: string) => key) as unknown as TTranslation;
const moveSource = { fileId: 42, title: "secret.docx" };

const finishUpload = (store: UploadDataStore, uploaded: boolean) =>
  store.checkChunkUpload({
    t,
    path: [],
    res: {
      uploaded,
      id: uploaded ? 555 : null,
      file: uploaded ? makeFileInfo({ id: 555, folderId: 7 }) : null,
    },
    index: 1,
    indexOfFile: 0,
    chunksLength: 1,
    resolve: vi.fn(),
  } as unknown as Parameters<UploadDataStore["checkChunkUpload"]>[0]);

const storeWithMovedCopy = () => {
  const harness = createTestUploadDataStore();
  const entry = makeUploadFile({
    uniqueId: "copy",
    inAction: true,
    toFolderId: 7,
    file: makeBrowserFile("secret.docx", 16, {
      uploadContext: { isPrivate: false, moveSource },
    }) as never,
  });
  harness.store.files = [entry];
  harness.store.uploadedFilesHistory = [{ ...entry }];
  harness.store.currentUploadNumber = 1;
  (harness.store as unknown as Record<string, unknown>).startSessionFunc =
    vi.fn();
  (harness.store as unknown as Record<string, unknown>).refreshFiles = vi
    .fn()
    .mockResolvedValue(undefined);
  return harness;
};

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("UploadDataStore - source of a moved encrypted file", () => {
  it("deletes the source once the decrypted copy is uploaded", () => {
    const { store } = storeWithMovedCopy();
    const deleteSource = vi.fn(async () => {});
    store.deleteMovedEncryptedSource = deleteSource;

    finishUpload(store, true);

    expect(deleteSource).toHaveBeenCalledWith(moveSource);
  });

  it("keeps the source while the decrypted copy is still uploading", () => {
    const { store } = storeWithMovedCopy();
    const deleteSource = vi.fn(async () => {});
    store.deleteMovedEncryptedSource = deleteSource;

    finishUpload(store, false);

    expect(deleteSource).not.toHaveBeenCalled();
  });

  it("deletes the source permanently, then drops it from the list", async () => {
    const { store, filesStore } = createTestUploadDataStore();
    vi.mocked(filesApi.removeFiles).mockResolvedValue([
      { id: "op-1", finished: false },
    ] as never);
    const loop = vi.fn(async () => ({ id: "op-1", finished: true }));
    store.loopFilesOperations = loop as never;
    const removeFromList = vi.fn();
    filesStore.removeFiles = removeFromList;

    await store.deleteMovedEncryptedSource(moveSource);

    expect(filesApi.removeFiles).toHaveBeenCalledWith([], [42], false, true);
    expect(loop).toHaveBeenCalledTimes(1);
    expect(removeFromList).toHaveBeenCalledWith([42]);
    expect(loop.mock.invocationCallOrder[0]).toBeLessThan(
      removeFromList.mock.invocationCallOrder[0],
    );
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("Move with a failed copy: a failed delete keeps the source and names it", async () => {
    allowConsoleError(/Failed to delete the source of a moved file/);
    const { store, filesStore } = createTestUploadDataStore();
    vi.mocked(filesApi.removeFiles).mockResolvedValue([
      { id: "op-1", finished: false },
    ] as never);
    store.loopFilesOperations = vi.fn(async () => {
      throw new Error("forbidden");
    }) as never;
    const removeFromList = vi.fn();
    filesStore.removeFiles = removeFromList;

    await store.deleteMovedEncryptedSource(moveSource);

    expect(removeFromList).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedMovePartialFailure",
    );
  });
});
