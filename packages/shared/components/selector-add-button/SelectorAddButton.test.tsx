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
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { renderWithTheme } from "../../utils/render-with-theme";

import { SelectorAddButton } from ".";

const baseProps = {
  title: "Add item",
  isDisabled: false,
};

describe("<SelectorAddButton />", () => {
  it("renders without error", () => {
    renderWithTheme(<SelectorAddButton {...baseProps} />);

    expect(screen.getByTestId("selector-add-button")).toBeInTheDocument();
  });

  it("renders with title", () => {
    renderWithTheme(<SelectorAddButton {...baseProps} />);

    expect(screen.getByTestId("selector-add-button")).toHaveAttribute(
      "title",
      "Add item",
    );
  });

  it("accepts id", () => {
    renderWithTheme(<SelectorAddButton {...baseProps} id="testId" />);

    expect(screen.getByTestId("selector-add-button")).toHaveAttribute(
      "id",
      "testId",
    );
  });

  it("accepts className", () => {
    renderWithTheme(
      <SelectorAddButton {...baseProps} className="test-class" />,
    );

    expect(screen.getByTestId("selector-add-button-container")).toHaveClass(
      "test-class",
    );
  });

  it("accepts style", () => {
    renderWithTheme(
      <SelectorAddButton {...baseProps} style={{ color: "red" }} />,
    );

    expect(screen.getByTestId("selector-add-button")).toHaveStyle({
      color: "red",
    });
  });

  it("handles click when not disabled", () => {
    const onClick = jest.fn();
    renderWithTheme(<SelectorAddButton {...baseProps} onClick={onClick} />);

    fireEvent.click(screen.getByTestId("selector-add-button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("doesn't handle click when disabled", () => {
    const onClick = jest.fn();
    renderWithTheme(
      <SelectorAddButton {...baseProps} isDisabled onClick={onClick} />,
    );

    fireEvent.click(screen.getByTestId("selector-add-button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies isDisabled class when disabled", () => {
    renderWithTheme(<SelectorAddButton {...baseProps} isDisabled />);

    const button = screen.getByTestId("selector-add-button");
    expect(button).toHaveClass("isDisabled");
  });

  it("applies isAction class when isAction prop is true", () => {
    renderWithTheme(<SelectorAddButton {...baseProps} isAction />);

    const button = screen.getByTestId("selector-add-button");
    expect(button).toHaveClass("isAction");
  });

  it("renders IconButton with correct props", () => {
    const iconSize = 16;
    renderWithTheme(
      <SelectorAddButton {...baseProps} iconSize={iconSize} isDisabled />,
    );

    const iconButton = screen.getByTestId("icon-button");
    expect(iconButton).toBeInTheDocument();
    expect(iconButton).toHaveClass("disabled");
  });
});
