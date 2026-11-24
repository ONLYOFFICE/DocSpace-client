import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DecryptFileParams } from "@onlyoffice/apps-ui-kit/media-viewer/MediaViewer.types";

import { DecryptionError, NoAccessError, KeyReplacedError } from "../../services/encryption/errors";
import type { MediaViewerProps } from "./MediaViewer.types";

// The viewer itself lives in ui-kit; this wrapper only hands it decryptFile.
const viewer = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}));

vi.mock("@onlyoffice/apps-ui-kit/media-viewer/MediaViewer", () => ({
  default: (props: Record<string, unknown>) => {
    viewer.props = props;
    return null;
  },
}));

vi.mock("../../api/files", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getFileEncryptionAccess: vi.fn(),
}));

vi.mock("../../services/encryption/secret-storage", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  requireUnlock: vi.fn(async () => ({})),
}));

vi.mock("../../services/private-room/room-member-keys", () => ({
  loadRoomMemberKeysSafe: vi.fn(async () => []),
}));

vi.mock("../../services/encryption/room-file-access", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  unwrapDekForCurrentUser: vi.fn(),
}));

vi.mock("../../services/encryption/file-keys", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  decryptFile: vi.fn(),
}));

import MediaViewer from "./MediaViewer";
import { getFileEncryptionAccess } from "../../api/files";
import { requireUnlock } from "../../services/encryption/secret-storage";
import { unwrapDekForCurrentUser } from "../../services/encryption/room-file-access";
import { decryptFile } from "../../services/encryption/file-keys";

// GET files/{id}/access: file 1 holds no entry for bob, file 2 holds his.
const accessFor = async (fileId: number) =>
  ({
    fileKeys: fileId === 1 ? [] : [{ userId: "bob" }],
  }) as Awaited<ReturnType<typeof getFileEncryptionAccess>>;

const params = (fileId: number): DecryptFileParams =>
  ({
    src: `file-${fileId}`,
    fileId,
    roomId: 7,
    signal: new AbortController().signal,
  }) as DecryptFileParams;

const kitDecryptFile = (userId = "bob") => {
  render(<MediaViewer {...({ userId } as unknown as MediaViewerProps)} />);
  return viewer.props?.decryptFile as (p: DecryptFileParams) => Promise<unknown>;
};

describe("The media viewer reports a file that is not shared yet as no access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewer.props = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })),
    );
    vi.mocked(getFileEncryptionAccess).mockImplementation(accessFor as never);
  });

  it("Not shared yet while the key is locked", async () => {
    await expect(kitDecryptFile()(params(1))).rejects.toBeInstanceOf(NoAccessError);
    expect(requireUnlock).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
  });

  it("Media viewer: a file wrapped for a previous key", async () => {
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      userKeys: [{ id: "key-now" }],
      fileKeys: [{ userId: "bob", publicKeyId: "key-before" }],
    } as never);

    await expect(kitDecryptFile()(params(2))).rejects.toBeInstanceOf(
      KeyReplacedError,
    );
    expect(requireUnlock).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("Access answer without fileKeys", async () => {
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({} as never);

    await expect(kitDecryptFile()(params(2))).rejects.toBeInstanceOf(NoAccessError);
    expect(requireUnlock).not.toHaveBeenCalled();
  });

  it("File wrapped but damaged", async () => {
    vi.mocked(unwrapDekForCurrentUser).mockResolvedValue(
      {} as Awaited<ReturnType<typeof unwrapDekForCurrentUser>>,
    );
    vi.mocked(decryptFile).mockRejectedValue(new DecryptionError("tag mismatch"));

    await expect(kitDecryptFile()(params(2))).rejects.toBeInstanceOf(DecryptionError);
  });

  it("Shared file is decrypted", async () => {
    const data = new Blob([new Uint8Array([1, 2, 3])]);
    vi.mocked(unwrapDekForCurrentUser).mockResolvedValue(
      {} as Awaited<ReturnType<typeof unwrapDekForCurrentUser>>,
    );
    vi.mocked(decryptFile).mockResolvedValue({ data, fileName: "shared.png" });

    await expect(kitDecryptFile()(params(2))).resolves.toEqual({
      data,
      fileName: "shared.png",
    });
    expect(requireUnlock).toHaveBeenCalledWith("bob");
  });

  it("Image not shared with the user yet shows its own message", () => {
    const t = ((key: string) => key) as unknown as MediaViewerProps["t"];
    render(<MediaViewer {...({ userId: "bob", t } as unknown as MediaViewerProps)} />);
    const message = viewer.props?.getDecryptionErrorMessage as (e: Error) => string | null;

    expect(message(new NoAccessError("bob"))).toBe("Common:EncryptedFileNoAccessYet");
    expect(message(new KeyReplacedError())).toBe("Common:EncryptedFileKeyReplaced");
    // A damaged file has no message of its own: the viewer shows the general one with its name.
    expect(message(new DecryptionError("tag mismatch"))).toBeNull();
  });
});
