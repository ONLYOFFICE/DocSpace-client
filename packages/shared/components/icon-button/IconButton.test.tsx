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
import { screen, fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import { Base } from "../../themes";

import { IconButtonProps } from "./IconButton.types";
import { IconButton } from ".";
import { ThemeProvider } from "../theme-provider";

const baseProps: IconButtonProps = {
  size: 25,
  isDisabled: false,
  iconName: SearchReactSvgUrl,
  isFill: true,
};

describe("<IconButton />", () => {
  it("renders without error", () => {
    render(<IconButton {...baseProps} />);
    expect(screen.getByTestId("icon-button")).toBeInTheDocument();
    expect(screen.getByTestId("icon-button-svg")).toBeInTheDocument();
  });

  it("accepts and applies id prop", () => {
    const testId = "test-id";
    render(<IconButton {...baseProps} id={testId} />);
    expect(screen.getByTestId("icon-button")).toHaveAttribute("id", testId);
  });

  it("accepts and applies className prop", () => {
    const testClass = "test-class";
    render(<IconButton {...baseProps} className={testClass} />);
    expect(screen.getByTestId("icon-button")).toHaveClass(testClass);
  });

  it("accepts and applies style prop", () => {
    const testStyle = { backgroundColor: "red" };
    render(<IconButton {...baseProps} style={testStyle} />);
    expect(screen.getByTestId("icon-button")).toHaveStyle(testStyle);
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    render(<IconButton {...baseProps} onClick={handleClick} />);

    const button = screen.getByTestId("icon-button");
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("prevents click events when disabled", async () => {
    const handleClick = jest.fn();
    render(<IconButton {...baseProps} onClick={handleClick} isDisabled />);

    const button = screen.getByTestId("icon-button");
    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("handles mouse down state correctly", () => {
    const clickIconName = "click-icon.svg";
    const clickColor = "blue";
    const handleMouseDown = jest.fn();

    render(
      <IconButton
        {...baseProps}
        iconClickName={clickIconName}
        clickColor={clickColor}
        onMouseDown={handleMouseDown}
      />,
    );

    const button = screen.getByTestId("icon-button");
    fireEvent.mouseDown(button);

    expect(handleMouseDown).toHaveBeenCalled();
    expect(button).toHaveAttribute("data-iconname", clickIconName);
  });

  it("handles mouse up state with left click", () => {
    const handleMouseUp = jest.fn();
    const hoverIconName = "hover-icon.svg";

    render(
      <IconButton
        {...baseProps}
        iconHoverName={hoverIconName}
        onMouseUp={handleMouseUp}
      />,
    );

    const button = screen.getByTestId("icon-button");
    fireEvent.mouseUp(button, { button: 1 });

    expect(handleMouseUp).toHaveBeenCalled();
    expect(button).toHaveAttribute("data-iconname", hoverIconName);
  });

  it("handles right click mouse up", () => {
    const handleMouseUp = jest.fn();

    render(<IconButton {...baseProps} onMouseUp={handleMouseUp} />);

    const button = screen.getByTestId("icon-button");
    fireEvent.mouseUp(button, { button: 2 });

    expect(handleMouseUp).toHaveBeenCalled();
  });

  it("renders custom icon node when provided", () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>;
    render(<IconButton {...baseProps} iconNode={<CustomIcon />} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("updates icon on iconName prop change", () => {
    const { rerender } = render(<IconButton {...baseProps} />);

    const newIconName = "new-icon.svg";
    rerender(
      <ThemeProvider theme={Base}>
        <IconButton {...baseProps} iconName={newIconName} />
      </ThemeProvider>,
    );

    const iconButton = screen.getByTestId("icon-button");
    expect(iconButton).toHaveAttribute("data-iconname", newIconName);
  });

  it("applies correct size", () => {
    const customSize = 40;
    render(<IconButton {...baseProps} size={customSize} />);
    expect(screen.getByTestId("icon-button")).toHaveStyle({
      "--icon-button-size": `${customSize}px`,
    });
  });

  it("displays title when provided", () => {
    const title = "Button Title";
    render(<IconButton {...baseProps} title={title} />);
    expect(screen.getByTitle(title)).toBeInTheDocument();
  });

  it("handles data-tip attribute", () => {
    const dataTip = "tooltip text";
    render(<IconButton {...baseProps} dataTip={dataTip} />);
    expect(screen.getByTestId("icon-button")).toHaveAttribute(
      "data-tip",
      dataTip,
    );
  });

  it("resets to default icon on mouse leave", async () => {
    const hoverIconName = "hover-icon.svg";
    render(<IconButton {...baseProps} iconHoverName={hoverIconName} />);

    const button = screen.getByTestId("icon-button");
    fireEvent.mouseEnter(button);
    await screen.findByTestId("icon-button");
    expect(button).toHaveAttribute("data-iconname", hoverIconName);

    fireEvent.mouseLeave(button);
    await screen.findByTestId("icon-button");
    expect(button).toHaveAttribute("data-iconname", baseProps.iconName);
  });
});
