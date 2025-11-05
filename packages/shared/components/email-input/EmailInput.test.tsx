// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InputSize } from "../text-input";
import type { EmailInputProps } from "./EmailInput.types";
import { EmailInput } from ".";

const defaultProps: EmailInputProps = {
  id: "emailInputId",
  name: "emailInputName",
  value: "",
  size: InputSize.base,
  scale: false,
  isDisabled: false,
  isReadOnly: false,
  maxLength: 255,
  placeholder: "Enter email",
  onChange: vi.fn(),
  onValidateInput: vi.fn(),
  handleAnimationStart: vi.fn(),
  onBlur: vi.fn(),
  dataTestId: "email-input",
};

describe("<EmailInput />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders without error", () => {
    render(<EmailInput {...defaultProps} />);
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
  });

  it("renders with initial invalid value", () => {
    const email = "invalid-email";
    render(<EmailInput {...defaultProps} value={email} />);
    const input = screen.getByTestId("email-input");
    expect(input).toHaveValue(email);
  });

  it("handles input value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onValidateInput = vi.fn();
    render(
      <EmailInput
        {...defaultProps}
        onChange={onChange}
        onValidateInput={onValidateInput}
      />,
    );

    const input = screen.getByTestId("email-input");
    const testEmail = "test@example.com";

    await user.type(input, testEmail);

    expect(onChange).toHaveBeenCalled();
    expect(onValidateInput).toHaveBeenCalled();
    expect(input).toHaveValue(testEmail);
  });

  it("validates correct email formats", async () => {
    const user = userEvent.setup();
    const onValidateInput = vi.fn();
    render(<EmailInput {...defaultProps} onValidateInput={onValidateInput} />);

    const validEmails = [
      "simple@example.com",
      "disposable.style.email.with+symbol@example.com",
      "user.name+tag+sorting@example.com",
      "example-indeed@strange-example.com",
      "example@s.example",
    ];

    const input = screen.getByTestId("email-input");

    for (const email of validEmails) {
      await user.clear(input);
      await user.type(input, email);
      expect(onValidateInput).toHaveBeenLastCalledWith({
        value: email,
        isValid: true,
        errors: [],
      });
    }
  });

  it("validates incorrect email formats", async () => {
    const user = userEvent.setup();
    const onValidateInput = vi.fn();
    render(<EmailInput {...defaultProps} onValidateInput={onValidateInput} />);

    const invalidEmails = [
      "Abc.example.com",
      "A@b@c@example.com",
      'just"not"right@example.com',
      'this is"not\\allowed@example.com',
    ];

    const input = screen.getByTestId("email-input");

    for (const email of invalidEmails) {
      await user.clear(input);
      await user.type(input, email);
      expect(onValidateInput).toHaveBeenLastCalledWith({
        value: email,
        isValid: false,
        errors: expect.any(Array),
      });
    }
  });

  it("handles custom validation", async () => {
    const user = userEvent.setup();
    const customValidate = (value: string) => ({
      value,
      isValid: value.includes("custom"),
      errors: [],
    });

    const onValidateInput = vi.fn();
    render(
      <EmailInput
        {...defaultProps}
        customValidate={customValidate}
        onValidateInput={onValidateInput}
      />,
    );

    const input = screen.getByTestId("email-input");

    await user.type(input, "test@other-domain.com");
    expect(onValidateInput).toHaveBeenLastCalledWith({
      value: "test@other-domain.com",
      isValid: false,
      errors: [],
    });

    await user.clear(input);
    await user.type(input, "test@custom-domain.com");
    expect(onValidateInput).toHaveBeenLastCalledWith({
      value: "test@custom-domain.com",
      isValid: true,
      errors: [],
    });
  });

  it("handles disabled state", () => {
    render(<EmailInput {...defaultProps} isDisabled />);
    expect(screen.getByTestId("email-input")).toBeDisabled();
  });

  it("handles readonly state", () => {
    render(<EmailInput {...defaultProps} isReadOnly />);
    expect(screen.getByTestId("email-input")).toHaveAttribute("readonly");
  });

  it("handles blur events", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    const onValidateInput = vi.fn();
    render(
      <EmailInput
        {...defaultProps}
        onBlur={onBlur}
        onValidateInput={onValidateInput}
      />,
    );

    const input = screen.getByTestId("email-input");
    await user.click(input);
    await user.tab();

    expect(onBlur).toHaveBeenCalled();
  });

  it("respects maxLength prop", () => {
    render(<EmailInput {...defaultProps} maxLength={10} />);
    expect(screen.getByTestId("email-input")).toHaveAttribute(
      "maxLength",
      "10",
    );
  });

  it("validates empty value", () => {
    const onValidateInput = vi.fn();
    render(
      <EmailInput
        {...defaultProps}
        value=""
        onValidateInput={onValidateInput}
      />,
    );
    expect(onValidateInput).not.toHaveBeenCalled();
  });

  it("validates initial value on mount", () => {
    const onValidateInput = vi.fn();
    const email = "test@example.com";
    render(
      <EmailInput
        {...defaultProps}
        value={email}
        onValidateInput={onValidateInput}
      />,
    );
    expect(onValidateInput).not.toHaveBeenCalled();
  });

  it("handles maxLength boundary", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const maxLength = 10;
    const testString = "a".repeat(maxLength + 5);

    render(
      <EmailInput
        {...defaultProps}
        maxLength={maxLength}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId("email-input");
    await user.type(input, testString);

    // Only first maxLength characters should be entered
    expect(input).toHaveValue(testString.slice(0, maxLength));
    expect(onChange).toHaveBeenCalledTimes(maxLength);
  });
});
