// (c) Copyright Ascensio System SIA 2009-2024
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
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { Base } from "../../themes";
import type { TColorScheme, TInterfaceDirection } from "../../themes";

import { Button } from ".";
import { ButtonSize } from "./Button.enums";

const baseProps = {
  size: ButtonSize.extraSmall,
  isDisabled: false,
  label: "OK",
  onClick: jest.fn(),
};

const mockColorScheme: TColorScheme = {
  id: 1,
  name: "Mock Theme",
  main: {
    accent: "#4781D1",
    buttons: "#4781D1",
  },
  text: {
    accent: "#FFFFFF",
    buttons: "#FFFFFF",
  },
};

const mockTheme = {
  ...Base,
  isBase: true,
  currentColorScheme: mockColorScheme,
  interfaceDirection: "ltr" as TInterfaceDirection,
  button: {
    ...Base.button,
    color: {
      base: "#333333",
      baseHover: "#666666",
      baseActive: "#000000",
      baseDisabled: "#999999",
      primary: "#4781D1",
      primaryHover: "#5D95E5",
      primaryActive: "#366AAF",
      primaryDisabled: "#A6C5EF",
    },
    backgroundColor: {
      base: "#FFFFFF",
      baseHover: "#F8F9F9",
      baseActive: "#ECEEF1",
      baseDisabled: "#FFFFFF",
      primary: "#4781D1",
      primaryHover: "#5D95E5",
      primaryActive: "#366AAF",
      primaryDisabled: "#A6C5EF",
    },
    border: {
      base: "1px solid #D0D5DA",
      baseHover: "1px solid #A3A9AE",
      baseActive: "1px solid #666666",
      baseDisabled: "1px solid #ECEEF1",
      primary: "1px solid #4781D1",
      primaryHover: "1px solid #5D95E5",
      primaryActive: "1px solid #366AAF",
      primaryDisabled: "1px solid #A6C5EF",
    },
    boxSizing: "border-box",
    display: "inline-block",
    fontWeight: "600",
    margin: "0",
    height: {
      ...Base.button.height,
      [ButtonSize.extraSmall]: "24px",
      [ButtonSize.small]: "32px",
      [ButtonSize.normal]: "40px",
      medium: "44px",
    },
    fontSize: {
      ...Base.button.fontSize,
      [ButtonSize.extraSmall]: "12px",
      [ButtonSize.small]: "13px",
      [ButtonSize.normal]: "14px",
    },
    padding: {
      [ButtonSize.extraSmall]: "2px 12px",
      [ButtonSize.small]: "0 16px",
      [ButtonSize.normal]: "0 28px",
      medium: "0 28px",
    },
  },
  fontFamily: "Open Sans, sans-serif, Arial",
};

const renderWithTheme = (component: React.ReactNode, theme = mockTheme) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("<Button />", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders without error", () => {
    renderWithTheme(<Button {...baseProps} />);
    expect(screen.getByTestId("button")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  test("handles click events", async () => {
    renderWithTheme(<Button {...baseProps} />);
    const button = screen.getByTestId("button");

    await userEvent.click(button);
    expect(baseProps.onClick).toHaveBeenCalledTimes(1);
  });

  test("renders icon when provided", () => {
    const icon = <span data-testid="test-icon">🔍</span>;
    renderWithTheme(<Button {...baseProps} icon={icon} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  test("applies different sizes correctly", () => {
    const { rerender } = renderWithTheme(
      <Button {...baseProps} size={ButtonSize.extraSmall} />,
    );
    expect(screen.getByTestId("button")).toHaveStyle({
      height: mockTheme.button.height[ButtonSize.extraSmall],
      fontSize: mockTheme.button.fontSize[ButtonSize.extraSmall],
    });

    rerender(
      <ThemeProvider theme={mockTheme}>
        <Button {...baseProps} size={ButtonSize.normal} />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("button")).toHaveStyle({
      height: mockTheme.button.height[ButtonSize.normal],
      fontSize: mockTheme.button.fontSize[ButtonSize.normal],
    });
  });

  test("uses default size when no size is provided", () => {
    renderWithTheme(<Button {...baseProps} size={undefined} />);
    expect(screen.getByTestId("button")).toHaveStyle({
      height: mockTheme.button.height[ButtonSize.normal],
      fontSize: mockTheme.button.fontSize[ButtonSize.normal],
    });
  });

  test("disables button when isDisabled is true", async () => {
    const onClick = jest.fn();
    renderWithTheme(<Button {...baseProps} isDisabled onClick={onClick} />);

    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("applies custom className", () => {
    renderWithTheme(<Button {...baseProps} className="custom-class" />);
    expect(screen.getByTestId("button")).toHaveClass("custom-class");
  });

  test("applies custom style", () => {
    const customStyle = { backgroundColor: "red" };
    renderWithTheme(<Button {...baseProps} style={customStyle} />);
    expect(screen.getByTestId("button")).toHaveStyle(customStyle);
  });

  test("applies minWidth when provided", () => {
    renderWithTheme(<Button {...baseProps} minWidth="200px" />);
    expect(screen.getByTestId("button")).toHaveStyle({ minWidth: "200px" });
  });

  test("applies minWidth when provided", () => {
    renderWithTheme(<Button {...baseProps} minWidth="200px" />);
    expect(screen.getByTestId("button")).toHaveStyle({ minWidth: "200px" });
  });

  test("sets correct tab index", () => {
    renderWithTheme(<Button {...baseProps} tabIndex={2} />);
    expect(screen.getByTestId("button")).toHaveAttribute("tabindex", "2");
  });

  test("applies theme styles for primary button", () => {
    renderWithTheme(<Button {...baseProps} primary />);
    const button = screen.getByTestId("button");
    expect(button).toHaveStyle({
      background: mockColorScheme.main.buttons,
      color: mockColorScheme.text.buttons,
      borderColor: mockColorScheme.main.buttons,
    });
  });

  test("applies disabled styles for primary button", () => {
    renderWithTheme(<Button {...baseProps} primary isDisabled />);
    const button = screen.getByTestId("button");
    expect(button).toHaveStyle({
      opacity: "0.6",
    });
  });

  test("disables hover effect when disableHover is true", () => {
    renderWithTheme(<Button {...baseProps} primary disableHover />);
    const button = screen.getByTestId("button");
    expect(button).not.toHaveAttribute("data-hover-enabled");
  });

  test("applies brightness filter for primary button in base theme", () => {
    renderWithTheme(<Button {...baseProps} primary isClicked />);
    const button = screen.getByTestId("button");
    expect(button).toHaveStyle({
      filter: "brightness(90%)",
    });
  });

  test("applies brightness filter for primary button in non-base theme", () => {
    const nonBaseTheme = { ...mockTheme, isBase: false };
    renderWithTheme(<Button {...baseProps} primary isClicked />, nonBaseTheme);
    const button = screen.getByTestId("button");
    expect(button).toHaveStyle({
      filter: "brightness(82%)",
    });
  });

  test("uses base theme styles when no theme is provided", () => {
    const { container } = render(
      <ThemeProvider theme={Base}>
        <Button {...baseProps} />
      </ThemeProvider>,
    );
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveStyle({
      color: Base.button.color.base,
    });
  });

  test("applies primary button color when theme is missing base color", () => {
    const themeWithoutBaseColor = {
      ...mockTheme,
      button: {
        ...mockTheme.button,
        color: {
          ...mockTheme.button.color,
          base: mockTheme.button.color.primary,
          baseHover: mockTheme.button.color.primaryHover,
          baseActive: mockTheme.button.color.primaryActive,
          baseDisabled: mockTheme.button.color.primaryDisabled,
          primary: mockTheme.button.color.primary,
          primaryHover: mockTheme.button.color.primaryHover,
          primaryActive: mockTheme.button.color.primaryActive,
          primaryDisabled: mockTheme.button.color.primaryDisabled,
        },
      },
    };

    renderWithTheme(<Button {...baseProps} />, themeWithoutBaseColor);
    const button = screen.getByTestId("button");
    expect(button).toHaveStyle({
      color: themeWithoutBaseColor.button.color.primary,
    });
  });

  test("applies primary button background color", () => {
    renderWithTheme(<Button {...baseProps} primary />);
    expect(screen.getByTestId("button")).toHaveStyle({
      backgroundColor: mockTheme.button.backgroundColor.primary,
    });
  });

  test("uses base theme styles when no theme is provided", () => {
    const { container } = render(
      <ThemeProvider theme={Base}>
        <Button {...baseProps} />
      </ThemeProvider>,
    );
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveStyle({
      color: Base.button.color.base,
    });
  });

  test("applies scale style when scale prop is true", () => {
    renderWithTheme(<Button {...baseProps} scale />);
    expect(screen.getByTestId("button")).toHaveStyle({
      width: "100%",
    });
  });

  test("applies correct size styles", () => {
    renderWithTheme(<Button {...baseProps} size={ButtonSize.normal} />);
    expect(screen.getByTestId("button")).toHaveStyle({
      height: mockTheme.button.height[ButtonSize.normal],
      fontSize: mockTheme.button.fontSize[ButtonSize.normal],
      padding: mockTheme.button.padding[ButtonSize.normal],
    });
  });

  test("uses base theme styles when no theme is provided", () => {
    const { container } = render(
      <ThemeProvider theme={Base}>
        <Button {...baseProps} />
      </ThemeProvider>,
    );
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveStyle({
      color: Base.button.color.base,
    });
  });

  test("applies minWidth when provided", () => {
    renderWithTheme(<Button {...baseProps} minWidth="200px" />);
    expect(screen.getByTestId("button")).toHaveStyle({ minWidth: "200px" });
  });

  test("applies primary styles correctly", () => {
    renderWithTheme(<Button {...baseProps} primary />);
    const button = screen.getByTestId("button");
    expect(button).toHaveStyle({
      backgroundColor: mockTheme.button.backgroundColor.primary,
      borderColor: mockTheme.button.color.primary,
    });
  });

  test("applies scale styles correctly", () => {
    renderWithTheme(<Button {...baseProps} scale />);
    expect(screen.getByTestId("button")).toHaveStyle({ width: "100%" });
  });

  test("handles ref forwarding", () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithTheme(<Button {...baseProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  test("handles click events with keyboard", async () => {
    const onClick = jest.fn();
    renderWithTheme(<Button {...baseProps} onClick={onClick} />);
    const button = screen.getByTestId("button");

    await userEvent.tab();
    expect(button).toHaveFocus();

    await userEvent.keyboard("{enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test("maintains focus styles when tabbed", async () => {
    renderWithTheme(<Button {...baseProps} />);
    const button = screen.getByTestId("button");

    await userEvent.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveStyle({ outline: mockTheme.button.outline });
  });

  test("combines className with base styles", () => {
    renderWithTheme(<Button {...baseProps} className="custom-class" />);
    const button = screen.getByTestId("button");

    expect(button).toHaveClass("custom-class");
    const computedStyles = window.getComputedStyle(button);
    expect(computedStyles.display).toBe("inline-block");
    expect(computedStyles.alignItems).toBe("flex-start");
  });

  describe("Color scheme integration", () => {
    test("applies color scheme correctly for primary buttons", () => {
      renderWithTheme(<Button {...baseProps} primary />);
      expect(screen.getByTestId("button")).toHaveStyle({
        backgroundColor: mockColorScheme.main.buttons,
        color: mockColorScheme.text.buttons,
      });
    });

    test("maintains base styles when no color scheme is provided", () => {
      renderWithTheme(<Button {...baseProps} primary />);
      expect(screen.getByTestId("button")).toHaveStyle({
        backgroundColor: mockTheme.button.backgroundColor.primary,
      });
    });
  });
});
