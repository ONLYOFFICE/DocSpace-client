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

import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/components/rows", () => ({
  RowsSkeleton: () => <div data-testid="rows-skeleton" />,
  RowContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  RowContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Row: ({
    children,
    contextOptions,
    dataTestId,
  }: {
    children: React.ReactNode;
    contextOptions: { key: string; onClick: () => void }[];
    dataTestId?: string;
  }) => (
    <div data-testid={dataTestId}>
      {children}
      {contextOptions.map((option) => (
        <button
          key={option.key}
          type="button"
          data-testid={option.key}
          onClick={option.onClick}
        />
      ))}
    </div>
  ),
}));

const UsersPlugins = (await import("../UsersPlugins")).default;

const userPlugin = (
  name: string,
  userId: string,
  enabled = true,
  displayName = `User ${userId}`,
) => ({
  name,
  pluginName: name.toUpperCase(),
  version: "1.0.0",
  enabled,
  description: "",
  url: "",
  cspDomains: "",
  createOn: "2026-11-24T10:12:00Z",
  createBy: { id: userId, displayName, avatarSmall: "" },
});

const renderTab = (
  pluginStoreState: Record<string, unknown> = {},
  isPersonalEnabled = true,
) => {
  const pluginStore = {
    usersPlugins: [],
    isUsersPluginsLoaded: true,
    fetchUsersPlugins: vi.fn(async () => {}),
    setIsUsersPluginsLoaded: vi.fn(),
    switchPersonalPlugins: vi.fn(async () => {}),
    updateUserPlugin: vi.fn(async () => {}),
    setDeletePluginDialogProps: vi.fn(),
    setDeletePluginDialogVisible: vi.fn(),
    ...pluginStoreState,
  };

  const { unmount } = render(
    <Provider
      pluginStore={pluginStore}
      settingsStore={{
        pluginOptions: { personal: isPersonalEnabled },
        currentDeviceType: "mobile",
        culture: "en",
      }}
      userStore={{ user: { id: "u1" } }}
      setup={{ viewAs: "row", setViewAs: vi.fn() }}
    >
      <UsersPlugins />
    </Provider>,
  );

  return Object.assign(pluginStore, { unmount });
};

const clickToggle = (testId: string) =>
  fireEvent.click(
    within(screen.getByTestId(testId)).getByTestId("toggle-button-input"),
  );

describe("UsersPlugins", () => {
  it("reads the users' plugins when opened straight from the address", () => {
    const pluginStore = renderTab({ isUsersPluginsLoaded: false });

    expect(pluginStore.fetchUsersPlugins).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("rows-skeleton")).toBeInTheDocument();
  });

  it("does not read them again when its tab has just read them", () => {
    const pluginStore = renderTab();

    expect(pluginStore.fetchUsersPlugins).not.toHaveBeenCalled();
  });

  it("forgets the list once closed, so the next opening reads it again", () => {
    const pluginStore = renderTab();

    pluginStore.unmount();

    expect(pluginStore.setIsUsersPluginsLoaded).toHaveBeenCalledWith(false);
  });

  it("says so when no user has added a plugin", () => {
    renderTab();

    expect(screen.getByText("NoUsersPlugins")).toBeInTheDocument();
    expect(screen.getByText("NoUsersPluginsDescription")).toBeInTheDocument();
  });

  it("lists one row per plugin of a user", () => {
    renderTab({
      usersPlugins: [userPlugin("hello", "u1"), userPlugin("hello", "u2")],
    });

    expect(screen.getByTestId("user_plugin_u1_hello")).toBeInTheDocument();
    expect(screen.getByTestId("user_plugin_u2_hello")).toBeInTheDocument();
  });

  it("lists the plugins grouped by user, the user's own marked", () => {
    renderTab({
      usersPlugins: [
        userPlugin("zeta", "u2"),
        userPlugin("beta", "u1"),
        userPlugin("alpha", "u2"),
      ],
    });

    const rows = screen
      .getAllByTestId(/^user_plugin_u\d_[a-z]+$/)
      .map((row) => row.getAttribute("data-testid"));

    expect(rows).toEqual([
      "user_plugin_u1_beta",
      "user_plugin_u2_alpha",
      "user_plugin_u2_zeta",
    ]);
    expect(
      within(screen.getByTestId("user_plugin_u1_beta")).getByText(
        /User u1 \(Common:MeLabel\)/,
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("user_plugin_u2_alpha")).queryByText(
        /Common:MeLabel/,
      ),
    ).not.toBeInTheDocument();
  });

  it("switches a plugin off for its user", () => {
    const pluginStore = renderTab({ usersPlugins: [userPlugin("hello", "u1")] });

    clickToggle("user_plugin_u1_hello_toggle_button");

    expect(pluginStore.updateUserPlugin).toHaveBeenCalledWith(
      "u1",
      "hello",
      false,
    );
  });

  it("switches a plugin from its context menu", () => {
    const pluginStore = renderTab({
      usersPlugins: [userPlugin("hello", "u1", false)],
    });

    fireEvent.click(screen.getByTestId("user-plugin_enable"));

    expect(pluginStore.updateUserPlugin).toHaveBeenCalledWith(
      "u1",
      "hello",
      true,
    );
  });

  it("sends one request while a switch is still running", async () => {
    let finish: () => void = () => {};
    const pluginStore = renderTab({
      usersPlugins: [userPlugin("hello", "u1")],
      updateUserPlugin: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      ),
    });

    clickToggle("user_plugin_u1_hello_toggle_button");
    clickToggle("user_plugin_u1_hello_toggle_button");
    fireEvent.click(screen.getByTestId("user-plugin_disable"));

    expect(pluginStore.updateUserPlugin).toHaveBeenCalledTimes(1);
    expect(
      within(
        screen.getByTestId("user_plugin_u1_hello_toggle_button"),
      ).getByTestId("toggle-button-input"),
    ).toBeEnabled();

    await act(async () => finish());

    clickToggle("user_plugin_u1_hello_toggle_button");

    expect(pluginStore.updateUserPlugin).toHaveBeenCalledTimes(2);
  });

  it("names each switch by its plugin and user", () => {
    renderTab({ usersPlugins: [userPlugin("hello", "u2")] });

    expect(screen.getByLabelText("hello, User u2")).toBe(
      within(
        screen.getByTestId("user_plugin_u2_hello_toggle_button"),
      ).getByTestId("toggle-button-input"),
    );
  });

  it("asks to confirm the deletion of a plugin of a user, with the user's name as it reads", () => {
    const pluginStore = renderTab({
      usersPlugins: [userPlugin("hello", "u1", true, "O&#39;Brien &amp; Co")],
    });

    fireEvent.click(screen.getByTestId("user-plugin_delete"));

    expect(pluginStore.setDeletePluginDialogProps).toHaveBeenCalledWith({
      pluginName: "hello",
      member: true,
      userId: "u1",
      userName: "O'Brien & Co",
      pluginTitle: "hello",
    });
    expect(pluginStore.setDeletePluginDialogVisible).toHaveBeenCalledWith(true);
  });

  it("shows no empty list when the list could not be read", () => {
    renderTab({ isUsersPluginsFailed: true });

    expect(screen.queryByText("NoUsersPlugins")).toBeNull();
  });

  it("sends one workspace switch while the previous one is still saving", async () => {
    let finish: () => void = () => {};
    const pluginStore = renderTab({
      switchPersonalPlugins: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      ),
    });

    clickToggle("personal_plugins_toggle_button");
    clickToggle("personal_plugins_toggle_button");

    expect(pluginStore.switchPersonalPlugins).toHaveBeenCalledTimes(1);

    await act(async () => finish());
  });

  it("switches personal plugins off for the workspace", () => {
    const pluginStore = renderTab();

    clickToggle("personal_plugins_toggle_button");

    expect(pluginStore.switchPersonalPlugins).toHaveBeenCalledWith(false);
  });
});
