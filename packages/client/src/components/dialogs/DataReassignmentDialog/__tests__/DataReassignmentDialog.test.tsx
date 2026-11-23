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


import { render, waitFor } from "@testing-library/react";
import { Provider } from "mobx-react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("react-i18next", () => ({
  withTranslation:
    () => (Component: React.ComponentType<Record<string, unknown>>) =>
    (props: Record<string, unknown>) => (
      <Component {...props} t={(key: string) => key} tReady />
    ),
}));

vi.mock("../sub-components/Body", () => ({ default: () => null }));
vi.mock("../sub-components/Footer", () => ({ default: () => null }));

// The stores of the Provider supply the rest of the props.
const DataReassignmentDialog = (await import("../index"))
  .default as unknown as React.ComponentType<Record<string, unknown>>;

const USER = { id: "user-1" };

/** The dialog starts the reassignment to the current user as soon as it opens. */
const renderDialog = (keptPrivateRoomIds?: number[]) =>
  render(
    <Provider
      settingsStore={{}}
      userStore={{ user: { id: "admin-1" } }}
      infoPanelStore={{ isVisible: false }}
      peopleStore={{
        dialogStore: {
          setDataReassignmentDialogVisible: vi.fn(),
          setDataReassignmentDeleteProfile: vi.fn(),
        },
        usersStore: { needResetUserSelection: false, setSelected: vi.fn() },
      }}
    >
      <DataReassignmentDialog
        visible
        data={{
          user: USER,
          currentUserAsDefault: true,
          reassignUserData: vi.fn(async () => undefined),
          getReassignmentProgress: vi.fn(async () => ({
            percentage: 100,
            isCompleted: true,
            status: 2,
            keptPrivateRoomIds,
          })),
          cancelReassignment: vi.fn(),
        }}
      />
    </Provider>,
  );

describe("DataReassignmentDialog", () => {
  it("Private rooms kept", async () => {
    renderDialog([1567]);

    await waitFor(() =>
      expect(mocks.toastr.warning).toHaveBeenCalledWith(
        "Common:PrivateRoomsKeptWithAccount",
      ),
    );
    expect(mocks.toastr.success).not.toHaveBeenCalled();
  });

  it.each([
    ["an empty list", []],
    ["no field", undefined],
  ])("Every private room moved: %s", async (_, kept) => {
    renderDialog(kept);

    await waitFor(() =>
      expect(mocks.toastr.success).toHaveBeenCalledWith(
        "Common:ChangesSavedSuccessfully",
      ),
    );
    expect(mocks.toastr.warning).not.toHaveBeenCalled();
  });
});
