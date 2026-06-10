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

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/api/rooms", () => ({
  getRooms: vi.fn(),
}));

vi.mock(
  "@docspace/shared/services/private-room/room-encryption",
  () => ({
    rotateOwnIdentityForRoom: vi.fn(),
  }),
);

import { toastr } from "@docspace/ui-kit/components/toast";
import { getRooms } from "@docspace/shared/api/rooms";
import { rotateOwnIdentityForRoom } from "@docspace/shared/services/private-room/room-encryption";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

import { useRotateIdentityForRooms } from "../useRotateIdentityForRooms";

const makeIdentity = (): IdentityKeyPair => ({
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
});

const makeRoomsResponse = (rooms: { id: number; private: boolean }[]) => ({
  folders: rooms.map((r) => ({ id: r.id, private: r.private })),
  files: [],
  startIndex: 0,
  total: rooms.length,
  count: rooms.length,
  new: 0,
  current: {},
  pathParts: [],
});

describe("useRotateIdentityForRooms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when oldIdentity is null (no unlocked key before generation)", async () => {
    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(null, makeIdentity(), "user1", "test-key-id");
    });

    expect(getRooms).not.toHaveBeenCalled();
    expect(rotateOwnIdentityForRoom).not.toHaveBeenCalled();
    expect(toastr.success).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("does nothing when there are no private rooms", async () => {
    vi.mocked(getRooms).mockResolvedValueOnce(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      makeRoomsResponse([{ id: 1, private: false }]) as any,
    );

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    expect(rotateOwnIdentityForRoom).not.toHaveBeenCalled();
    expect(toastr.success).not.toHaveBeenCalled();
  });

  it("calls rotateOwnIdentityForRoom for each private room when old identity is available", async () => {
    vi.mocked(getRooms).mockResolvedValueOnce(
      makeRoomsResponse([
        { id: 10, private: true },
        { id: 20, private: true },
        { id: 30, private: false },
        // biome-ignore lint/suspicious/noExplicitAny: test mock
      ]) as any,
    );
    vi.mocked(rotateOwnIdentityForRoom).mockResolvedValue([
      { fileId: 1, success: true },
    ]);

    const oldIdentity = makeIdentity();
    const newIdentity = makeIdentity();
    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(oldIdentity, newIdentity, "user1", "test-key-id");
    });

    expect(rotateOwnIdentityForRoom).toHaveBeenCalledTimes(2);
    expect(rotateOwnIdentityForRoom).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        currentUserId: "user1",
        oldIdentity,
        newIdentity,
      }),
    );
    expect(rotateOwnIdentityForRoom).toHaveBeenCalledWith(
      20,
      expect.objectContaining({
        currentUserId: "user1",
        oldIdentity,
        newIdentity,
      }),
    );
  });

  it("shows success toast when all files rotated successfully", async () => {
    vi.mocked(getRooms).mockResolvedValueOnce(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      makeRoomsResponse([{ id: 10, private: true }]) as any,
    );
    vi.mocked(rotateOwnIdentityForRoom).mockResolvedValue([
      { fileId: 1, success: true },
      { fileId: 2, success: true },
    ]);

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    expect(toastr.success).toHaveBeenCalledWith("Common:RotatingIdentitySuccess");
    expect(toastr.warning).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("shows warning toast when some files fail (partial failure)", async () => {
    vi.mocked(getRooms).mockResolvedValueOnce(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      makeRoomsResponse([{ id: 10, private: true }]) as any,
    );
    vi.mocked(rotateOwnIdentityForRoom).mockResolvedValue([
      { fileId: 1, success: true },
      { fileId: 2, success: false, error: "unwrap failed" },
      { fileId: 3, success: false, error: "unwrap failed" },
    ]);

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    expect(toastr.warning).toHaveBeenCalledTimes(1);
    // The i18n mock returns the key string unchanged; the count arg is passed
    // separately to t() but the mock discards it, so only the key is received.
    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:RotatingIdentityPartialFailure",
    );
    expect(toastr.success).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("shows error toast when all rooms fail entirely", async () => {
    vi.mocked(getRooms).mockResolvedValueOnce(
      makeRoomsResponse([
        { id: 10, private: true },
        { id: 20, private: true },
        // biome-ignore lint/suspicious/noExplicitAny: test mock
      ]) as any,
    );
    // rotateOwnIdentityForRoom throws for both rooms
    vi.mocked(rotateOwnIdentityForRoom).mockRejectedValue(
      new Error("network error"),
    );

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    expect(toastr.error).toHaveBeenCalledWith("Common:RotatingIdentityFailed");
    expect(toastr.success).not.toHaveBeenCalled();
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("shows error toast when getRooms itself fails", async () => {
    vi.mocked(getRooms).mockRejectedValueOnce(new Error("403 Forbidden"));

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    expect(rotateOwnIdentityForRoom).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith("Common:RotatingIdentityFailed");
  });

  it("rotationProgress is null when idle", () => {
    const { result } = renderHook(() => useRotateIdentityForRooms());
    expect(result.current.rotationProgress).toBeNull();
  });

  it("rotationProgress resets to null after rotation completes", async () => {
    vi.mocked(getRooms).mockResolvedValueOnce(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      makeRoomsResponse([{ id: 10, private: true }]) as any,
    );
    vi.mocked(rotateOwnIdentityForRoom).mockResolvedValue([
      { fileId: 1, success: true },
    ]);

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    // After completion progress should be null again.
    expect(result.current.rotationProgress).toBeNull();
  });

  it("paginates through multiple pages of rooms", async () => {
    // First page: 1 private room, total=2 rooms, so more pages exist.
    vi.mocked(getRooms)
      .mockResolvedValueOnce({
        folders: [{ id: 10, private: true }],
        files: [],
        startIndex: 0,
        total: 2,
        count: 1,
        new: 0,
        current: {},
        pathParts: [],
        // biome-ignore lint/suspicious/noExplicitAny: test mock
      } as any)
      // Second page: 1 private room, totalFetched=2 === total so stops.
      .mockResolvedValueOnce({
        folders: [{ id: 20, private: true }],
        files: [],
        startIndex: 1,
        total: 2,
        count: 1,
        new: 0,
        current: {},
        pathParts: [],
        // biome-ignore lint/suspicious/noExplicitAny: test mock
      } as any);
    vi.mocked(rotateOwnIdentityForRoom).mockResolvedValue([]);

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    expect(getRooms).toHaveBeenCalledTimes(2);
    expect(rotateOwnIdentityForRoom).toHaveBeenCalledTimes(2);
  });

  it("continues processing remaining rooms even if one room throws", async () => {
    vi.mocked(getRooms).mockResolvedValueOnce(
      makeRoomsResponse([
        { id: 10, private: true },
        { id: 20, private: true },
        // biome-ignore lint/suspicious/noExplicitAny: test mock
      ]) as any,
    );
    vi.mocked(rotateOwnIdentityForRoom)
      .mockRejectedValueOnce(new Error("room 10 failed"))
      .mockResolvedValueOnce([{ fileId: 99, success: true }]);

    const { result } = renderHook(() => useRotateIdentityForRooms());

    await act(async () => {
      await result.current.rotateForAllRooms(
        makeIdentity(),
        makeIdentity(),
        "user1",
        "test-key-id",
      );
    });

    // Both rooms were attempted.
    expect(rotateOwnIdentityForRoom).toHaveBeenCalledTimes(2);
    // Room 10 threw so counted as failure (totalFailed=1); room 20 had 1 success.
    // totalDone=1, totalFailed=1 → partial failure warning.
    expect(toastr.warning).toHaveBeenCalledTimes(1);
  });
});
