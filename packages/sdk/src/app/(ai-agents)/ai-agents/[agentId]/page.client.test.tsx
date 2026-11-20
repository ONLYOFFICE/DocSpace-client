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

const env = vi.hoisted(() => {
  const aiRoomStore = {
    knowledgeId: null,
    resultId: null,
    currentTab: "chat",
    setRoomId: vi.fn(),
    setCurrentTab: vi.fn(),
    setSelectedResultFileId: vi.fn(),
    setIsErrorAIAgentNotAvailable: vi.fn(),
    setKnowledgeId: vi.fn(),
    setResultId: vi.fn(),
    setTitle: vi.fn(),
    setSecurity: vi.fn(),
    setAgent: vi.fn(),
    setAgentRoomId: vi.fn(),
  };
  return {
    aiRoomStore,
    loadingStore: { setIsSectionBodyLoading: vi.fn() },
    filesStore: { reset: vi.fn(), setFolder: vi.fn() },
    getFolderInfo: vi.fn(),
    getFolder: vi.fn(),
    getAIAgent: vi.fn(async () => ({})),
  };
});

vi.mock("next/dynamic", () => ({ default: () => () => null }));

vi.mock("@docspace/shared/api", () => ({
  default: { files: { getFolderInfo: env.getFolderInfo, getFolder: env.getFolder } },
}));

vi.mock("@docspace/shared/api/ai", () => ({ getAIAgent: env.getAIAgent }));

vi.mock("../../_store", () => ({
  useAiRoomStore: () => env.aiRoomStore,
  useAgentDialogsStore: () => ({}),
  useAgentLoadingStore: () => env.loadingStore,
  useKnowledgeFilesStore: () => env.filesStore,
  useResultFilesStore: () => env.filesStore,
}));

vi.mock("../../_hooks/useAiAgentsPageInit", () => ({ default: () => {} }));
vi.mock("../../_hooks/useAiRoomSocket", () => ({ default: () => {} }));
vi.mock("../../_components/ai-agent-view", () => ({ default: () => null }));

import { RoomsType } from "@onlyoffice/apps-ui-kit/enums";

import AiAgentDetailPage from "./page.client";

describe("AI agent page", () => {
  let root: Root | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  const render = async (roomId: number) => {
    root = createRoot(document.createElement("div"));
    await act(async () => {
      root?.render(
        <AiAgentDetailPage
          roomId={roomId}
          initialTab="chat"
          initialResultFileId={null}
        />,
      );
    });
    await act(async () => {});
  };

  it("Room that is not an AI agent opened as an agent", async () => {
    env.getFolderInfo.mockResolvedValue({
      id: 7001,
      roomType: 13,
      private: true,
    });

    await render(7001);

    expect(env.getFolderInfo).toHaveBeenCalledWith(
      7001,
      false,
      undefined,
      expect.anything(),
    );
    expect(env.getFolder).not.toHaveBeenCalled();
    expect(env.getAIAgent).not.toHaveBeenCalled();
    expect(env.aiRoomStore.setAgentRoomId).not.toHaveBeenCalledWith(7001);
    expect(env.aiRoomStore.setIsErrorAIAgentNotAvailable).toHaveBeenLastCalledWith(
      true,
    );
  });

  it("an AI agent room is loaded as before", async () => {
    env.getFolderInfo.mockResolvedValue({ id: 80, roomType: RoomsType.AIRoom });
    env.getFolder.mockResolvedValue({
      current: { id: 80, title: "Agent" },
      folders: [],
    });

    await render(80);

    expect(env.aiRoomStore.setAgentRoomId).toHaveBeenLastCalledWith(80);
    expect(env.getFolder).toHaveBeenCalledTimes(1);
    expect(env.getAIAgent).toHaveBeenCalledWith(80);
    expect(env.aiRoomStore.setTitle).toHaveBeenLastCalledWith("Agent");
    expect(env.aiRoomStore.setIsErrorAIAgentNotAvailable).not.toHaveBeenCalledWith(
      true,
    );
  });
});
