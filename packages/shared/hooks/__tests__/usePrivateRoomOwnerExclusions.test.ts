// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MembersSubjectType } from "../../enums";

vi.mock("../../api/rooms", () => ({ getRoomMembers: vi.fn() }));
vi.mock("../../api/people", () => ({ getUserList: vi.fn() }));

import { getRoomMembers } from "../../api/rooms";
import { getUserList } from "../../api/people";
import { usePrivateRoomOwnerExclusions } from "../usePrivateRoomOwnerExclusions";

const ROOM_ID = 14;

const userIds = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${prefix}-${i}`);

/** A list route answering pages of 100 out of the given ids. */
const pagedMembers = (ids: string[]) =>
  vi.mocked(getRoomMembers).mockImplementation(
    async (_room, { startIndex = 0, count = 100 }) =>
      ({
        items: ids.slice(startIndex, startIndex + count).map((id) => ({
          subjectType: MembersSubjectType.User,
          sharedTo: { id },
        })),
        total: ids.length,
      }) as never,
  );

const pagedAdmins = (ids: string[]) =>
  vi.mocked(getUserList).mockImplementation(
    async (filter) =>
      ({
        items: ids
          .slice(
            filter!.page * filter!.pageCount,
            (filter!.page + 1) * filter!.pageCount,
          )
          .map((id) => ({ id })),
        total: ids.length,
      }) as never,
  );

const exclusions = () =>
  renderHook(() =>
    usePrivateRoomOwnerExclusions({
      isPrivateRoom: true,
      roomId: ROOM_ID,
      userId: "me",
    }),
  );

describe("usePrivateRoomOwnerExclusions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Room with more than 100 members", async () => {
    const members = userIds("member", 150);
    pagedMembers(members);
    pagedAdmins([members[149]]);

    const { result } = exclusions();

    await waitFor(() => expect(result.current.excludeReady).toBe(true));
    expect(result.current.excludeItems).toEqual(["me"]);
    expect(getRoomMembers).toHaveBeenCalledTimes(2);
  });

  it("Portal with more than 100 administrators", async () => {
    const admins = userIds("admin", 150);
    pagedMembers([]);
    pagedAdmins(admins);

    const { result } = exclusions();

    await waitFor(() => expect(result.current.excludeReady).toBe(true));
    expect(result.current.excludeItems).toContain("admin-149");
    expect(getUserList).toHaveBeenCalledTimes(2);
  });

  it("Members cannot be read", async () => {
    vi.mocked(getRoomMembers).mockRejectedValue(new Error("403"));
    pagedAdmins([]);

    const { result } = exclusions();

    await waitFor(() => expect(result.current.excludeFailed).toBe(true));
    expect(result.current.excludeReady).toBe(false);
  });
});
