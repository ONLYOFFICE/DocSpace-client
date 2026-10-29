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

import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PassphraseModal } from "../PassphraseModal";

beforeAll(() => {
  // The strength tooltip mounts floating-ui, which jsdom does not provide.
  globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
});

type ModalProps = React.ComponentProps<typeof PassphraseModal>;

const renderModal = (props: Partial<ModalProps> = {}) => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  render(
    <PassphraseModal
      visible
      isNew={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  );

  return { onSubmit, onCancel };
};

const getPassphraseInput = () =>
  screen.getByPlaceholderText("Common:Passphrase") as HTMLInputElement;

// A closed ModalDialog stays mounted, hidden from assistive technology, so the
// confirmation is looked up among the dialogs that are actually open.
const queryConfirmation = () =>
  screen
    .queryAllByRole("dialog")
    .find((dialog) =>
      within(dialog).queryByText("Common:UnsavedChangesDescription"),
    ) ?? null;

describe("PassphraseModal", () => {
  it("submits the passphrase on Enter", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(getPassphraseInput(), "correct horse battery");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("correct horse battery", undefined);
  });

  it("passes the remember device flag on Enter", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ showRememberDevice: true });

    await user.type(getPassphraseInput(), "correct horse battery");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("correct horse battery", false);
  });

  it("Option explains the trade-off: the remember option carries its hint", () => {
    renderModal({ showRememberDevice: true });
    expect(screen.getByText("Common:RememberDeviceHint")).toBeInTheDocument();
  });

  it("shows no remember hint when the option is not offered", () => {
    renderModal();
    expect(screen.queryByText("Common:RememberDeviceHint")).toBeNull();
  });

  it("ignores Enter while the passphrase is too short", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(getPassphraseInput(), "short");
    await user.keyboard("{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ignores Enter while the submit is in progress", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ isLoading: true });

    await user.type(getPassphraseInput(), "correct horse battery");
    await user.keyboard("{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits both fields on Enter when creating a passphrase", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ isNew: true });

    await user.type(getPassphraseInput(), "Correct1horse!battery");
    await user.type(
      screen.getByPlaceholderText("Common:ConfirmPassphrase"),
      "Correct1horse!battery",
    );
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("Correct1horse!battery", undefined);
  });

  // Spec: private-rooms/key-management, "Key dialogs ignore a click beside them"
  it("Backdrop click on the unlock prompt", () => {
    const { onCancel } = renderModal();

    fireEvent.mouseDown(document.getElementById("modal-onMouseDown-close")!);

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Escape still cancels", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Typed passphrase kept", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal({ isNew: true });

    await user.type(getPassphraseInput(), "Correct1horse!battery");
    await user.keyboard("{Escape}");
    expect(queryConfirmation()).not.toBeNull();

    await user.keyboard("{Escape}");

    expect(queryConfirmation()).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
    expect(getPassphraseInput()).toHaveValue("Correct1horse!battery");
  });

  it("Typed passphrase discarded", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal({ isNew: true });

    await user.type(getPassphraseInput(), "Correct1horse!battery");
    await user.keyboard("{Escape}");
    await user.click(
      within(queryConfirmation()!).getByRole("button", {
        name: "Common:CloseMenu",
      }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(queryConfirmation()).toBeNull();
  });

  it("Nothing typed yet", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal({ isNew: true });

    await user.keyboard("{Escape}");

    expect(queryConfirmation()).toBeNull();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Unlock prompt closes at once", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();

    await user.type(getPassphraseInput(), "correct horse battery");
    await user.keyboard("{Escape}");

    expect(queryConfirmation()).toBeNull();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
