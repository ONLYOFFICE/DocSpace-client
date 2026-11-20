import React from "react";
import type { TFunction } from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

import { DeviceType, FileStatus } from "../../enums";
import { DecryptionError } from "../../services/encryption/errors";
import type { MediaViewerProps } from "./MediaViewer.types";

const viewer = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}));

vi.mock("./sub-components/ViewerWrapper", () => ({
  ViewerWrapper: (props: Record<string, unknown>) => {
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

const item = (id: number, title: string) => ({
  id,
  fileId: id,
  src: `file-${id}`,
  title,
  fileExst: ".png",
  version: 1,
  versionGroup: 1,
  thumbnailUrl: "",
  fileStatus: FileStatus.None,
  canShare: false,
  encrypted: true,
});

const PLAYLIST = [item(1, "photo.png"), item(2, "shared.png")];

// GET files/{id}/access: file 1 holds no entry for bob, file 2 holds his.
const accessFor = async (fileId: number) =>
  ({
    fileKeys: fileId === 1 ? [] : [{ userId: "bob" }],
  }) as Awaited<ReturnType<typeof getFileEncryptionAccess>>;

// The message is the key followed by its interpolation values.
const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key} ${JSON.stringify(options)}` : key) as unknown as TFunction;

const props = (playlistPos: number): MediaViewerProps =>
  ({
    visible: true,
    files: [],
    playlist: PLAYLIST,
    playlistPos,
    currentFileId: PLAYLIST[playlistPos].id,
    userAccess: true,
    isPreviewFile: false,
    extsImagePreviewed: [".png"],
    deleteDialogVisible: false,
    pluginContextMenuItems: [],
    currentDeviceType: DeviceType.desktop,
    isPublicFile: false,
    autoPlay: false,
    userId: "bob",
    currentRoomId: 7,
    t,
    getIcon: () => "",
    onClose: vi.fn(),
    nextMedia: vi.fn(),
    prevMedia: vi.fn(),
    onChangeUrl: vi.fn(),
  }) as unknown as MediaViewerProps;

describe("The media viewer reports a file that is not shared yet as no access", () => {
  beforeEach(() => {
    viewer.props = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })),
    );
    vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:shown") });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getFileEncryptionAccess).mockImplementation(accessFor as never);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("Image not shared with the user yet", async () => {
    render(<MediaViewer {...props(0)} />);

    await waitFor(() =>
      expect(viewer.props?.decryptionError).toBe("Common:EncryptedFileNoAccessYet"),
    );
    expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
  });

  it("Not shared yet while the key is locked", async () => {
    render(<MediaViewer {...props(0)} />);

    await waitFor(() =>
      expect(viewer.props?.decryptionError).toBe("Common:EncryptedFileNoAccessYet"),
    );
    expect(requireUnlock).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("Access answer without fileKeys", async () => {
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({} as never);

    render(<MediaViewer {...props(1)} />);

    await waitFor(() =>
      expect(viewer.props?.decryptionError).toBe("Common:EncryptedFileNoAccessYet"),
    );
    expect(requireUnlock).not.toHaveBeenCalled();
  });

  it("File wrapped but damaged", async () => {
    vi.mocked(unwrapDekForCurrentUser).mockResolvedValue(
      {} as Awaited<ReturnType<typeof unwrapDekForCurrentUser>>,
    );
    vi.mocked(decryptFile).mockRejectedValue(new DecryptionError("tag mismatch"));

    render(<MediaViewer {...props(1)} />);

    await waitFor(() =>
      expect(viewer.props?.decryptionError).toBe(
        'Common:EncryptionDecryptPartialFailed {"fileNames":"shared.png"}',
      ),
    );
  });

  it("Next file in the viewer", async () => {
    vi.mocked(unwrapDekForCurrentUser).mockResolvedValue(
      {} as Awaited<ReturnType<typeof unwrapDekForCurrentUser>>,
    );
    vi.mocked(decryptFile).mockResolvedValue({
      data: new Blob([new Uint8Array([1, 2, 3])]),
      fileName: "shared.png",
    });

    const { rerender } = render(<MediaViewer {...props(0)} />);
    await waitFor(() =>
      expect(viewer.props?.decryptionError).toBe("Common:EncryptedFileNoAccessYet"),
    );

    rerender(<MediaViewer {...props(1)} />);

    await waitFor(() => expect(viewer.props?.fileUrl).toBe("blob:shown"));
    expect(viewer.props?.decryptionError).toBeUndefined();
  });
});
