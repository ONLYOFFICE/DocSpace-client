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
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import ErrorContainer from "./ErrorContainer";

import { renderWithTheme } from "../../utils/render-with-theme";

describe("ErrorContainer", () => {
  const mockOnClick = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders without error", () => {
    renderWithTheme(<ErrorContainer id="error-container" />);
    expect(screen.getByTestId("ErrorContainer")).toBeInTheDocument();
  });

  test("renders with header and body text", () => {
    const headerText = "Some error has happened";
    const bodyText = "Try again later";

    renderWithTheme(
      <ErrorContainer headerText={headerText} bodyText={bodyText} />,
    );

    expect(screen.getByText(headerText)).toBeInTheDocument();
    expect(screen.getByText(bodyText)).toBeInTheDocument();
  });

  test("renders with customized body text", () => {
    const customText = "Custom error message";

    renderWithTheme(<ErrorContainer customizedBodyText={customText} />);

    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  test("renders with button and handles click", () => {
    const buttonText = "Retry";

    renderWithTheme(
      <ErrorContainer buttonText={buttonText} onClickButton={mockOnClick} />,
    );

    const button = screen.getByText(buttonText);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("renders with primary button style", () => {
    const buttonText = "Primary Button";

    renderWithTheme(
      <ErrorContainer
        buttonText={buttonText}
        onClickButton={mockOnClick}
        isPrimaryButton
      />,
    );

    const button = screen.getByText(buttonText);
    expect(button).toBeInTheDocument();
  });

  test("renders in editor mode", () => {
    renderWithTheme(<ErrorContainer isEditor />);

    const container = screen.getByTestId("ErrorContainer");
    expect(container.className).toContain("isEditor");
  });

  test("renders with additional className", () => {
    const className = "custom-class";

    renderWithTheme(<ErrorContainer className={className} />);

    const container = screen.getByTestId("ErrorContainer");
    expect(container.className).toContain(className);
  });

  test("renders with children", () => {
    const childText = "Child component";

    renderWithTheme(
      <ErrorContainer>
        <div>{childText}</div>
      </ErrorContainer>,
    );

    expect(screen.getByText(childText)).toBeInTheDocument();
  });
});
