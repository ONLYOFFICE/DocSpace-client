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

import { IpSecuritySection } from "../ipSecurity";

const setIpRestrictions = vi.fn();

const renderPage = (ipRestrictionEnable = false, ipRestrictions: string[] = []) =>
  render(
    <MemoryRouter initialEntries={["/portal-settings/security/access-portal"]}>
      <Provider
        settingsStore={{
          ipRestrictionEnable,
          ipRestrictions,
          setIpRestrictions,
          ipSettingsUrl: "",
          currentColorScheme: { main: { accent: "" } },
          currentDeviceType: DeviceType.desktop,
        }}
        tfaStore={{}}
        setup={{}}
      >
        <IpSecuritySection />
      </Provider>
    </MemoryRouter>,
  );

const addIp = async (user: ReturnType<typeof userEvent.setup>, ip: string) => {
  await user.click(screen.getByTestId("ip_security_add_ip_button"));
  const inputs = screen.getAllByTestId("ip_security_ip_input");
  await user.type(inputs[inputs.length - 1], ip);
};

const save = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByTestId("ip_security_save_button"));

beforeEach(() => {
  sessionStorage.clear();
  setIpRestrictions.mockResolvedValue(undefined);
});

describe("IP security", () => {
  it("Enabled: the warning about locking oneself out is shown", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.queryByText("IPSecurityWarningHelper")).toBeNull();
    await user.click(screen.getByText("Common:Enabled"));

    expect(screen.getByText("IPSecurityWarningHelper")).toBeInTheDocument();
  });

  it("an address that is not IPv4 blocks saving", async () => {
    const user = userEvent.setup();
    renderPage(true, ["10.0.0.1"]);

    await addIp(user, "300.1.1.1");
    await save(user);

    expect(screen.getByText("Common:IncorrectIp")).toBeInTheDocument();
    expect(setIpRestrictions).not.toHaveBeenCalled();
  });

  it("a repeated address blocks saving", async () => {
    const user = userEvent.setup();
    renderPage(true, ["10.0.0.1"]);

    await addIp(user, "10.0.0.1");
    await save(user);

    expect(screen.getByText("Common:IpAlreadyAdded")).toBeInTheDocument();
    expect(setIpRestrictions).not.toHaveBeenCalled();
  });

  it("well-formed addresses are saved with a toast", async () => {
    const user = userEvent.setup();
    renderPage(true, ["10.0.0.1"]);

    await addIp(user, "192.168.1.20");
    await save(user);

    await waitFor(() =>
      expect(setIpRestrictions).toHaveBeenCalledWith(
        [{ ip: "10.0.0.1" }, { ip: "192.168.1.20" }],
        true,
      ),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      "Common:SuccessfullySaveSettingsMessage",
    );
  });

  it("Disabled: saved without the addresses", async () => {
    const user = userEvent.setup();
    renderPage(true, ["10.0.0.1"]);

    await user.click(screen.getByText("Common:Disabled"));
    await save(user);

    await waitFor(() => expect(setIpRestrictions).toHaveBeenCalledWith([], false));
  });
});
