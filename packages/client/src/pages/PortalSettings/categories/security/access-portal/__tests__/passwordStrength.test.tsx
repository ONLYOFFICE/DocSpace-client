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
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

import { PasswordStrengthSection } from "../passwordStrength";

const setPortalPasswordSettings = vi.fn();

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/portal-settings/security/access-portal"]}>
      <Provider
        settingsStore={{
          setPortalPasswordSettings,
          passwordSettings: {
            minLength: 8,
            upperCase: false,
            digits: false,
            specSymbols: false,
          },
          currentColorScheme: { main: { accent: "" } },
          passwordStrengthSettingsUrl: "",
          currentDeviceType: DeviceType.desktop,
        }}
        tfaStore={{}}
        setup={{ isInit: true }}
      >
        <PasswordStrengthSection />
      </Provider>
    </MemoryRouter>,
  );

const slider = () => {
  const host = screen.getByTestId("password_strength_slider");
  return (
    host instanceof HTMLInputElement ? host : host.querySelector("input")
  ) as HTMLInputElement;
};

beforeEach(() => {
  sessionStorage.clear();
  setPortalPasswordSettings.mockResolvedValue(undefined);
});

describe("Password strength", () => {
  it("sets the minimum length from 8 to 30 characters", () => {
    renderPage();

    expect(slider()).toHaveAttribute("min", "8");
    expect(slider()).toHaveAttribute("max", "30");
  });

  it("saves the length and the required character kinds with a toast", async () => {
    const user = userEvent.setup();
    renderPage();

    fireEvent.change(slider(), { target: { value: "12" } });
    await user.click(screen.getByText("UseUpperCase"));
    await user.click(screen.getByText("UseSpecialChar"));
    await user.click(screen.getByTestId("password_strength_save"));

    await waitFor(() =>
      expect(setPortalPasswordSettings).toHaveBeenCalledWith(12, true, false, true),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      "Common:SuccessfullySaveSettingsMessage",
    );
  });
});
