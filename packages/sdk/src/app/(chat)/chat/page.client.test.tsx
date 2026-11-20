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

const env = vi.hoisted(() => ({
  providersMounted: vi.fn(),
  attach: vi.fn(async () => ({ duplicates: [], skippedOverLimit: 0, cap: 10 })),
  frameCallEvent: vi.fn(),
  getFileInfo: vi.fn(),
  resolveFolderTarget: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("next/dynamic", () => ({ default: () => () => null }));

vi.mock("@onlyoffice/apps-ui-kit", () => ({ useTheme: () => ({ isBase: true }) }));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers", () => ({
  default: ({ children }: { children: React.ReactNode }) => {
    env.providersMounted();
    return <>{children}</>;
  },
  useApi: () => ({ threads: { getById: async () => null } }),
  useStores: () => ({ useThreadsStore: () => () => {} }),
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/files", () => ({
  useAttachHostFilesToChat: () => env.attach,
  notifyAlreadyAttached: () => {},
  notifyAttachmentLimit: () => {},
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/chat-toolbar", () => ({
  ChatToolbar: () => null,
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/themes", () => ({
  PORTAL_BASE_THEME_ID: "base",
  PORTAL_DARK_THEME_ID: "dark",
}));

vi.mock("@docspace/shared/api/files", () => ({ getFileInfo: env.getFileInfo }));

vi.mock("@docspace/shared/services/private-room/upload-target", () => ({
  resolveFolderTarget: env.resolveFolderTarget,
}));

vi.mock("@docspace/shared/utils/common", () => ({
  frameCallEvent: env.frameCallEvent,
  frameCallCommand: () => {},
  getFrameId: () => "frame-1",
}));

vi.mock("@/hooks/useFrameHeaderConfig", () => ({
  default: () => ({ headerOffset: 0, headerHeight: 0 }),
}));

import ChatPage from "./page.client";

const PRIVATE = { isPrivate: true, encryptionRoomId: 7001 };
const PLAIN = { isPrivate: false, encryptionRoomId: 50 };

describe("ChatPage", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  const render = async (ids: {
    agentId?: string;
    entityId?: string;
    fileId?: string;
  }) => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <ChatPage
          agentId={ids.agentId ?? ""}
          entityId={ids.entityId ?? ""}
          fileId={ids.fileId ?? ""}
          threadId=""
          canUseAi
          isPortalAdmin={false}
          isStandalone={false}
        />,
      );
    });
    await act(async () => {});
  };

  const expectClosed = () => {
    expect(container.textContent).toContain("Common:UnderDevelopment");
    expect(env.providersMounted).not.toHaveBeenCalled();
    expect(env.attach).not.toHaveBeenCalled();
    expect(env.frameCallEvent).toHaveBeenCalledWith({
      event: "onAppReady",
      data: { frameId: "frame-1" },
    });
  };

  it("Chat opened with a private scope or file: a private room as the scope", async () => {
    env.resolveFolderTarget.mockResolvedValue(PRIVATE);

    await render({ entityId: "7001" });

    expect(env.resolveFolderTarget).toHaveBeenCalledWith({ id: 7001 });
    expectClosed();
  });

  it("Chat opened with a private scope or file: a folder inside a private room as the agent scope", async () => {
    env.resolveFolderTarget.mockResolvedValue(PRIVATE);

    await render({ agentId: "7020", entityId: "50" });

    expect(env.resolveFolderTarget).toHaveBeenCalledWith({ id: 7020 });
    expectClosed();
  });

  it("Chat opened with a private scope or file: an encrypted file", async () => {
    env.getFileInfo.mockResolvedValue({ id: 9, title: "a.docx", encrypted: true });

    await render({ fileId: "9" });

    expectClosed();
  });

  it("Chat opened with a private scope or file: a scope that cannot be read", async () => {
    env.resolveFolderTarget.mockRejectedValue(new Error("403"));

    await render({ entityId: "7001" });

    expectClosed();
  });

  it("a scope outside private rooms and a plain file open the chat as before", async () => {
    env.resolveFolderTarget.mockResolvedValue(PLAIN);
    env.getFileInfo.mockResolvedValue({ id: 9, title: "a.docx", fileExst: ".docx" });

    await render({ entityId: "50", fileId: "9" });

    expect(env.providersMounted).toHaveBeenCalled();
    expect(env.attach).toHaveBeenCalledWith([
      expect.objectContaining({ id: 9, title: "a.docx" }),
    ]);
  });

  it("a chat without a scope or a file makes no request", async () => {
    await render({});

    expect(env.resolveFolderTarget).not.toHaveBeenCalled();
    expect(env.getFileInfo).not.toHaveBeenCalled();
    expect(env.providersMounted).toHaveBeenCalled();
  });
});
