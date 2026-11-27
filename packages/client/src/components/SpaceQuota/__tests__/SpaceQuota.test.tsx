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
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "mobx-react";

const toastr = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const people = vi.hoisted(() => ({
  setCustomUserQuota: vi.fn(),
  resetUserQuota: vi.fn(),
}));
const changeUserQuota = vi.hoisted(() => vi.fn());

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key, exists: () => true, language: "en" },
}));
vi.mock("@docspace/shared/api", async (importOriginal) => {
  const actual = (await importOriginal()) as { default: Record<string, object> };
  return {
    ...actual,
    default: { ...actual.default, people: { ...actual.default.people, ...people } },
  };
});
vi.mock("SRC_DIR/helpers/contacts", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  changeUserQuota,
}));

import SpaceQuota from "..";

const GB = 1024 * 1024 * 1024;

const renderQuota = (item: Record<string, unknown>, isDefaultUsersQuotaSet = true) =>
  render(
    <Provider
      peopleStore={{
        usersStore: { needResetUserSelection: false, setSelected: vi.fn() },
      }}
      filesActionsStore={{ changeRoomQuota: vi.fn() }}
      filesStore={{ setSelected: vi.fn() }}
      currentQuotaStore={{ isDefaultUsersQuotaSet, defaultUsersQuota: 5 * GB }}
      infoPanelStore={{ inRoom: () => false, isVisible: true }}
    >
      <SpaceQuota type="user" item={{ id: "u1", usedSpace: GB, ...item }} />
    </Provider>,
  );

const openMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByTestId("combobox"));
  return user;
};

beforeEach(() => {
  people.setCustomUserQuota.mockResolvedValue([{ id: "u1" }]);
  people.resetUserQuota.mockResolvedValue([{ id: "u1" }]);
});

describe("Storage quota of an account", () => {
  it("No default quota: only the used space, nothing to change", () => {
    renderQuota({ quotaLimit: 5 * GB }, false);

    expect(screen.queryByTestId("combobox")).toBeNull();
  });

  it("Default quota: change and disable offered, not set to default", async () => {
    renderQuota({ quotaLimit: 5 * GB });
    await openMenu();

    expect(screen.getByText("Common:ChangeQuota")).toBeInTheDocument();
    expect(screen.getByText("Common:DisableQuota")).toBeInTheDocument();
    expect(screen.queryByText("Common:SetToDefault")).toBeNull();
  });

  it("Change quota opens the quota dialog for the account", async () => {
    renderQuota({ quotaLimit: 5 * GB });
    const user = await openMenu();

    await user.click(screen.getByText("Common:ChangeQuota"));

    expect(changeUserQuota).toHaveBeenCalledWith(
      [expect.objectContaining({ id: "u1" })],
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("Disable: the limit is lifted and a toast confirms it", async () => {
    renderQuota({ quotaLimit: 5 * GB });
    const user = await openMenu();

    await user.click(screen.getByText("Common:DisableQuota"));

    await waitFor(() =>
      expect(toastr.success).toHaveBeenCalledWith("Common:StorageQuotaDisabled"),
    );
    expect(people.setCustomUserQuota).toHaveBeenCalledWith(["u1"], -1, false);
  });

  it("Custom quota: set to default resets it and a toast confirms it", async () => {
    renderQuota({ quotaLimit: 2 * GB, isCustomQuota: true });
    const user = await openMenu();

    await user.click(screen.getByText("Common:SetToDefault"));

    await waitFor(() =>
      expect(toastr.success).toHaveBeenCalledWith("Common:StorageQuotaReset"),
    );
    expect(people.resetUserQuota).toHaveBeenCalledWith(["u1"], false);
  });

  it("Refused: the error is shown", async () => {
    people.setCustomUserQuota.mockRejectedValue("Server error");
    renderQuota({ quotaLimit: 5 * GB });
    const user = await openMenu();

    await user.click(screen.getByText("Common:DisableQuota"));

    await waitFor(() => expect(toastr.error).toHaveBeenCalledWith("Server error"));
  });
});
