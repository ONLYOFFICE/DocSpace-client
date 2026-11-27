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

import { TrustedMailSection } from "../trustedMail";

const setMailDomainSettings = vi.fn();

const renderPage = (trustedDomainsType = 0, trustedDomains: string[] = []) =>
  render(
    <MemoryRouter initialEntries={["/portal-settings/security/access-portal"]}>
      <Provider
        settingsStore={{
          trustedDomainsType,
          trustedDomains,
          setMailDomainSettings,
          currentColorScheme: { main: { accent: "" } },
          trustedMailDomainSettingsUrl: "",
          currentDeviceType: DeviceType.desktop,
        }}
        setup={{ isInit: true }}
      >
        <TrustedMailSection />
      </Provider>
    </MemoryRouter>,
  );

const domainInputs = () => screen.getAllByTestId("trusted_mail_domain_input");

const save = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByTestId("trusted_mail_save_button"));

beforeEach(() => {
  sessionStorage.clear();
  setMailDomainSettings.mockResolvedValue(undefined);
});

describe("Trusted mail domains", () => {
  it("offers three modes", () => {
    renderPage();

    expect(screen.getByText("Common:Disabled")).toBeInTheDocument();
    expect(screen.getByText("AllDomains")).toBeInTheDocument();
    expect(screen.getByText("CustomDomains")).toBeInTheDocument();
  });

  it("Any domains: saved with a toast", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("AllDomains"));
    await save(user);

    await waitFor(() =>
      expect(setMailDomainSettings).toHaveBeenCalledWith({
        type: 2,
        domains: [],
        inviteUsersAsVisitors: true,
      }),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      "Common:SuccessfullySaveSettingsMessage",
    );
  });

  it("Custom domains: a malformed domain is marked when the field is left and blocks saving", async () => {
    const user = userEvent.setup();
    renderPage(1, ["example.com"]);

    await user.click(screen.getByTestId("trusted_mail_add_domain_button"));
    await user.type(domainInputs()[1], "not a domain");
    await user.tab();

    expect(screen.getByText("Common:IncorrectDomain")).toBeInTheDocument();

    await save(user);
    expect(setMailDomainSettings).not.toHaveBeenCalled();
  });

  it("Custom domains: a repeated domain blocks saving", async () => {
    const user = userEvent.setup();
    renderPage(1, ["example.com"]);

    await user.click(screen.getByTestId("trusted_mail_add_domain_button"));
    await user.type(domainInputs()[1], "example.com");
    await save(user);

    expect(screen.getByText("Common:DomainAlreadyAdded")).toBeInTheDocument();
    expect(setMailDomainSettings).not.toHaveBeenCalled();
  });

  it("Custom domains: well-formed domains are saved", async () => {
    const user = userEvent.setup();
    renderPage(1, ["example.com"]);

    await user.click(screen.getByTestId("trusted_mail_add_domain_button"));
    await user.type(domainInputs()[1], "example.org");
    await save(user);

    await waitFor(() =>
      expect(setMailDomainSettings).toHaveBeenCalledWith({
        type: 1,
        domains: ["example.com", "example.org"],
        inviteUsersAsVisitors: true,
      }),
    );
  });
});
