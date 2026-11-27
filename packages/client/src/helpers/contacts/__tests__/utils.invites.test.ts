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

import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  resendUserInvites: vi.fn(),
  resendInvitesAgain: vi.fn(),
  getLinkToShareGuest: vi.fn(),
}));
const toastr = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
const copyShareLink = vi.hoisted(() => vi.fn());
const toasts = vi.hoisted(() => ({
  showEmailActivationToast: vi.fn(),
  showSuccessCopyContantLink: vi.fn(),
}));

vi.mock("@docspace/shared/api/people", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...api,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("@docspace/shared/utils/copy", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  copyShareLink,
}));
vi.mock("../../people-helpers", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...toasts,
}));

import { onInviteAgainClick, onInviteMultipleAgain, shareGuest } from "../utils";

type TItem = Parameters<typeof onInviteAgainClick>[0];

const t = ((key: string) => key) as Parameters<typeof onInviteAgainClick>[1];
const pending = { id: "u1", email: "ann@example.com" } as TItem;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  api.resendUserInvites.mockResolvedValue(undefined);
  api.resendInvitesAgain.mockResolvedValue(undefined);
  api.getLinkToShareGuest.mockResolvedValue("https://portal/guest-link");
});

describe("Repeating invitations", () => {
  it("Invite again: the invitation is resent and the toast names the email", async () => {
    onInviteAgainClick(pending, t);
    await flush();

    expect(api.resendUserInvites).toHaveBeenCalledWith(["u1"]);
    expect(toasts.showEmailActivationToast).toHaveBeenCalledWith(
      "ann@example.com",
      t,
    );
  });

  it("Invite again fails: the error is shown and no success toast", async () => {
    api.resendUserInvites.mockRejectedValue("Server error");

    onInviteAgainClick(pending, t);
    await flush();

    expect(toastr.error).toHaveBeenCalledWith("Server error");
    expect(toasts.showEmailActivationToast).not.toHaveBeenCalled();
  });

  it("Several pending accounts: all invited again, one toast", async () => {
    onInviteMultipleAgain(t);
    await flush();

    expect(api.resendInvitesAgain).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalledWith(
      "PeopleTranslations:SuccessSentMultipleInvitatios",
    );
  });
});

describe("Sharing a guest", () => {
  it("The guest's link is copied and a toast confirms it", async () => {
    shareGuest({ id: "g1" } as TItem, t);
    await flush();

    expect(api.getLinkToShareGuest).toHaveBeenCalledWith("g1");
    expect(copyShareLink).toHaveBeenCalledWith("https://portal/guest-link");
    expect(toasts.showSuccessCopyContantLink).toHaveBeenCalledWith(t);
  });
});
