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

/**
 * Bug 83459 - turning "Live chat" on never brought up the Support chat.
 *
 * The unified sidebar replaced the old article, and with it the only place that
 * mounted the Zendesk widget, so the switch had nothing to show. These tests pin
 * the widget to the sidebar, the store flag that drives it, and the corner
 * flags that keep its launcher off the create and progress buttons.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  chat: null as { isVisible: boolean; effectiveFullscreen: boolean } | null,
  addChanges: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store", () => ({
  useAiChatStoreOptional: () => mocks.chat,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/article/zendesk/Zendesk.utils", () => ({
  zendeskAPI: { addChanges: mocks.addChanges },
}));

vi.mock(
  "@onlyoffice/apps-ui-kit/components/article/sub-components/LiveChat",
  () => ({
    default: ({
      zendeskKey,
      isShowLiveChat,
      withFloatingButton,
      infoPanelWidth,
    }: {
      zendeskKey: string;
      isShowLiveChat: boolean;
      withFloatingButton: boolean;
      infoPanelWidth?: number;
    }) => (
      <span
        data-testid="zendesk"
        data-show={String(isShowLiveChat)}
        data-with-floating-button={String(withFloatingButton)}
        data-info-panel-width={String(infoPanelWidth)}
      >
        {zendeskKey}
      </span>
    ),
  }),
);

import LiveChatBlock from "../LiveChatBlock";

const renderComponent = (
  isLiveChatAvailable: boolean,
  mainButtonVisible = false,
  {
    isPrimaryProgressVisbile = false,
    isSecondaryProgressVisbile = false,
    downloadingProgress = 0,
    shownWidth = 0,
    currentDeviceType = "desktop",
    isShowLiveChat = true,
    chat = null as { isVisible: boolean; effectiveFullscreen: boolean } | null,
  } = {},
) => {
  mocks.chat = chat;
  mocks.addChanges.mockClear();

  return render(
    <Provider
      authStore={{ isLiveChatAvailable, languageBaseName: "en" }}
      settingsStore={{ zendeskKey: "zendesk-key", currentDeviceType }}
      filesStore={{ mainButtonVisible }}
      uploadDataStore={{
        primaryProgressDataStore: { isPrimaryProgressVisbile },
        secondaryProgressDataStore: { isSecondaryProgressVisbile },
      }}
      infoPanelStore={{ shownWidth }}
      backup={{ downloadingProgress }}
      profileActionsStore={{ isShowLiveChat }}
    >
      <LiveChatBlock />
    </Provider>,
  );
};

describe("AppsSidebar LiveChatBlock", () => {
  it("mounts the Zendesk widget with the current live chat state", () => {
    renderComponent(true);

    const zendesk = screen.getByTestId("zendesk");

    expect(zendesk).toHaveTextContent("zendesk-key");
    expect(zendesk).toHaveAttribute("data-show", "true");
  });

  it("tells the widget to step aside for the mobile create button", () => {
    // The widget is placed by script, in the same corner as the create button,
    // so the button's own visibility flag is the only thing that keeps the two
    // off each other.
    renderComponent(true, true);

    expect(screen.getByTestId("zendesk")).toHaveAttribute(
      "data-with-floating-button",
      "true",
    );
  });

  it.each([
    ["an upload", { isPrimaryProgressVisbile: true }],
    ["a file operation", { isSecondaryProgressVisbile: true }],
    ["a backup download", { downloadingProgress: 40 }],
  ])("steps aside from the progress button during %s", (_, progress) => {
    // OperationsProgressButton is pinned to the same corner on desktop, where
    // there is no create button, and would otherwise sit under the launcher.
    renderComponent(true, false, progress);

    expect(screen.getByTestId("zendesk")).toHaveAttribute(
      "data-with-floating-button",
      "true",
    );
  });

  it("keeps the widget in the corner while nothing else is there", () => {
    renderComponent(true);

    expect(screen.getByTestId("zendesk")).toHaveAttribute(
      "data-with-floating-button",
      "false",
    );
  });

  it.each([
    ["no panel is open", 0],
    ["the info panel or the AI chat in its place is open", 640],
  ])("moves the widget by the width Section reports while %s", (_, width) => {
    renderComponent(true, false, { shownWidth: width });

    expect(screen.getByTestId("zendesk")).toHaveAttribute(
      "data-info-panel-width",
      String(width),
    );
  });

  const docked = { isVisible: true, effectiveFullscreen: false };

  it.each([
    ["shows the widget on a desktop", {}, "show"],
    ["shows it on a tablet without the AI chat", { currentDeviceType: "tablet" }, "show"],
    ["keeps it beside a docked AI chat", { chat: docked }, "show"],
    [
      "hides it under a fullscreen AI chat",
      { chat: { isVisible: true, effectiveFullscreen: true } },
      "hide",
    ],
    [
      "hides it under the AI chat on a tablet",
      { currentDeviceType: "tablet", chat: docked },
      "hide",
    ],
    [
      "hides it under the AI chat on a phone",
      { currentDeviceType: "mobile", chat: docked },
      "hide",
    ],
  ])("%s", (_, options, command) => {
    renderComponent(true, false, options);

    expect(mocks.addChanges).toHaveBeenLastCalledWith("messenger", command);
  });

  it("leaves the widget alone while the live chat switch is off", () => {
    renderComponent(true, false, {
      currentDeviceType: "tablet",
      isShowLiveChat: false,
      chat: docked,
    });

    expect(mocks.addChanges).not.toHaveBeenCalled();
  });

  it("stays out of the page when live chat is not available", () => {
    renderComponent(false);

    expect(screen.queryByTestId("zendesk")).not.toBeInTheDocument();
  });
});
