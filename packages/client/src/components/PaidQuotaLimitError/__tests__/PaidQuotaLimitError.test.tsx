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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "mobx-react";

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { clear: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

import InjectedPaidQuotaLimitError from "..";

const PaidQuotaLimitError =
  InjectedPaidQuotaLimitError as unknown as React.ComponentType;

const setInvitePanelOptions = vi.fn();
const navigate = vi.fn();

const renderError = ({
  isRoomAdmin = false,
  isCommunity = false,
  standalone = false,
  invitePanelVisible = false,
} = {}) =>
  render(
    <Provider
      authStore={{ isRoomAdmin }}
      dialogsStore={{
        setInvitePanelOptions,
        invitePanelOptions: { visible: invitePanelVisible },
      }}
      settingsStore={{ standalone }}
      currentTariffStatusStore={{ isCommunity }}
    >
      <PaidQuotaLimitError />
    </Provider>,
  );

beforeEach(() => {
  window.DocSpace = { ...window.DocSpace, navigate } as typeof window.DocSpace;
});

describe("Paid users limit message", () => {
  it("SaaS administrator: the message and a link to Billing", async () => {
    renderError({ invitePanelVisible: true });

    expect(screen.getByText("Common:QuotaPaidUserLimitError")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Common:Billing"));

    expect(navigate).toHaveBeenCalledWith("/portal-settings/payments/portal-payments");
    expect(setInvitePanelOptions).toHaveBeenCalledWith(
      expect.objectContaining({ visible: false }),
    );
  });

  it("Server installation: the link reads Payments", () => {
    renderError({ standalone: true });

    expect(screen.getByText("Common:PaymentsTitle")).toBeInTheDocument();
  });

  it.each([
    ["a Room admin", { isRoomAdmin: true }],
    ["Community Edition", { isCommunity: true, standalone: true }],
  ])("%s: the message without a link", (_, flags) => {
    renderError(flags);

    expect(screen.getByText("Common:QuotaPaidUserLimitError")).toBeInTheDocument();
    expect(screen.queryByText("Common:Billing")).toBeNull();
    expect(screen.queryByText("Common:PaymentsTitle")).toBeNull();
  });
});
