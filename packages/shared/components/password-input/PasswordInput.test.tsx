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
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { InputSize, InputType } from "../text-input";
import { PasswordInput } from ".";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

const basePasswordSettings = {
  minLength: 6,
  upperCase: false,
  digits: false,
  specSymbols: false,
  digitsRegexStr: "(?=.*\\d)",
  upperCaseRegexStr: "(?=.*[A-Z])",
  specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
};

const baseProps = {
  inputName: "demoPasswordInput",
  emailInputName: "demoEmailInput",
  inputValue: "",
  size: InputSize.base,
  tooltipPasswordTitle: "Password must contain:",
  tooltipPasswordLength: "from 6 to 30 characters",
  tooltipPasswordDigits: "digits",
  tooltipPasswordCapital: "capital letters",
  tooltipPasswordSpecial: "special characters (!@#$%^&*)",
  generatorSpecial: "!@#$%^&*",
  passwordSettings: basePasswordSettings,
  isDisabled: false,
  placeholder: "password",
  onChange: jest.fn(),
  onValidateInput: jest.fn(),
};

describe("<PasswordInput />", () => {
  it("renders without error", () => {
    render(
      <PasswordInput inputType={InputType.password} size={InputSize.base} />,
    );

    expect(screen.getByTestId("password-input")).toBeInTheDocument();
  });

  it("renders with correct input type and name", () => {
    render(<PasswordInput {...baseProps} />);

    const input = screen.getByTestId("password-input").querySelector("input");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("name", "demoPasswordInput");
  });

  it("handles input value changes", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<PasswordInput {...baseProps} onChange={onChange} />);

    const input = screen.getByTestId("password-input").querySelector("input");
    await user.type(input!, "testpassword");

    expect(onChange).toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<PasswordInput {...baseProps} />);

    const input = screen.getByTestId("password-input").querySelector("input");
    const toggleButton = screen.getByTestId("icon-button");

    expect(input).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
  });

  it("shows tooltip with password requirements on focus", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        {...baseProps}
        passwordSettings={{
          ...basePasswordSettings,
          minLength: 8,
          upperCase: true,
          digits: true,
          specSymbols: true,
        }}
      />,
    );

    const input = screen.getByTestId("password-input").querySelector("input");
    await user.click(input!);

    expect(screen.getByText("Password must contain:")).toBeInTheDocument();
    expect(screen.getByText("from 6 to 30 characters")).toBeInTheDocument();
    expect(screen.getByText("digits")).toBeInTheDocument();
    expect(screen.getByText("capital letters")).toBeInTheDocument();
    expect(
      screen.getByText("special characters (!@#$%^&*)"),
    ).toBeInTheDocument();
  });

  it("handles disabled state correctly", () => {
    render(<PasswordInput {...baseProps} isDisabled />);

    const input = screen.getByTestId("password-input").querySelector("input");
    expect(input).toBeDisabled();
  });

  it("validates password requirements", async () => {
    const onValidateInput = jest.fn();
    const user = userEvent.setup();
    render(
      <PasswordInput
        {...baseProps}
        passwordSettings={{
          ...basePasswordSettings,
          minLength: 8,
          upperCase: true,
          digits: true,
          specSymbols: true,
        }}
        onValidateInput={onValidateInput}
      />,
    );

    const input = screen.getByTestId("password-input").querySelector("input");
    await user.type(input!, "Test123!@#");

    expect(onValidateInput).toHaveBeenCalled();
  });

  it("handles blur event correctly", async () => {
    const onBlur = jest.fn();
    const user = userEvent.setup();
    render(<PasswordInput {...baseProps} onBlur={onBlur} />);

    const input = screen.getByTestId("password-input").querySelector("input");
    await user.click(input!);
    await user.tab();

    expect(onBlur).toHaveBeenCalled();
  });

  it("simulates password typing when isSimulateType is true", async () => {
    const user = userEvent.setup();
    render(<PasswordInput {...baseProps} isSimulateType simulateSymbol="*" />);

    const input = screen.getByTestId("password-input").querySelector("input");
    await user.type(input!, "test");

    expect(input).toHaveValue("****");
  });

  it("applies custom style and className", () => {
    const customStyle = { width: "300px" };
    const customClass = "custom-password-input";

    render(
      <PasswordInput
        {...baseProps}
        style={customStyle}
        className={customClass}
      />,
    );

    const wrapper = screen.getByTestId("password-input");
    expect(wrapper).toHaveClass(customClass);
    expect(wrapper).toHaveStyle(customStyle);
  });

  // Additional test coverage
  it("handles keyDown events", async () => {
    const onKeyDown = jest.fn();
    const user = userEvent.setup();
    render(<PasswordInput {...baseProps} onKeyDown={onKeyDown} />);

    const input = screen.getByTestId("password-input").querySelector("input");
    await user.type(input!, "{enter}");

    expect(onKeyDown).toHaveBeenCalled();
  });

  it("displays error state correctly", () => {
    render(<PasswordInput {...baseProps} hasError />);

    const input = screen.getByTestId("password-input");
    expect(input).toHaveAttribute("data-error", "true");
  });

  it("displays warning state correctly", () => {
    render(<PasswordInput {...baseProps} hasWarning />);

    const input = screen.getByTestId("password-input");
    expect(input).toHaveAttribute("data-warning", "true");
  });

  it("handles auto-focus", () => {
    render(<PasswordInput {...baseProps} isAutoFocussed />);

    const input = screen.getByTestId("password-input").querySelector("input");
    expect(input).toHaveFocus();
  });

  it("renders in simple view mode", () => {
    render(<PasswordInput {...baseProps} simpleView />);

    // In simple view, certain elements should not be present
    expect(screen.queryByTestId("password-progress")).not.toBeInTheDocument();
    expect(screen.queryByTestId("copy-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("generate-password")).not.toBeInTheDocument();
  });

  it("applies full width when isFullWidth is true", () => {
    render(<PasswordInput {...baseProps} isFullWidth />);

    const wrapper = screen.getByTestId("password-input");
    expect(wrapper).toHaveStyle({ display: "block" });
  });

  it("handles different input sizes", () => {
    render(<PasswordInput {...baseProps} size={InputSize.large} />);

    const input = screen.getByTestId("password-input").querySelector("input");
    expect(input).toHaveAttribute("data-size", "large");
  });

  it("disables tooltip when isDisableTooltip is true", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        {...baseProps}
        isDisableTooltip
        passwordSettings={{
          ...basePasswordSettings,
          minLength: 8,
          upperCase: true,
          digits: true,
          specSymbols: true,
        }}
      />,
    );

    const input = screen.getByTestId("password-input").querySelector("input");
    await user.click(input!);

    expect(
      screen.queryByText("Password must contain:"),
    ).not.toBeInTheDocument();
  });

  it("handles custom autocomplete attribute", () => {
    render(<PasswordInput {...baseProps} autoComplete="current-password" />);

    const input = screen.getByTestId("password-input").querySelector("input");
    expect(input).toHaveAttribute("autocomplete", "current-password");
  });

  describe("Password Validation", () => {
    it("validates minimum length requirement", async () => {
      const onValidateInput = jest.fn();
      const user = userEvent.setup();
      render(
        <PasswordInput
          {...baseProps}
          passwordSettings={{
            ...basePasswordSettings,
            minLength: 8,
          }}
          onValidateInput={onValidateInput}
        />,
      );

      const input = screen.getByTestId("password-input").querySelector("input");
      await user.type(input!, "short");

      expect(onValidateInput).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ length: false }),
      );

      await user.type(input!, "longenough");
      expect(onValidateInput).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ length: true }),
      );
    });

    it("validates special characters requirement", async () => {
      const onValidateInput = jest.fn();
      const user = userEvent.setup();
      render(
        <PasswordInput
          {...baseProps}
          passwordSettings={{
            ...basePasswordSettings,
            specSymbols: true,
          }}
          onValidateInput={onValidateInput}
        />,
      );

      const input = screen.getByTestId("password-input").querySelector("input");
      await user.type(input!, "nospecial");

      expect(onValidateInput).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ special: false }),
      );

      await user.clear(input!);
      await user.type(input!, "with!@#special");
      expect(onValidateInput).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ special: true }),
      );
    });
  });

  describe("Input Behavior", () => {
    it("handles paste event correctly", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<PasswordInput {...baseProps} onChange={onChange} />);

      const input = screen.getByTestId("password-input").querySelector("input");
      await user.click(input!);
      await user.paste("pasted-password");

      expect(onChange).toHaveBeenCalled();
    });

    it("handles input with maxLength and simulated typing", async () => {
      const user = userEvent.setup();
      render(
        <PasswordInput
          {...baseProps}
          maxLength={5}
          isSimulateType
          simulateSymbol="*"
        />,
      );

      const input = screen.getByTestId("password-input").querySelector("input");
      await user.type(input!, "123456");

      expect(input).toHaveValue("*****");
    });
  });

  describe("Accessibility", () => {
    it("handles tab navigation correctly", async () => {
      const user = userEvent.setup();
      render(<PasswordInput {...baseProps} tabIndex={1} />);

      const input = screen.getByTestId("password-input").querySelector("input");
      expect(input).toHaveAttribute("tabindex", "1");

      await user.tab();
      expect(input).toHaveFocus();
    });
  });

  describe("Style and Layout", () => {
    it("applies custom width", () => {
      render(
        <PasswordInput {...baseProps} simpleView={false} inputWidth="300px" />,
      );

      const wrapper = screen.getByTestId("tooltipContent");
      expect(wrapper).toHaveStyle({ width: "300px" });
    });

    it("applies scale property correctly", () => {
      render(<PasswordInput {...baseProps} scale />);

      const wrapper = screen.getByTestId("password-input");
      expect(wrapper).toHaveAttribute("data-scale", "true");
    });
  });
});
