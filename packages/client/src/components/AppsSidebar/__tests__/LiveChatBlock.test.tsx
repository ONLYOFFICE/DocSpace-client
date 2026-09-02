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
 * the widget to the sidebar and the store flag that drives it.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

vi.mock(
  "@docspace/ui-kit/components/article/sub-components/LiveChat",
  () => ({
    default: ({
      zendeskKey,
      isShowLiveChat,
    }: {
      zendeskKey: string;
      isShowLiveChat: boolean;
    }) => (
      <span data-testid="zendesk" data-show={String(isShowLiveChat)}>
        {zendeskKey}
      </span>
    ),
  }),
);

import LiveChatBlock from "../LiveChatBlock";

const renderComponent = (isLiveChatAvailable: boolean) =>
  render(
    <Provider
      authStore={{ isLiveChatAvailable, languageBaseName: "en" }}
      settingsStore={{ zendeskKey: "zendesk-key", isMobileArticle: false }}
      userStore={{ user: { email: "user@example.com", displayName: "User" } }}
      uploadDataStore={{
        primaryProgressDataStore: { isPrimaryProgressVisbile: false },
        secondaryProgressDataStore: { isSecondaryProgressVisbile: false },
      }}
      infoPanelStore={{ isVisible: false }}
      backup={{ downloadingProgress: 0 }}
      profileActionsStore={{ isShowLiveChat: true }}
    >
      <LiveChatBlock />
    </Provider>,
  );

describe("AppsSidebar LiveChatBlock", () => {
  it("mounts the Zendesk widget with the current live chat state", () => {
    renderComponent(true);

    const zendesk = screen.getByTestId("zendesk");

    expect(zendesk).toHaveTextContent("zendesk-key");
    expect(zendesk).toHaveAttribute("data-show", "true");
  });

  it("stays out of the page when live chat is not available", () => {
    renderComponent(false);

    expect(screen.queryByTestId("zendesk")).not.toBeInTheDocument();
  });
});
