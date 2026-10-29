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

// The passphrase-change dialog rendered with the real ui-kit, for the
// behaviour that lives in the dialog chrome; KeyRotationDialog.test.tsx
// stubs the kit and covers the validation rules.

import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { KeyRotationDialog } from "../KeyRotationDialog";

beforeAll(() => {
  // The strength tooltip mounts floating-ui, which jsdom does not provide.
  globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
});

type DialogProps = React.ComponentProps<typeof KeyRotationDialog>;

const renderDialog = (props: Partial<DialogProps> = {}) => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  render(
    <KeyRotationDialog
      visible
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  );

  return { onSubmit, onCancel };
};

// A closed ModalDialog stays mounted, hidden from assistive technology, so the
// confirmation is looked up among the dialogs that are actually open.
const queryConfirmation = () =>
  screen
    .queryAllByRole("dialog")
    .find((dialog) =>
      within(dialog).queryByText("Common:UnsavedChangesDescription"),
    ) ?? null;

describe("KeyRotationDialog", () => {
  // Spec: private-rooms/key-management, "Key dialogs ignore a click beside them"
  it("Backdrop click on the passphrase-change dialog", () => {
    const { onCancel } = renderDialog();

    fireEvent.mouseDown(document.getElementById("modal-onMouseDown-close")!);

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Typed passphrase-change kept", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    const current = screen.getByPlaceholderText(
      "Common:EnterCurrentPassphrase",
    );

    await user.type(current, "old horse battery");
    await user.keyboard("{Escape}");
    expect(queryConfirmation()).not.toBeNull();

    await user.keyboard("{Escape}");

    expect(queryConfirmation()).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
    expect(current).toHaveValue("old horse battery");
  });
});
