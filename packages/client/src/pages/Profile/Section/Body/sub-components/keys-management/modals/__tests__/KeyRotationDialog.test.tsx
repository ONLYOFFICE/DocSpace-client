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

/**
 * Unit tests for KeyRotationDialog passphrase-length validation.
 *
 * Heavy UI-kit components are replaced with lightweight wrappers that
 * expose the same props (inputValue / onChange / onClick / isDisabled /
 * errorMessage) via HTML attributes so we can assert on them without a
 * full DOM render stack.
 *
 * NOTE: vi.mock factories are hoisted to top-of-file by Vitest; all
 * component definitions must live inside the factory closures.
 */

import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PASSPHRASE_MIN_LENGTH } from "@docspace/shared/services/encryption/passphrase-strength";

// ---------------------------------------------------------------------------
// Mock heavy UI-kit dependencies — factories must be self-contained
// ---------------------------------------------------------------------------

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const ModalDialog = ({
    children,
    visible,
  }: {
    children?: React.ReactNode;
    visible?: boolean;
  }) => (visible ? React.createElement("div", { "data-testid": "modal" }, children) : null);
  ModalDialog.Header = ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", null, children);
  ModalDialog.Body = ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", null, children);
  ModalDialog.Footer = ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", null, children);
  return { ModalDialog, ModalDialogType: { modal: "modal" } };
});

vi.mock("@onlyoffice/apps-ui-kit/components/button", () => ({
  Button: ({
    onClick,
    isDisabled,
    label,
  }: {
    onClick?: () => void;
    isDisabled?: boolean;
    label?: string;
  }) =>
    React.createElement("button", {
      onClick,
      disabled: isDisabled,
      "data-label": label,
      "data-testid": label,
    }, label),
  ButtonSize: { normal: "normal" },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/password-input", () => ({
  PasswordInput: ({
    inputValue,
    onChange,
    inputName,
    hasError,
    simpleView,
    passwordSettings,
    onValidateInput,
  }: {
    inputValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputName?: string;
    hasError?: boolean;
    simpleView?: boolean;
    passwordSettings?: {
      minLength: number;
      digitsRegexStr: string;
      upperCaseRegexStr: string;
      specSymbolsRegexStr: string;
    };
    onValidateInput?: (rulesPassed: boolean) => void;
  }) =>
    React.createElement("input", {
      "data-testid": inputName,
      value: inputValue ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // Outside the simple view the kit checks its rules on every change.
        if (!simpleView && passwordSettings) {
          const { value } = e.target;
          onValidateInput?.(
            value.trim().length >= passwordSettings.minLength &&
              [
                passwordSettings.digitsRegexStr,
                passwordSettings.upperCaseRegexStr,
                passwordSettings.specSymbolsRegexStr,
              ].every((rule) => new RegExp(rule).test(value)),
          );
        }
        onChange?.(e);
      },
      "data-has-error": String(hasError),
    }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/text-input", () => ({
  InputSize: { base: "base" },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/field-container", () => ({
  FieldContainer: ({
    children,
    errorMessage,
    hasError,
  }: {
    children?: React.ReactNode;
    errorMessage?: string;
    hasError?: boolean;
  }) =>
    React.createElement(
      "div",
      {
        "data-error-message": errorMessage,
        "data-has-error": String(hasError),
      },
      children,
    ),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/link", () => ({
  Link: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("span", null, children),
  LinkType: { action: "action" },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/text", () => ({
  Text: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("span", null, children),
}));

vi.mock("../KeyRotationDialog.module.scss", () => ({ default: {} }));

// ---------------------------------------------------------------------------
// Import SUT after mocks are registered
// ---------------------------------------------------------------------------
import { KeyRotationDialog } from "../KeyRotationDialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function typeInto(testId: string, value: string) {
  const input = screen.getByTestId(testId) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

const makeProps = (onSubmit = vi.fn()) => ({
  visible: true,
  onSubmit,
  onCancel: vi.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("KeyRotationDialog — passphrase minimum-length guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses PASSPHRASE_MIN_LENGTH (12) — sanity check on shared constant", () => {
    expect(PASSPHRASE_MIN_LENGTH).toBe(12);
  });

  it("blocks submission when new passphrase is 8 chars (below minimum)", () => {
    const onSubmit = vi.fn();
    render(<KeyRotationDialog {...makeProps(onSubmit)} />);
    typeInto("currentPassphrase", "old-current-pass");
    typeInto("newPassphrase", "12345678"); // 8 chars
    typeInto("confirmNewPassphrase", "12345678");
    act(() => {
      fireEvent.click(screen.getByTestId("Common:SaveButton"));
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submission when new passphrase is 11 chars (one below minimum)", () => {
    const onSubmit = vi.fn();
    render(<KeyRotationDialog {...makeProps(onSubmit)} />);
    typeInto("currentPassphrase", "old-current-pass");
    typeInto("newPassphrase", "12345678901"); // 11 chars
    typeInto("confirmNewPassphrase", "12345678901");
    act(() => {
      fireEvent.click(screen.getByTestId("Common:SaveButton"));
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows PassphraseTooShort error key when passphrase drops below 12 after a submit attempt", () => {
    // Scenario: user types a valid (12-char) passphrase, which makes the
    // button enabled and triggers a submit.  Then they edit the passphrase
    // down to 8 chars — at that point attemptedSubmit is already true, so
    // the inline error message must appear.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<KeyRotationDialog {...makeProps(onSubmit)} />);

    // Step 1: type valid values (>=12 chars, different current/new)
    act(() => {
      typeInto("currentPassphrase", "old-current-pass");
      typeInto("newPassphrase", "ValidPass123!"); // 13 chars
      typeInto("confirmNewPassphrase", "ValidPass123!");
    });

    // Step 2: click submit (button is enabled at this point)
    act(() => {
      fireEvent.click(screen.getByTestId("Common:SaveButton"));
    });

    // Step 3: edit new passphrase down to 8 chars (button becomes disabled again)
    act(() => {
      typeInto("newPassphrase", "12345678"); // 8 chars
      typeInto("confirmNewPassphrase", "12345678");
    });

    // Now attemptedSubmit=true AND newPassphrase.length (8) < PASSPHRASE_MIN_LENGTH (12)
    // → PassphraseTooShort error should be shown
    const errorContainers = container.querySelectorAll("[data-error-message]");
    const errorMessages = Array.from(errorContainers).map((el) =>
      el.getAttribute("data-error-message"),
    );
    expect(errorMessages).toContain("Common:PassphraseTooShort");
  });

  it("disables submit button when new passphrase is shorter than 12 chars", () => {
    render(<KeyRotationDialog {...makeProps()} />);
    typeInto("currentPassphrase", "old-current-pass");
    typeInto("newPassphrase", "tooshort"); // 8 chars
    typeInto("confirmNewPassphrase", "tooshort");
    const btn = screen.getByTestId("Common:SaveButton") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("allows submission when new passphrase is exactly 12 chars", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<KeyRotationDialog {...makeProps(onSubmit)} />);
    typeInto("currentPassphrase", "old-pass-here");
    typeInto("newPassphrase", "Rv7mKt2p!x9w"); // 12 chars, different from current
    typeInto("confirmNewPassphrase", "Rv7mKt2p!x9w");
    await act(async () => {
      fireEvent.click(screen.getByTestId("Common:SaveButton"));
    });
    expect(onSubmit).toHaveBeenCalledWith("old-pass-here", "Rv7mKt2p!x9w");
  });

  it("allows submission when new passphrase is 13 chars (above minimum)", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<KeyRotationDialog {...makeProps(onSubmit)} />);
    typeInto("currentPassphrase", "old-pass-here");
    typeInto("newPassphrase", "Rv7mKt2p!x9wz"); // 13 chars
    typeInto("confirmNewPassphrase", "Rv7mKt2p!x9wz");
    await act(async () => {
      fireEvent.click(screen.getByTestId("Common:SaveButton"));
    });
    expect(onSubmit).toHaveBeenCalledWith("old-pass-here", "Rv7mKt2p!x9wz");
  });

  it("enables submit button when all fields are valid (>=12 chars)", () => {
    render(<KeyRotationDialog {...makeProps()} />);
    typeInto("currentPassphrase", "old-current-pass");
    typeInto("newPassphrase", "ValidPass123!"); // 13 chars, different from current
    typeInto("confirmNewPassphrase", "ValidPass123!");
    const btn = screen.getByTestId("Common:SaveButton") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("keeps Save disabled until the kit rules are met", () => {
    render(<KeyRotationDialog {...makeProps()} />);
    typeInto("currentPassphrase", "old-current-pass");
    typeInto("newPassphrase", "Rv7mKt2pQx9w"); // not weak, no special character
    typeInto("confirmNewPassphrase", "Rv7mKt2pQx9w");
    const btn = screen.getByTestId("Common:SaveButton") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("Passphrase change", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<KeyRotationDialog {...makeProps(onSubmit)} />);
    typeInto("currentPassphrase", "old-current-pass");
    typeInto("newPassphrase", "Qwerty123456!"); // meets the kit rules, common pattern
    typeInto("confirmNewPassphrase", "Qwerty123456!");

    const newField = screen.getByTestId("newPassphrase");
    expect(newField).toHaveAttribute("data-has-error", "true");
    expect(newField.closest("[data-error-message]")).toHaveAttribute(
      "data-error-message",
      "Common:PassphraseCommonPattern",
    );
    const btn = screen.getByTestId("Common:SaveButton") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("KeyRotationDialog: a new passphrase equal to the current one is named", () => {
  const SAME = "Correct1horse!battery";

  const newFieldError = () =>
    screen
      .getByTestId("newPassphrase")
      .closest("[data-error-message]")
      ?.getAttribute("data-error-message");

  it("Same passphrase typed", () => {
    render(<KeyRotationDialog {...makeProps()} />);
    typeInto("currentPassphrase", SAME);
    typeInto("newPassphrase", SAME);

    expect(screen.getByTestId("newPassphrase")).toHaveAttribute(
      "data-has-error",
      "true",
    );
    expect(newFieldError()).toBe("Common:PassphraseMustBeDifferent");
    expect(screen.getByTestId("Common:SaveButton")).toBeDisabled();
  });

  it("Enter with the same passphrase", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<KeyRotationDialog {...makeProps(onSubmit)} />);
    typeInto("currentPassphrase", SAME);
    typeInto("newPassphrase", SAME);
    typeInto("confirmNewPassphrase", SAME);

    await act(async () => {
      fireEvent.click(screen.getByTestId("Common:SaveButton"));
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Passphrase corrected", () => {
    render(<KeyRotationDialog {...makeProps()} />);
    typeInto("currentPassphrase", SAME);
    typeInto("newPassphrase", SAME);
    typeInto("newPassphrase", "Another1horse!battery");

    expect(screen.getByTestId("newPassphrase")).toHaveAttribute(
      "data-has-error",
      "false",
    );
    expect(newFieldError()).toBe("");
  });

  it("No error before a new passphrase is typed", () => {
    render(<KeyRotationDialog {...makeProps()} />);
    typeInto("currentPassphrase", SAME);

    expect(newFieldError()).toBe("");
  });
});
