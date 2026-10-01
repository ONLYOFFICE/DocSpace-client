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

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { socketListeners } = vi.hoisted(() => ({
  socketListeners: new Map<string, Set<(opt?: unknown) => void>>(),
}));

vi.mock("@docspace/shared/api/ai", () => ({
  getAIAgents: vi.fn(),
  getAIAgent: vi.fn(),
}));

vi.mock("@docspace/ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: (event: string, cb: (opt?: unknown) => void) => {
      if (!socketListeners.has(event)) socketListeners.set(event, new Set());
      socketListeners.get(event)?.add(cb);
    },
    off: (event: string, cb: (opt?: unknown) => void) => {
      socketListeners.get(event)?.delete(cb);
    },
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));

import { getAIAgent, getAIAgents } from "@docspace/shared/api/ai";
import type { TAgent } from "@docspace/shared/api/ai/types";
import { SocketEvents, type TOptSocket } from "@docspace/ui-kit/utils/socket";

import { useAiAgentsPickerActions } from "../useAiAgentsPickerActions";

const AGENTS_ROOT_ID = 77;

const agent = (id: number, title: string) => ({ id, title }) as TAgent;

const emitModifyFolder = (opt: TOptSocket) => {
  for (const cb of socketListeners.get(SocketEvents.ModifyFolder) ?? []) {
    cb(opt);
  }
};

const mockAgents = (agents: TAgent[]) => {
  vi.mocked(getAIAgents).mockResolvedValue({
    folders: agents,
    current: { id: AGENTS_ROOT_ID },
  } as unknown as Awaited<ReturnType<typeof getAIAgents>>);
  vi.mocked(getAIAgent).mockImplementation(
    async (id) => ({ id, profileId: `profile-${id}` }) as TAgent,
  );
};

const agentTitles = (
  result: ReturnType<typeof useAiAgentsPickerActions>,
): string[] =>
  (result.actions[0]?.items ?? []).map((item) => String(item.text));

describe("useAiAgentsPickerActions", () => {
  it("does not load agents while disabled", () => {
    mockAgents([agent(1, "Alpha")]);

    const { result } = renderHook(() =>
      useAiAgentsPickerActions(false, vi.fn()),
    );

    expect(getAIAgents).not.toHaveBeenCalled();
    expect(result.current.actions).toEqual([]);
  });

  it("reloads the list each time it is enabled again", async () => {
    mockAgents([agent(1, "Alpha"), agent(2, "Beta")]);

    const { result, rerender } = renderHook(
      ({ enabled }) => useAiAgentsPickerActions(enabled, vi.fn()),
      { initialProps: { enabled: true } },
    );

    await waitFor(() =>
      expect(agentTitles(result.current)).toEqual(["Alpha", "Beta"]),
    );

    // The AI Agents section disables the chat: an agent is deleted and
    // another one created there, then the user returns to Files.
    rerender({ enabled: false });
    mockAgents([agent(2, "Beta"), agent(3, "Gamma")]);
    rerender({ enabled: true });

    await waitFor(() =>
      expect(agentTitles(result.current)).toEqual(["Beta", "Gamma"]),
    );
    expect(getAIAgents).toHaveBeenCalledTimes(2);
  });

  it("keeps the last loaded list while a reload fails", async () => {
    mockAgents([agent(1, "Alpha")]);

    const { result, rerender } = renderHook(
      ({ enabled }) => useAiAgentsPickerActions(enabled, vi.fn()),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => expect(agentTitles(result.current)).toEqual(["Alpha"]));

    rerender({ enabled: false });
    vi.mocked(getAIAgents).mockRejectedValue(new Error("Network"));
    rerender({ enabled: true });

    await waitFor(() => expect(getAIAgents).toHaveBeenCalledTimes(2));
    expect(agentTitles(result.current)).toEqual(["Alpha"]);
  });

  it("drops a load superseded while its details are in flight", async () => {
    let resolveStale: (value: TAgent) => void = () => {};
    vi.mocked(getAIAgents).mockResolvedValueOnce({
      folders: [agent(1, "Stale")],
    } as unknown as Awaited<ReturnType<typeof getAIAgents>>);
    vi.mocked(getAIAgent).mockImplementationOnce(
      () =>
        new Promise<TAgent>((resolve) => {
          resolveStale = resolve;
        }),
    );

    const { result, rerender } = renderHook(
      ({ enabled }) => useAiAgentsPickerActions(enabled, vi.fn()),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => expect(getAIAgent).toHaveBeenCalledTimes(1));

    rerender({ enabled: false });
    mockAgents([agent(2, "Fresh")]);
    rerender({ enabled: true });

    await waitFor(() => expect(agentTitles(result.current)).toEqual(["Fresh"]));

    resolveStale({ id: 1, profileId: "profile-1" } as TAgent);
    await Promise.resolve();

    expect(agentTitles(result.current)).toEqual(["Fresh"]);
  });

  describe("socket", () => {
    const renderLoaded = async () => {
      mockAgents([agent(1, "Alpha")]);
      const rendered = renderHook(
        ({ enabled }) => useAiAgentsPickerActions(enabled, vi.fn()),
        { initialProps: { enabled: true } },
      );
      await waitFor(() =>
        expect(agentTitles(rendered.result.current)).toEqual(["Alpha"]),
      );
      return rendered;
    };

    it("reloads once for a burst of events about an agent", async () => {
      const { result } = await renderLoaded();
      mockAgents([agent(1, "Alpha"), agent(2, "Beta")]);

      act(() => {
        emitModifyFolder({
          cmd: "create",
          type: "folder",
          id: 2,
          data: JSON.stringify({ id: 2, parentId: AGENTS_ROOT_ID }),
        });
        emitModifyFolder({
          cmd: "update",
          type: "folder",
          id: 2,
          data: JSON.stringify({ id: 2, parentId: AGENTS_ROOT_ID }),
        });
      });

      await waitFor(() =>
        expect(agentTitles(result.current)).toEqual(["Alpha", "Beta"]),
      );
      expect(getAIAgents).toHaveBeenCalledTimes(2);
    });

    it("reloads when a listed agent is deleted", async () => {
      const { result } = await renderLoaded();
      mockAgents([]);

      act(() => {
        emitModifyFolder({ cmd: "delete", type: "folder", id: 1 });
      });

      await waitFor(() => expect(result.current.actions).toEqual([]));
    });

    it("ignores events about other folders and files", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      try {
        await renderLoaded();

        act(() => {
          emitModifyFolder({
            cmd: "create",
            type: "folder",
            id: 9,
            data: JSON.stringify({ id: 9, parentId: 5 }),
          });
          emitModifyFolder({
            cmd: "delete",
            type: "file",
            id: 1,
          });
          vi.advanceTimersByTime(1000);
        });

        expect(getAIAgents).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it("stops listening while disabled", async () => {
      const { rerender } = await renderLoaded();

      rerender({ enabled: false });

      expect(socketListeners.get(SocketEvents.ModifyFolder)?.size ?? 0).toBe(
        0,
      );
    });
  });
});
