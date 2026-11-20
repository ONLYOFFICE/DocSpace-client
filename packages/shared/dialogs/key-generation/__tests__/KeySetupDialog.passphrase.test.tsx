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

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { KeySetupDialog } from "../KeySetupDialog";

const CYRILLIC = "абвгдеёжзийклмнопрсту";
const CJK = "春眠不觉晓处处闻啼鸟夜来风雨声花落知多少";

beforeAll(() => {
  // The strength tooltip mounts floating-ui, which jsdom does not provide.
  globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
});

const renderDialog = () => {
  const onPassphraseSubmit = vi.fn();

  render(
    <KeySetupDialog
      step="passphrase"
      mnemonic={null}
      isLoading={false}
      onContinue={vi.fn()}
      onPassphraseSubmit={onPassphraseSubmit}
      onRecoveryConfirm={vi.fn()}
      onBack={vi.fn()}
      onCancel={vi.fn()}
    />,
  );

  return { onPassphraseSubmit };
};

const getPassphraseInput = () =>
  screen.getByPlaceholderText("Common:Passphrase") as HTMLInputElement;

const getConfirmInput = () =>
  screen.getByPlaceholderText("Common:ConfirmPassphrase") as HTMLInputElement;

const getContinue = () =>
  screen.getByRole("button", { name: "Common:ContinueButton" });

const enterTwice = async (passphrase: string) => {
  const user = userEvent.setup();
  await user.type(getPassphraseInput(), passphrase);
  await user.type(getConfirmInput(), passphrase);
};

const expectNoError = () => {
  expect(getPassphraseInput()).not.toHaveAttribute("aria-invalid", "true");
  expect(screen.queryByText("Common:PassphraseCommonPattern")).toBeNull();
  expect(screen.getByTestId("key-dialog-announcement").textContent).toBe("");
};

const anotherScript = (lengths: number[]) =>
  lengths.flatMap((length) => [
    ["Cyrillic", length, CYRILLIC.slice(0, length)] as const,
    ["CJK", length, CJK.slice(0, length)] as const,
  ]);

describe("A new passphrase needs no particular characters", () => {
  it.each(anotherScript([12, 16, 20]))(
    "Passphrase in another script: %s, %i characters",
    async (_, length, passphrase) => {
      expect(passphrase).toHaveLength(length);
      const { onPassphraseSubmit } = renderDialog();

      await enterTwice(passphrase);

      await waitFor(() => expect(getContinue()).toBeEnabled());
      expectNoError();

      await userEvent.setup().click(getContinue());
      expect(onPassphraseSubmit).toHaveBeenCalledWith(passphrase);
    },
  );

  it.each(anotherScript([11]))(
    "Too short in another script: %s, %i characters",
    async (_, length, passphrase) => {
      expect(passphrase).toHaveLength(length);
      renderDialog();

      await enterTwice(passphrase);

      expect(getContinue()).toBeDisabled();
    },
  );

  it("Lowercase words", async () => {
    renderDialog();

    await enterTwice("lorem ipsum dolor sitx");

    await waitFor(() => expect(getContinue()).toBeEnabled());
  });

  it("Common pattern still refused", async () => {
    const { onPassphraseSubmit } = renderDialog();

    await enterTwice("my password is long");

    expect(getContinue()).toBeDisabled();
    fireEvent.keyDown(getConfirmInput(), { key: "Enter" });
    expect(onPassphraseSubmit).not.toHaveBeenCalled();
  });
});

describe("The strength grade does not contradict the passphrase rules", () => {
  it("Accepted passphrase is not weak", async () => {
    renderDialog();
    const passphrase = "!@#$%^&*()_+";
    expect(passphrase).toHaveLength(12);

    await enterTwice(passphrase);

    expect(screen.getByTestId("passphrase_strength")).not.toHaveTextContent(
      "Common:PassphraseStrengthWeak",
    );
    expect(screen.getByTestId("passphrase_strength")).toHaveTextContent(
      /Common:PassphraseStrength(Fair|Good|Strong)$/,
    );
    await waitFor(() => expect(getContinue()).toBeEnabled());
  });
});
