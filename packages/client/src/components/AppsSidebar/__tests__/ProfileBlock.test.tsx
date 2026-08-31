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
 * Bug 83459 - the "Live chat" switch in the sidebar profile menu never changed
 * its state.
 *
 * The menu model is built by `ProfileActionsStore.getActions`, which
 * `makeAutoObservable` turns into a MobX action - and actions run untracked, so
 * reading `isShowLiveChat` inside it can never subscribe anyone. The only way
 * the switch repaints is for the connected wrapper to observe the flag itself.
 */

import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { makeAutoObservable } from "mobx";
import { describe, expect, it, vi } from "vitest";

import { DeviceType } from "@docspace/shared/enums";

type MenuItem = { key: string; checked?: boolean };

// Stand-in for the real ui-kit ArticleProfile: what matters here is that it
// rebuilds the menu model on every render and is not an observer itself.
vi.mock("@docspace/ui-kit/components/article", () => ({
  ArticleProfile: ({
    getActions,
  }: {
    getActions?: (t?: (key: string) => string) => MenuItem[];
  }) => {
    const model = getActions?.((key: string) => key) ?? [];
    const liveChat = model.find((item) => item?.key === "user-menu-live-chat");

    return (
      <span data-testid="live-chat-checked">
        {String(Boolean(liveChat?.checked))}
      </span>
    );
  },
}));

import ProfileBlock from "../ProfileBlock";

class FakeProfileActionsStore {
  isShowLiveChat = false;

  constructor() {
    makeAutoObservable(this);
  }

  getActions = () => [
    { key: "user-menu-live-chat", checked: this.isShowLiveChat },
  ];

  onProfileClick = () => {};

  toggleLiveChat = () => {
    this.isShowLiveChat = !this.isShowLiveChat;
  };
}

const renderComponent = () => {
  const profileActionsStore = new FakeProfileActionsStore();

  render(
    <Provider
      profileActionsStore={profileActionsStore}
      settingsStore={{ currentDeviceType: DeviceType.desktop }}
    >
      <ProfileBlock showText />
    </Provider>,
  );

  return profileActionsStore;
};

describe("AppsSidebar ProfileBlock", () => {
  it("repaints the live chat switch when the store flag changes", () => {
    const profileActionsStore = renderComponent();

    expect(screen.getByTestId("live-chat-checked")).toHaveTextContent("false");

    act(() => {
      profileActionsStore.toggleLiveChat();
    });

    expect(screen.getByTestId("live-chat-checked")).toHaveTextContent("true");
  });
});
