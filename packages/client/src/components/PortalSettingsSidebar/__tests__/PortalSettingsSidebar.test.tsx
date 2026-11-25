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
import { render } from "@testing-library/react";
import { Provider } from "mobx-react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NavMenuGroup } from "@onlyoffice/apps-ui-kit/components/nav-menu";
import { DeviceType } from "@docspace/shared/enums";

const navigate = vi.hoisted(() => vi.fn());
const setArticleOpen = vi.hoisted(() => vi.fn());
const captured = vi.hoisted(() => ({ groups: [] as NavMenuGroup[] }));

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

vi.mock("SRC_DIR/components/AppsSidebar", () => ({
  default: ({ groups }: { groups: NavMenuGroup[] }) => {
    captured.groups = groups;
    return null;
  },
}));

import PortalSettingsSidebar from "../index";

// The props the stores below map to: inject() keeps them required in the
// component's type and replaces them with the stores' values.
const props = {
  isNotPaidPeriod: false,
  isOwner: true,
  standalone: false,
  isCommunity: false,
  baseDomain: "",
  aiServicesEnabled: false,
  canManageApps: false,
  setIsLoadedArticleBody: () => {},
  showPortalSettingsLoader: false,
  showProfileLoader: false,
};

const stores = {
  settingsStore: {
    standalone: props.standalone,
    baseDomain: props.baseDomain,
    aiServicesEnabled: props.aiServicesEnabled,
    currentDeviceType: DeviceType.desktop,
    setArticleOpen,
  },
  userStore: { user: { isOwner: props.isOwner } },
  currentTariffStatusStore: {
    isNotPaidPeriod: props.isNotPaidPeriod,
    isCommunity: props.isCommunity,
  },
  common: { setIsLoadedArticleBody: props.setIsLoadedArticleBody },
  clientLoadingStore: {
    showPortalSettingsLoader: props.showPortalSettingsLoader,
    showProfileLoader: props.showProfileLoader,
  },
  appsStore: { canManageApps: props.canManageApps },
};

const renderSidebar = ({
  deviceType = DeviceType.desktop,
  state,
}: { deviceType?: DeviceType; state?: object } = {}) =>
  render(
    <Provider
      {...stores}
      settingsStore={{ ...stores.settingsStore, currentDeviceType: deviceType }}
    >
      <MemoryRouter
        initialEntries={[
          { pathname: "/portal-settings/customization/general", state },
        ]}
      >
        <PortalSettingsSidebar {...props} />
      </MemoryRouter>
    </Provider>,
  );

describe("PortalSettingsSidebar navigation", () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  // A NavMenu entry with linkData is drawn as a router link, which navigates
  // by itself; navigating from onClick as well pushed the page twice.
  it("leaves a click on a link entry to the link", () => {
    renderSidebar();
    const [item] = captured.groups[0].items;

    expect(item.linkData?.path).toBeTruthy();
    item.onClick?.(item, { isLink: true });

    expect(navigate).not.toHaveBeenCalled();
  });

  it("navigates itself when the entry is not drawn as a link", () => {
    renderSidebar();
    const [item] = captured.groups[0].items;

    item.onClick?.(item, { isLink: false });

    expect(navigate).toHaveBeenCalledWith(item.linkData?.path);
  });
});

// Bug 67530: on a phone the profile menu's "Settings" opens on the section
// list instead of a single section that hides the others.
describe("PortalSettingsSidebar section list on a phone", () => {
  beforeEach(() => {
    navigate.mockClear();
    setArticleOpen.mockClear();
  });

  it("opens the section list when asked on a phone and drops the flag", () => {
    renderSidebar({
      deviceType: DeviceType.mobile,
      state: { openArticle: true },
    });

    expect(setArticleOpen).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith(
      "/portal-settings/customization/general",
      { replace: true, state: { openArticle: undefined } },
    );
  });

  it("does not open the panel off a phone", () => {
    renderSidebar({ state: { openArticle: true } });

    expect(setArticleOpen).not.toHaveBeenCalled();
  });

  it("does nothing without the flag", () => {
    renderSidebar({ deviceType: DeviceType.mobile });

    expect(setArticleOpen).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
