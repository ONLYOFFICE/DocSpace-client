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

import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { validateMnemonic } from "../../../services/encryption/recovery";
import { RecoveryPhraseInputModal } from "../RecoveryPhraseInputModal";

vi.mock("../../../services/encryption/recovery", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../services/encryption/recovery")>();
  return { ...actual, validateMnemonic: vi.fn(actual.validateMnemonic) };
});

// BIP-39 test vector: all-zero entropy, whose checksum word is "art".
const VALID_PHRASE = `${"abandon ".repeat(23)}art`;

type ModalProps = React.ComponentProps<typeof RecoveryPhraseInputModal>;

const renderModal = (props: Partial<ModalProps> = {}) => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  render(
    <RecoveryPhraseInputModal
      visible
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  );

  return { onSubmit, onCancel };
};

const getPhraseField = () => screen.getByRole("textbox") as HTMLTextAreaElement;

// Chrome moves the focus of a field that becomes disabled to the page body;
// jsdom leaves it on the field, and blur() does nothing on a disabled field.
const dropFocusToBody = () => {
  document.body.tabIndex = -1;
  document.body.focus();
  document.body.removeAttribute("tabindex");
  expect(document.body).toHaveFocus();
};

// A closed ModalDialog stays mounted, hidden from assistive technology, so the
// confirmation is looked up among the dialogs that are actually open.
const queryConfirmation = () =>
  screen
    .queryAllByRole("dialog")
    .find((dialog) =>
      within(dialog).queryByText("Common:UnsavedChangesDescription"),
    ) ?? null;

describe("RecoveryPhraseInputModal", () => {
  it("Typed recovery phrase kept", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();

    await user.type(getPhraseField(), "abandon abandon abandon");
    await user.keyboard("{Escape}");
    expect(queryConfirmation()).not.toBeNull();

    await user.click(
      within(queryConfirmation()!).getByRole("button", {
        name: "Common:CancelButton",
      }),
    );

    expect(queryConfirmation()).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
    expect(getPhraseField()).toHaveValue("abandon abandon abandon");
  });

  it("Recovery phrase on Enter", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(getPhraseField());
    await user.paste(VALID_PHRASE);
    await user.keyboard("{Enter}");

    expect(validateMnemonic).toHaveBeenCalledWith(VALID_PHRASE);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(VALID_PHRASE));
    expect(getPhraseField()).toHaveValue(VALID_PHRASE);
  });

  it("Line break in the recovery phrase", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(getPhraseField());
    await user.paste(VALID_PHRASE);
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    expect(getPhraseField()).toHaveValue(`${VALID_PHRASE}
`);
    expect(validateMnemonic).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Wrong recovery phrase", async () => {
    renderModal({ error: "Common:InvalidRecoveryPhrase" });
    const field = getPhraseField();

    expect(field).toHaveAttribute("aria-invalid", "true");
    const described = (field.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(described).toContain("Common:InvalidRecoveryPhrase");
    expect(field).toHaveAccessibleName("Common:RecoveryPhraseInputHint");
    await waitFor(() =>
      expect(screen.getByTestId("key-dialog-announcement")).toHaveTextContent(
        "Common:InvalidRecoveryPhrase",
      ),
    );
  });

  it("Focus kept after a wrong recovery phrase: restore refused", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    let failRestore = () => {};
    const Host = () => {
      const [restoring, setRestoring] = useState(false);
      const [error, setError] = useState<string | null>(null);
      failRestore = () => {
        setRestoring(false);
        setError("Common:InvalidRecoveryPhrase");
      };
      return (
        <RecoveryPhraseInputModal
          visible
          isLoading={restoring}
          error={error}
          onSubmit={(mnemonic) => {
            onSubmit(mnemonic);
            setError(null);
            setRestoring(true);
          }}
          onCancel={() => {}}
        />
      );
    };
    render(<Host />);

    await user.click(getPhraseField());
    await user.paste(VALID_PHRASE);
    await user.keyboard("{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    dropFocusToBody();
    act(() => failRestore());

    expect(getPhraseField()).toHaveFocus();
  });

  it("Focus kept after a wrong recovery phrase: checksum refused", async () => {
    const user = userEvent.setup();
    let settle: (ok: boolean) => void = () => {};
    vi.mocked(validateMnemonic).mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          settle = resolve;
        }),
    );
    renderModal();

    await user.click(getPhraseField());
    await user.paste(VALID_PHRASE);
    await user.keyboard("{Enter}");
    expect(getPhraseField()).toBeDisabled();
    dropFocusToBody();
    await act(async () => settle(false));

    expect(getPhraseField()).toHaveAttribute("aria-invalid", "true");
    expect(getPhraseField()).toHaveFocus();
  });
});
