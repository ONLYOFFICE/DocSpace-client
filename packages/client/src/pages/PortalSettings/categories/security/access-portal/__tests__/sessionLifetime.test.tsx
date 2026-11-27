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
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "mobx-react";
import { MemoryRouter } from "react-router";

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    <P extends object>(Component: React.ComponentType<P>) =>
    (props: P) => (
      <Component {...props} t={(key: string) => key} tReady />
    ),
}));

const toastr = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));

import { DeviceType } from "@docspace/shared/enums";

import { SessionLifetimeSection } from "../sessionLifetime";

const setSessionLifetimeSettings = vi.fn();

const renderPage = (enabledSessionLifetime = true, sessionLifetime = 60) =>
  render(
    <MemoryRouter initialEntries={["/portal-settings/security/access-portal"]}>
      <Provider
        settingsStore={{
          sessionLifetime,
          enabledSessionLifetime,
          setSessionLifetimeSettings,
          lifetimeSettingsUrl: "",
          currentColorScheme: { main: { accent: "" } },
          currentDeviceType: DeviceType.desktop,
        }}
        tfaStore={{}}
        setup={{ isInit: true }}
      >
        <SessionLifetimeSection />
      </Provider>
    </MemoryRouter>,
  );

const minutes = () =>
  screen.getByTestId("session_lifetime_input") as HTMLInputElement;

const save = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByTestId("session_lifetime_save_button"));

beforeEach(() => {
  sessionStorage.clear();
  setSessionLifetimeSettings.mockResolvedValue(undefined);
});

describe("Session lifetime", () => {
  it("says that saving signs everyone out", () => {
    renderPage();

    expect(
      screen.getByText("SessionLifetimeSettingDescription"),
    ).toBeInTheDocument();
  });

  it("takes only a positive whole number of at most four digits", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(minutes());
    await user.type(minutes(), "0");
    expect(minutes().value).toBe("");

    await user.type(minutes(), "-5.5");
    expect(minutes().value).toBe("55");

    expect(minutes()).toHaveAttribute("maxLength", "4");
  });

  it("an empty value is marked on leaving the field and blocks saving", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(minutes());
    await user.tab();
    expect(minutes()).toHaveAttribute("data-error", "true");

    await save(user);
    expect(setSessionLifetimeSettings).not.toHaveBeenCalled();
  });

  it("minutes are saved with a toast", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(minutes());
    await user.type(minutes(), "45");
    await save(user);

    await waitFor(() =>
      expect(setSessionLifetimeSettings).toHaveBeenCalledWith("45", true),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      "Common:SuccessfullySaveSettingsMessage",
    );
  });

  it("Disabled: saved off, keeping the server's minutes", async () => {
    const user = userEvent.setup();
    renderPage(true, 60);

    await user.click(screen.getByText("Common:Disabled"));
    expect(screen.queryByTestId("session_lifetime_input")).toBeNull();
    await save(user);

    await waitFor(() =>
      expect(setSessionLifetimeSettings).toHaveBeenCalledWith(60, false),
    );
  });
});
