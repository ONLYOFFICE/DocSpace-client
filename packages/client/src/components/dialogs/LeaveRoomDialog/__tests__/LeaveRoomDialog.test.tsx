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
import { describe, expect, it, vi } from "vitest";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    (
      Component: React.ComponentType<{
        t: (key: string) => string;
        tReady: boolean;
      }>,
    ) =>
    (props: object) => (
      <Component t={(key: string) => key} tReady {...props} />
    ),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

const { default: LeaveRoomDialog } = await import("../index");

const renderDialog = (onLeaveRoomAction: () => Promise<unknown>) => {
  const setIsVisible = vi.fn();
  const Dialog = LeaveRoomDialog as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  render(
    <Dialog
      visible
      setIsVisible={setIsVisible}
      setChangeRoomOwnerIsVisible={vi.fn()}
      isRoomOwner={false}
      isFormSpace={false}
      isFormFiller={false}
      onLeaveRoomAction={onLeaveRoomAction}
    />,
  );

  return { setIsVisible };
};

describe("LeaveRoomDialog — leaving a private room", () => {
  it("Cleanup fails", async () => {
    const error = new Error("refused");
    const { setIsVisible } = renderDialog(async () => {
      throw error;
    });

    const submit = screen.getByTestId("leave_room_modal_submit");
    await userEvent.click(submit);

    await waitFor(() => expect(toastr.error).toHaveBeenCalledWith(error));
    expect(setIsVisible).not.toHaveBeenCalled();
    expect(submit).not.toBeDisabled();
  });

  it("Leave succeeds", async () => {
    const onLeaveRoomAction = vi.fn(async () => undefined);
    const { setIsVisible } = renderDialog(onLeaveRoomAction);

    await userEvent.click(screen.getByTestId("leave_room_modal_submit"));

    await waitFor(() => expect(setIsVisible).toHaveBeenCalledWith(false));
    expect(onLeaveRoomAction).toHaveBeenCalledTimes(1);
    expect(toastr.error).not.toHaveBeenCalled();
  });
});
