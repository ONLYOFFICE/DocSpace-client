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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type TBatchOptions = {
  uploadIds: string[];
  files: File[];
  items: { file: File; uploadId: string; folderId: number; roomId: number }[];
  fileSignal: (uploadId: string) => AbortSignal | undefined;
  uploadStore: {
    reportProgress: (uploadId: string, percent: number) => void;
    setItemLabel: (uploadId: string, phase: string | undefined) => void;
    markRefused: (uploadId: string, refusal: "no-key" | "locked") => void;
    markQuotaError: (uploadId: string, error: unknown) => void;
  };
  onQuotaError: (error: unknown) => void;
  onFileError: (file: File, error: unknown, uploadId: string) => void;
  onFileComplete: (file: File, result: { uploadId: string }) => void;
  onNameClash: (
    clashes: { uploadId: string; file: File; renamed: string }[],
  ) => Promise<boolean>;
};

const env = vi.hoisted(() => ({
  orchestrate: vi.fn(),
  retry: vi.fn(),
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({
    requireIdentity: async () => ({ publicKey: "pk" }),
    suspendAutoLock: () => () => {},
  }),
}));

vi.mock("@docspace/shared/services/encryption/select-user-key", () => ({
  selectUserKey: () => ({ id: "key-1" }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { names?: string }) =>
      options?.names ? `${key}:${options.names}` : key,
  }),
}));

vi.mock("../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({
    userKeys: { userId: "user-1", publicKey: "user-pk" },
    keys: [{ id: "key-1" }],
  }),
}));

vi.mock(
  "@docspace/shared/services/private-room/encrypted-upload-orchestrator",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    orchestrateEncryptedUpload: env.orchestrate,
    retryEncryptedUploads: env.retry,
    nameSkippedMembers: async (members: { userId: string }[]) =>
      members.map((m) => ({ ...m, displayName: `name-${m.userId}` })),
  }),
);

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import {
  UploadStoreContextProvider,
  useUploadStore,
} from "@/app/(docspace)/_store/UploadStore";

import { PrivateEncryptedUploadStoreProvider } from "../_store/PrivateEncryptedUploadStore";
import {
  PrivateDialogsStoreProvider,
  usePrivateDialogsStore,
} from "../_store/PrivateDialogsStore";
import { useEncryptedUpload } from "./useEncryptedUpload";

const batchResult = (
  uploadIds: string[],
  overrides: Record<string, unknown> = {},
) => ({
  results: uploadIds.map((uploadId) => ({
    ok: true,
    uploadId,
    originalName: uploadId,
  })),
  quotaErrorRaised: false,
  aborted: false,
  skippedMembers: [],
  ...overrides,
});

describe("useEncryptedUpload", () => {
  let root: Root | null = null;
  let uploadFiles: ReturnType<typeof useEncryptedUpload>["uploadFiles"];
  let store: ReturnType<typeof useUploadStore>;
  let dialogs: ReturnType<typeof usePrivateDialogsStore>;

  const Probe = () => {
    uploadFiles = useEncryptedUpload().uploadFiles;
    store = useUploadStore();
    dialogs = usePrivateDialogsStore();
    return null;
  };

  const upload = async (names: string[]) => {
    let ok = false;
    await act(async () => {
      ({ ok } = await uploadFiles({
        files: names.map((name) => new File([name], name)),
        folderId: 5,
        roomId: 10,
      }));
    });
    return ok;
  };

  const rows = () =>
    store.items.map((i) => ({
      status: i.status,
      error: i.error,
      isQuotaError: !!i.isQuotaError,
      retry: !!i.retry,
    }));

  beforeEach(() => {
    env.orchestrate.mockReset();
    env.retry.mockReset();
    vi.mocked(toastr.error).mockClear();
    vi.mocked(toastr.info).mockClear();
    vi.mocked(toastr.warning).mockClear();
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <UploadStoreContextProvider>
          <PrivateEncryptedUploadStoreProvider>
            <PrivateDialogsStoreProvider>
              <Probe />
            </PrivateDialogsStoreProvider>
          </PrivateEncryptedUploadStoreProvider>
        </UploadStoreContextProvider>,
      ),
    );
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Encrypting phase: the panel's row shows the label, then the progress, under its own id", async () => {
    let during: { label?: string; percent: number } | null = null;
    env.orchestrate.mockImplementationOnce(async (options: TBatchOptions) => {
      const [id] = options.uploadIds;
      options.uploadStore.setItemLabel(id, "encrypting");
      const { label } = store.items[0];
      options.uploadStore.setItemLabel(id, undefined);
      options.uploadStore.reportProgress(id, 40);
      during = { label, percent: store.items[0].percent };
      options.onFileComplete(options.files[0], { uploadId: id });
      return batchResult(options.uploadIds);
    });

    const ok = await upload(["a.docx"]);

    expect(env.orchestrate.mock.calls[0][0]).toMatchObject({
      uploadIds: [store.items[0].uniqueId],
      folderId: 5,
      roomId: 10,
      userId: "user-1",
      publicKey: "user-pk",
      publicKeyId: "key-1",
    });
    expect(during).toEqual({ label: "Common:EncryptingFile", percent: 40 });
    expect(store.items[0].status).toBe("uploaded");
    expect(ok).toBe(true);
  });

  it("Uploader without a key: the rows fail with the key message", async () => {
    env.orchestrate.mockImplementationOnce(async (options: TBatchOptions) => {
      for (const id of options.uploadIds) {
        options.uploadStore.markRefused(id, "no-key");
      }
      return batchResult([], { refused: "no-key" });
    });

    const ok = await upload(["a.docx", "b.docx"]);

    expect(ok).toBe(false);
    expect(rows()).toEqual(
      Array(2).fill({
        status: "error",
        error: "Common:EncryptionKeysRequiredForUpload",
        isQuotaError: false,
        retry: true,
      }),
    );
    expect(toastr.info).not.toHaveBeenCalled();
  });

  it("Uploader declines to unlock: the rows fail as locked and the cancellation is announced", async () => {
    env.orchestrate.mockImplementationOnce(async (options: TBatchOptions) => {
      for (const id of options.uploadIds) {
        options.uploadStore.markRefused(id, "locked");
      }
      return batchResult([], { refused: "locked" });
    });

    await upload(["a.docx"]);

    expect(rows()).toEqual([
      {
        status: "error",
        error: "Common:EncryptionLockedUpload",
        isQuotaError: false,
        retry: true,
      },
    ]);
    expect(toastr.info).toHaveBeenCalledWith("Common:EncryptionUploadCancelled");
  });

  const quota = Object.assign(new Error("Request failed with status code 402"), {
    response: {
      status: 402,
      data: {
        error: {
          message: "The maximum file size is exceeded (1.5 KB).",
          type: "ASC.Core.Tenants.TenantQuotaException",
        },
      },
    },
  });

  const failOnQuota = () =>
    env.orchestrate.mockImplementationOnce(async (options: TBatchOptions) => {
      const [a, b, c] = options.uploadIds;
      options.onFileComplete(options.files[0], { uploadId: a });
      options.onFileError(options.files[1], quota, b);
      options.onQuotaError(quota);
      options.uploadStore.markQuotaError(b, quota);
      options.uploadStore.markQuotaError(c, quota);
      return batchResult([a], { quotaErrorRaised: true });
    });

  it("Quota exceeded mid-batch: the stopped rows show the quota failure with a retry", async () => {
    failOnQuota();

    await upload(["a.docx", "b.docx", "c.docx"]);

    expect(rows()).toEqual([
      { status: "uploaded", error: undefined, isQuotaError: false, retry: false },
      {
        status: "error",
        error: "The maximum file size is exceeded (1.5 KB).",
        isQuotaError: true,
        retry: true,
      },
      {
        status: "error",
        error: "The maximum file size is exceeded (1.5 KB).",
        isQuotaError: true,
        retry: true,
      },
    ]);
    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith(
      "The maximum file size is exceeded (1.5 KB).",
    );
  });

  it("Retry after navigation: the row is sent again to the folder it was queued for", async () => {
    failOnQuota();
    await upload(["a.docx", "b.docx", "c.docx"]);
    const failed = store.items[2];
    let statusDuring = "";
    env.retry.mockImplementationOnce(async (options: TBatchOptions) => {
      statusDuring = store.items[2].status;
      const [item] = options.items;
      options.onFileComplete(item.file, { uploadId: item.uploadId });
      return batchResult([item.uploadId]);
    });

    await act(async () => {
      failed.retry?.();
    });
    await vi.waitFor(() => expect(store.items[2].status).toBe("uploaded"));

    expect(env.retry.mock.calls[0][0].items).toEqual([
      {
        file: expect.objectContaining({ name: "c.docx" }),
        uploadId: failed.uniqueId,
        folderId: 5,
        roomId: 10,
      },
    ]);
    expect(statusDuring).toBe("uploading");
  });

  it("a cancelled row stops its upload and shows as cancelled", async () => {
    let abortedDuring = false;
    env.orchestrate.mockImplementationOnce(async (options: TBatchOptions) => {
      const [id] = options.uploadIds;
      const signal = options.fileSignal(id);
      store.cancelBatch();
      abortedDuring = !!signal?.aborted;
      return {
        results: [{ ok: false, uploadId: id, originalName: id, aborted: true }],
        quotaErrorRaised: false,
        aborted: true,
        skippedMembers: [],
      };
    });

    await upload(["a.docx"]);

    expect(abortedDuring).toBe(true);
    expect(store.items[0].status).toBe("cancelled");
  });

  describe("Upload with a clashing name", () => {
    const clashingUpload = () => {
      env.orchestrate.mockImplementation(async (options: TBatchOptions) => {
        const [uploadId] = options.uploadIds;
        const keepBoth = await options.onNameClash([
          { uploadId, file: options.files[0], renamed: "Report (1).docx" },
        ]);
        if (keepBoth) {
          options.onFileComplete(options.files[0], { uploadId });
          return batchResult(options.uploadIds);
        }
        return batchResult(options.uploadIds, {
              aborted: true,
              results: [
                {
                  ok: false,
                  uploadId,
                  originalName: "Report.docx",
                  aborted: true,
                },
              ],
            });
      });
      let ok: boolean | undefined;
      const done = act(async () => {
        ({ ok } = await uploadFiles({
          files: [new File(["x"], "Report.docx")],
          folderId: 5,
          roomId: 10,
        }));
      });
      return { done, ok: () => ok };
    };

    it("asks before sending and cancels the upload when the user cancels", async () => {
      const { done, ok } = clashingUpload();
      await vi.waitFor(() => expect(dialogs.nameClash).not.toBeNull());
      expect(dialogs.nameClash?.names).toEqual(["Report.docx"]);

      act(() => dialogs.answerNameClash(false));
      await done;

      expect(ok()).toBe(false);
      expect(dialogs.nameClash).toBeNull();
      expect(rows()).toEqual([
        { status: "cancelled", error: undefined, isQuotaError: false, retry: false },
      ]);
    });

    it("keeps both files when the user chooses to keep both", async () => {
      const { done, ok } = clashingUpload();
      await vi.waitFor(() => expect(dialogs.nameClash).not.toBeNull());

      act(() => dialogs.answerNameClash(true));
      await done;

      expect(ok()).toBe(true);
      expect(rows().map((r) => r.status)).toEqual(["uploaded"]);
    });
  });

  it("Member left out: the member is named once per session", async () => {
    const skipped = [{ userId: "bob", reason: "key-mismatch-refused" }];
    env.orchestrate.mockImplementation(async (options: TBatchOptions) =>
      batchResult(options.uploadIds, { skippedMembers: skipped }),
    );

    await upload(["a.docx"]);
    await upload(["b.docx"]);

    expect(toastr.warning).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:EncryptedUploadNotSharedWith:name-bob",
    );
  });
});
