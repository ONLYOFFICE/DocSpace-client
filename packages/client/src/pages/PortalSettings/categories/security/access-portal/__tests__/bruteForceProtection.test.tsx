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
const settingsApi = vi.hoisted(() => ({
  setBruteForceProtection: vi.fn(),
  deleteBruteForceProtection: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("@docspace/shared/api", async (importOriginal) => {
  const actual = (await importOriginal()) as { default: Record<string, object> };
  return {
    ...actual,
    default: {
      ...actual.default,
      settings: { ...actual.default.settings, ...settingsApi },
    },
  };
});

import { DeviceType } from "@docspace/shared/enums";

import { BruteForceProtectionSection } from "../bruteForceProtection";

const getBruteForceProtection = vi.fn();
const setBruteForceProtectionSettings = vi.fn();

const renderPage = (isDefaultPasswordProtection = false) =>
  render(
    <MemoryRouter initialEntries={["/portal-settings/security/access-portal"]}>
      <Provider
        settingsStore={{
          numberAttempt: 5,
          blockingTime: 60,
          checkPeriod: 60,
          isDefaultPasswordProtection,
          getBruteForceProtection,
          bruteForceProtectionUrl: "",
          currentDeviceType: DeviceType.desktop,
          currentColorScheme: { main: { accent: "" } },
          setBruteForceProtectionSettings,
        }}
        tfaStore={{}}
        setup={{ isInit: true }}
      >
        <BruteForceProtectionSection />
      </Provider>
    </MemoryRouter>,
  );

const attempts = () =>
  screen.getByTestId(
    "brute_force_protection_number_attempts_input",
  ) as HTMLInputElement;
const blockingTime = () =>
  screen.getByTestId(
    "brute_force_protection_blocking_time_input",
  ) as HTMLInputElement;
const checkPeriod = () =>
  screen.getByTestId(
    "brute_force_protection_check_period_input",
  ) as HTMLInputElement;

const save = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByTestId("brute_force_protection_save_button"));

beforeEach(() => {
  sessionStorage.clear();
  settingsApi.setBruteForceProtection.mockResolvedValue(undefined);
  settingsApi.deleteBruteForceProtection.mockResolvedValue({
    attemptCount: 5,
    blockTime: 60,
    checkPeriod: 60,
  });
});

describe("Brute force protection", () => {
  it("takes only whole numbers of up to four digits", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(attempts());
    await user.type(attempts(), "1.5 x12345");

    expect(attempts().value).toBe("1512");
  });

  it("an empty number of attempts is marked and blocks saving", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(attempts());

    expect(attempts()).toHaveAttribute("data-error", "true");
    expect(
      screen.getByText("ErrorMessageBruteForceProtection"),
    ).toBeInTheDocument();
    await save(user);
    expect(settingsApi.setBruteForceProtection).not.toHaveBeenCalled();
  });

  it("an empty check period blocks saving", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(checkPeriod());
    await save(user);

    expect(settingsApi.setBruteForceProtection).not.toHaveBeenCalled();
  });

  it("an empty or zero blocking time is marked and blocks saving", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(blockingTime());
    expect(blockingTime()).toHaveAttribute("data-error", "true");
    await save(user);

    await user.type(blockingTime(), "0");
    expect(blockingTime()).toHaveAttribute("data-error", "true");
    await save(user);

    expect(settingsApi.setBruteForceProtection).not.toHaveBeenCalled();
  });

  it("a refused save reports the error and leaves the fields editable", async () => {
    const user = userEvent.setup();
    settingsApi.setBruteForceProtection.mockRejectedValue("Out of range");
    renderPage();

    await user.clear(attempts());
    await user.type(attempts(), "10");
    await save(user);

    await waitFor(() => expect(toastr.error).toHaveBeenCalledWith("Out of range"));
    expect(attempts()).toBeEnabled();
    expect(blockingTime()).toBeEnabled();
    expect(checkPeriod()).toBeEnabled();
  });

  it("values are saved as numbers with a toast", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(attempts());
    await user.type(attempts(), "10");
    await save(user);

    await waitFor(() =>
      expect(settingsApi.setBruteForceProtection).toHaveBeenCalledWith(10, 60, 60),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      "Common:SuccessfullySaveSettingsMessage",
    );
    expect(getBruteForceProtection).toHaveBeenCalled();
  });

  it("Restore to default resets the server's values", async () => {
    const user = userEvent.setup();
    renderPage(false);

    await user.click(screen.getByTestId("brute_force_protection_cancel_button"));

    await waitFor(() =>
      expect(setBruteForceProtectionSettings).toHaveBeenCalledWith({
        attemptCount: 5,
        blockTime: 60,
        checkPeriod: 60,
      }),
    );
    expect(settingsApi.deleteBruteForceProtection).toHaveBeenCalledTimes(1);
  });

  it("Restore to default is disabled while the values are the defaults", () => {
    renderPage(true);

    expect(
      screen.getByTestId("brute_force_protection_cancel_button"),
    ).toBeDisabled();
  });
});
