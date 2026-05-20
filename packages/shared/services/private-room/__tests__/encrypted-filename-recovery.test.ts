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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  recoverEncryptedFilenames,
  type RecoveryCandidate,
} from "../encrypted-filename-recovery";
import {
  getCachedEncryptedFilename,
  rememberEncryptedFilename,
} from "../../encryption/filename-cache";
import type { IdentityKeyPair } from "../../encryption/types";

vi.mock("../../encryption/file-keys", () => ({
  wipeDek: vi.fn(),
}));
vi.mock("../../encryption/room-file-access", () => ({
  unwrapDekForCurrentUser: vi.fn(),
}));
vi.mock("../../encryption/streaming-encryption", () => ({
  parseDSE3Header: vi.fn(),
  decryptFileNameRaw: vi.fn(),
}));
vi.mock("../../../api/files", () => ({
  getFileEncryptionAccess: vi.fn(),
}));
vi.mock("../../../api/privacy", () => ({
  getRoomEncryptionKeys: vi.fn(),
}));

import { wipeDek } from "../../encryption/file-keys";
import { getFileEncryptionAccess } from "../../../api/files";
import { getRoomEncryptionKeys } from "../../../api/privacy";
import { unwrapDekForCurrentUser } from "../../encryption/room-file-access";
import {
  decryptFileNameRaw,
  parseDSE3Header,
} from "../../encryption/streaming-encryption";

const identity: IdentityKeyPair = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
} as IdentityKeyPair;

const makeCandidates = (ids: number[]): RecoveryCandidate[] =>
  ids.map((id) => ({ id, viewUrl: `https://files/${id}/view` }));

const okHeaderBytes = (size = 64) =>
  // TS lib.dom rejects Uint8Array<ArrayBufferLike> as BodyInit on some lib
  // versions; Response accepts it at runtime.
  new Response(new Uint8Array(size) as unknown as BodyInit, { status: 206 });

const ROOM_ID = 42;

const happyMocks = () => {
  vi.mocked(parseDSE3Header).mockImplementation(() => ({
    encryptedName: new Uint8Array([1, 2, 3]),
    fileNonce: new Uint8Array(12),
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  }) as any);
  vi.mocked(getFileEncryptionAccess).mockResolvedValue({
    fileKeys: [{ userId: "u1" }],
    userKeys: [],
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  } as any);
  vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
    {
      id: "k1",
      userId: "u1",
      publicKey: "pk-u1",
      privateKeyEnc: "",
      // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any,
  ]);
  vi.mocked(unwrapDekForCurrentUser).mockResolvedValue(new Uint8Array(32));
  vi.mocked(decryptFileNameRaw).mockResolvedValue("real-name.docx");
};

describe("encryptedFilenameRecovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns immediately when candidates is empty (no fetch)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await recoverEncryptedFilenames([], "u1", identity, ROOM_ID);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("skips files whose name is already in the cache (no fetch)", async () => {
    rememberEncryptedFilename(7, "already-known.docx");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await recoverEncryptedFilenames(makeCandidates([7]), "u1", identity, ROOM_ID);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(getCachedEncryptedFilename(7)).toBe("already-known.docx");
  });

  it("writes the decrypted name to the cache on the happy path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(okHeaderBytes()),
    );
    happyMocks();

    await recoverEncryptedFilenames(makeCandidates([42]), "u1", identity, ROOM_ID);

    expect(getCachedEncryptedFilename(42)).toBe("real-name.docx");
    expect(wipeDek).toHaveBeenCalledTimes(1);
  });

  it("sends a Range request for the first HEADER_FETCH_BYTES", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okHeaderBytes());
    vi.stubGlobal("fetch", fetchSpy);
    happyMocks();

    await recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    expect(init).toBeDefined();
    expect(init.headers.Range).toBe("bytes=0-4095");
  });

  it("swallows fetch failures (no rejection, no cache write)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(
      recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID),
    ).resolves.toBeUndefined();
    expect(getCachedEncryptedFilename(1)).toBeNull();
    expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("swallows non-ok HTTP responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 416 })),
    );
    await expect(
      recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID),
    ).resolves.toBeUndefined();
    expect(getCachedEncryptedFilename(1)).toBeNull();
  });

  it("swallows parseDSE3Header throws (header tampered / not DSE3)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okHeaderBytes()));
    vi.mocked(parseDSE3Header).mockImplementation(() => {
      throw new Error("bad magic");
    });

    await expect(
      recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID),
    ).resolves.toBeUndefined();
    expect(getCachedEncryptedFilename(1)).toBeNull();
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("skips files whose header has no encryptedName (plaintext fallback)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okHeaderBytes()));
    vi.mocked(parseDSE3Header).mockImplementation(() => ({
      encryptedName: null,
      fileNonce: new Uint8Array(12),
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    }) as any);

    await recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID);

    expect(getCachedEncryptedFilename(1)).toBeNull();
    expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("returns early when getFileEncryptionAccess returns no fileKeys (no unwrap, no wipe)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okHeaderBytes()));
    happyMocks();
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [],
      userKeys: [],
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any);

    await recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID);

    expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("swallows unwrap throws AFTER getFileEncryptionAccess succeeded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okHeaderBytes()));
    happyMocks();
    vi.mocked(unwrapDekForCurrentUser).mockRejectedValue(
      new Error("no access"),
    );

    await expect(
      recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID),
    ).resolves.toBeUndefined();
    expect(getCachedEncryptedFilename(1)).toBeNull();
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("swallows decryptFileNameRaw throws but still wipes the DEK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okHeaderBytes()));
    happyMocks();
    vi.mocked(decryptFileNameRaw).mockRejectedValue(
      new Error("auth tag mismatch"),
    );

    await expect(
      recoverEncryptedFilenames(makeCandidates([1]), "u1", identity, ROOM_ID),
    ).resolves.toBeUndefined();
    expect(getCachedEncryptedFilename(1)).toBeNull();
    expect(wipeDek).toHaveBeenCalledTimes(1);
  });

  it("caps in-flight fetches at MAX_PARALLEL=5", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    let totalStarted = 0;
    const releases: Array<() => void> = [];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        inFlight += 1;
        totalStarted += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        return new Promise((resolve) => {
          releases.push(() => {
            inFlight -= 1;
            resolve(okHeaderBytes());
          });
        });
      }),
    );
    vi.mocked(parseDSE3Header).mockImplementation(() => ({
      encryptedName: null,
      fileNonce: new Uint8Array(12),
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    }) as any);
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
      {
        id: "k1",
        userId: "u1",
        publicKey: "pk-u1",
        privateKeyEnc: "",
        // biome-ignore lint/suspicious/noExplicitAny: test mock
      } as any,
    ]);

    const ids = Array.from({ length: 12 }, (_, i) => i + 1);
    const done = recoverEncryptedFilenames(
      makeCandidates(ids),
      "u1",
      identity,
      ROOM_ID,
    );

    for (let i = 0; i < 4; i++) await Promise.resolve();

    expect(inFlight).toBe(5);
    expect(maxInFlight).toBe(5);
    expect(totalStarted).toBe(5);

    while (releases.length > 0) {
      const r = releases.shift()!;
      r();
      await Promise.resolve();
      await Promise.resolve();
      expect(maxInFlight).toBe(5);
    }
    await done;

    expect(totalStarted).toBe(12);
    expect(maxInFlight).toBe(5);
  });
});
