// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

import api from "@docspace/shared/api";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type { TTranslation } from "@docspace/shared/types";

import { setPinAction } from "../helpers";

const t = ((key: string, options?: { count?: number }) =>
  options?.count === undefined ? key : `${key}:${options.count}`) as TTranslation;

describe("setPinAction — the notice", () => {
  beforeEach(() => {
    vi.spyOn(api.rooms, "pinRoom").mockResolvedValue({ id: 1 } as never);
    vi.spyOn(api.rooms, "unpinRoom").mockResolvedValue({ id: 1 } as never);
    vi.mocked(toastr.success).mockClear();
  });

  it.each([
    ["pin", 1, false, "Common:RoomPinned"],
    ["unpin", 1, false, "Common:RoomUnpinned"],
    ["pin", 1, true, "Common:AgentPinned"],
    ["unpin", 1, true, "Common:AgentUnpinned"],
    ["pin", [1, 2], true, "Common:AgentsPinned:2"],
    ["unpin", [1, 2], true, "Common:AgentsUnpinned:2"],
    ["pin", [1, 2], false, "Common:RoomsPinned:2"],
  ] as const)(
    "%s of %j (agents: %s) says %s",
    async (action, id, ofAgents, notice) => {
      await setPinAction(
        action,
        id as number | number[],
        t,
        ofAgents,
      );

      expect(toastr.success).toHaveBeenCalledWith(notice);
    },
  );
});
