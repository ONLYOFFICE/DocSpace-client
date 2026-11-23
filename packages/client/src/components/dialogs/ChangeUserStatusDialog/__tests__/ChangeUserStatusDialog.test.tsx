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


import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "mobx-react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("SRC_DIR/components/PaidQuotaLimitError", () => ({
  default: () => null,
}));

const ownershipRefusal = {
  response: {
    status: 403,
    data: {
      error: {
        message: "Server text",
        type: "ASC.Files.Core.Helpers.PrivateRoomOwnershipException",
      },
    },
  },
};

// The stores of the Provider supply the rest of the props.
const ChangeUserStatusDialog = (await import("../index"))
  .default as unknown as React.ComponentType<Record<string, unknown>>;

const renderDialog = (updateUserStatus: () => Promise<unknown>) =>
  render(
    <Provider
      peopleStore={{
        usersStore: {
          updateUserStatus,
          getPeopleListItem: vi.fn(),
          needResetUserSelection: false,
          setSelected: vi.fn(),
          setSelection: vi.fn(),
        },
      }}
      infoPanelStore={{ isVisible: false }}
    >
      <ChangeUserStatusDialog
        visible
        status={2}
        userIDs={["user-1"]}
        isGuests={false}
        onClose={vi.fn()}
      />
    </Provider>,
  );

describe("ChangeUserStatusDialog", () => {
  it("Deactivated owner", async () => {
    renderDialog(vi.fn(async () => Promise.reject(ownershipRefusal)));

    await userEvent.click(
      screen.getByTestId("change_user_status_dialog_submit"),
    );

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(
        "Common:PrivateRoomOwnerCannotBeDisabled",
      ),
    );
    expect(mocks.toastr.error).toHaveBeenCalledTimes(1);
  });

  it("shows another failure as before", async () => {
    renderDialog(vi.fn(async () => Promise.reject(new Error("402"))));

    await userEvent.click(
      screen.getByTestId("change_user_status_dialog_submit"),
    );

    await waitFor(() => expect(mocks.toastr.error).toHaveBeenCalledTimes(1));
    expect(mocks.toastr.error).not.toHaveBeenCalledWith(
      "Common:PrivateRoomOwnerCannotBeDisabled",
    );
  });
});
