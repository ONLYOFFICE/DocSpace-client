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

import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import { Provider } from "mobx-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PLUGIN_TAB_WAIT_MS } from "../profileTabs";

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    <P extends object>(Component: React.ComponentType<P>) =>
    (props: P) => <Component {...props} t={(key: string) => key} />,
}));

const router = vi.hoisted(() => ({ pathname: "/profile/keys-management" }));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: router.pathname, state: null }),
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate" data-to={to} />
  ),
}));

vi.mock("@docspace/shared/skeletons/profile", () => ({
  ProfileViewLoader: () => <div data-testid="profile-loader" />,
}));

vi.mock("SRC_DIR/components/plugins/PluginWrappedComponent", () => ({
  default: () => null,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/tabs", () => ({
  Tabs: ({
    items,
  }: {
    items: { id: string; name: React.ReactNode; badge?: React.ReactNode }[];
  }) => (
    <ul>
      {items.map((item) => (
        <li key={item.id} data-testid={`tab-${item.id}`}>
          {item.name}
          {item.badge}
        </li>
      ))}
    </ul>
  ),
}));

vi.mock("SRC_DIR/components/BetaBadgeWrapper", () => ({
  default: ({
    title,
    description,
  }: {
    title?: string;
    description?: string;
  }) => (
    <span data-testid="beta-badge" data-title={title}>
      {description}
    </span>
  ),
}));

vi.mock("../useProfileBody", () => ({
  default: () => ({
    tfaOn: false,
    getNotificationsData: vi.fn(),
    getFileManagementData: vi.fn(),
    getEncryptionKeysData: vi.fn(),
    getConsentList: vi.fn(),
    openLoginTab: vi.fn(),
  }),
}));

vi.mock("../sub-components/main-profile", () => ({ default: () => null }));
vi.mock("../sub-components/login", () => ({ default: () => null }));
vi.mock("../sub-components/notifications", () => ({ default: () => null }));
vi.mock("../sub-components/file-management", () => ({ default: () => null }));
vi.mock("../sub-components/interface-theme", () => ({ default: () => null }));
vi.mock("../sub-components/authorized-apps", () => ({ default: () => null }));
vi.mock("../sub-components/keys-management", () => ({ default: () => null }));

// Every prop comes from the stores of the Provider below.
const SectionBodyContent = (await import("../index"))
  .default as unknown as React.ComponentType;

type TKeysState = {
  isSectionAvailable?: boolean;
  encryptionKeys?: { id: string }[] | null;
  isGuest?: boolean;
  pluginTabKeys?: string[];
  arePluginsLoaded?: boolean;
};

const renderProfileTabs = ({
  isSectionAvailable = true,
  encryptionKeys = [],
  isGuest = false,
  pluginTabKeys = [],
  arePluginsLoaded = true,
}: TKeysState = {}) =>
  render(
    <Provider
      settingsStore={{ currentDeviceType: "desktop", enablePlugins: true }}
      pluginStore={{
        isLoaded: arePluginsLoaded,
        profileTabItemsList: pluginTabKeys.map((key) => ({
          key,
          value: { key, label: key, component: () => null, pluginName: "p" },
        })),
      }}
      peopleStore={{
        targetUserStore: {
          setSubscriptions: vi.fn(),
          setNotificationChannels: vi.fn(),
          isFirstSubscriptionsLoad: false,
        },
        usersStore: { setProviders: vi.fn() },
      }}
      clientLoadingStore={{
        showProfileLoader: false,
        setIsProfileLoaded: vi.fn(),
        setIsSectionHeaderLoading: vi.fn(),
        setIsSectionBodyLoading: vi.fn(),
        setIsArticleLoading: vi.fn(),
      }}
      authStore={{ capabilities: {}, getCapabilities: vi.fn() }}
      filesSettingsStore={{ getFilesSettings: vi.fn() }}
      oauthStore={{ fetchConsents: vi.fn(), fetchScopes: vi.fn() }}
      tfaStore={{
        tfaSettings: null,
        setBackupCodes: vi.fn(),
        getTfaType: vi.fn(),
      }}
      setup={{ getSessions: vi.fn() }}
      filesStore={{ resetSelections: vi.fn() }}
      telegramStore={{ checkTg: vi.fn() }}
      userStore={{
        getEncryptionKeys: vi.fn(),
        encryptionKeys,
        user: { isVisitor: isGuest },
      }}
      appsStore={{ isPrivateRoomsSectionAvailable: isSectionAvailable }}
    >
      <SectionBodyContent />
    </Provider>,
  );

describe("Keys management tab carries the Beta badge", () => {
  it("Tab label", () => {
    renderProfileTabs();

    const keysTab = screen.getByTestId("tab-keys-management");
    expect(keysTab).toHaveTextContent("Common:KeysManagement");
    expect(within(keysTab).getByTestId("beta-badge")).toHaveTextContent(
      "Common:PrivateRoomsBetaDescription",
    );
  });

  it("Badge tooltip", () => {
    renderProfileTabs();

    const badge = within(screen.getByTestId("tab-keys-management")).getByTestId(
      "beta-badge",
    );
    expect(badge).toHaveAttribute("data-title", "Common:PrivateRoomsBetaTitle");
    expect(badge).toHaveTextContent("Common:PrivateRoomsBetaDescription");
  });

  it("puts the badge on no other profile tab", () => {
    renderProfileTabs();

    expect(screen.getAllByTestId("beta-badge")).toHaveLength(1);
  });
});

describe("Keys management tab follows the Private section", () => {
  it("Section available", () => {
    renderProfileTabs({ isSectionAvailable: true, encryptionKeys: [] });

    expect(screen.getByTestId("tab-keys-management")).toBeInTheDocument();
  });

  it("App off, no key", () => {
    renderProfileTabs({ isSectionAvailable: false, encryptionKeys: [] });

    expect(screen.queryByTestId("tab-keys-management")).toBeNull();
    expect(screen.getByTestId("tab-login")).toBeInTheDocument();
  });

  it("App off, key held", () => {
    renderProfileTabs({
      isSectionAvailable: false,
      encryptionKeys: [{ id: "key-1" }],
    });

    expect(screen.getByTestId("tab-keys-management")).toBeInTheDocument();
  });

  it("Guest", () => {
    renderProfileTabs({ isSectionAvailable: true, isGuest: true });

    expect(screen.queryByTestId("tab-keys-management")).toBeNull();
    expect(screen.getByTestId("tab-login")).toBeInTheDocument();
  });

  it("Guest holding a key", () => {
    renderProfileTabs({
      isSectionAvailable: false,
      encryptionKeys: [{ id: "key-1" }],
      isGuest: true,
    });

    expect(screen.queryByTestId("tab-keys-management")).toBeNull();
  });
});

describe("Plugin tabs", () => {
  afterEach(() => {
    router.pathname = "/profile/keys-management";
  });

  it("adds a plugin tab after the portal's own", () => {
    renderProfileTabs({ pluginTabKeys: ["calendar-sync"] });

    const ids = screen
      .getAllByTestId(/^tab-/)
      .map((tab) => tab.dataset.testid);
    expect(ids.at(-1)).toBe("tab-p/calendar-sync");
  });

  it("keeps a plugin tab keyed like a portal tab apart from it", () => {
    renderProfileTabs({ pluginTabKeys: ["login"] });

    expect(screen.getByTestId("tab-login")).toBeInTheDocument();
    expect(screen.getByTestId("tab-p/login")).toBeInTheDocument();
  });

  it("shows the skeleton on a plugin tab address while the plugins load", () => {
    router.pathname = "/profile/p/calendar-sync";
    renderProfileTabs({ arePluginsLoaded: false });

    expect(screen.getByTestId("profile-loader")).toBeInTheDocument();
  });

  it("stops waiting for a plugin tab when the plugins never finish loading", () => {
    vi.useFakeTimers();

    try {
      router.pathname = "/profile/p/calendar-sync";
      renderProfileTabs({ arePluginsLoaded: false });

      act(() => {
        vi.advanceTimersByTime(PLUGIN_TAB_WAIT_MS);
      });

      expect(screen.getByTestId("navigate")).toHaveAttribute(
        "data-to",
        "/profile/login",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("sends a plugin tab address no plugin owns to the login tab once the plugins are loaded", () => {
    router.pathname = "/profile/p/calendar-sync";
    renderProfileTabs();

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      "/profile/login",
    );
  });
});
