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

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TRemoveUserReason } from "../RemoveUserConfirmationDialog.types";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

const { default: RemoveUserConfirmationDialog } = await import("../index");

const Dialog = RemoveUserConfirmationDialog as unknown as React.ComponentType<
  Record<string, unknown>
>;

const renderFor = (reason?: TRemoveUserReason) =>
  render(
    <Dialog
      removeUserConfirmation={{
        visible: true,
        callback: vi.fn(async () => {}),
        reason,
      }}
      setRemoveUserConfirmation={vi.fn()}
    />,
  );

describe("RemoveUserConfirmationDialog", () => {
  it("warns about form filling by default", () => {
    renderFor();

    expect(
      screen.getByText("People:RemoveUserConfirmationText"),
    ).toBeInTheDocument();
  });

  it("warns about form filling", () => {
    renderFor("formFilling");

    expect(
      screen.getByText("People:RemoveUserConfirmationText"),
    ).toBeInTheDocument();
  });

  it("warns about the keys of an encrypted room", () => {
    renderFor("encryptedRoom");

    expect(
      screen.getByText("Common:RemoveUserFromEncryptedRoomWarning"),
    ).toBeInTheDocument();
  });

  it("Agent manager removes a Member", () => {
    renderFor("agentMember");

    expect(
      screen.getByText("Common:RemoveAgentMemberWarning"),
    ).toBeInTheDocument();
    expect(screen.queryByText("People:RemoveUserConfirmationText")).toBeNull();
  });
});
