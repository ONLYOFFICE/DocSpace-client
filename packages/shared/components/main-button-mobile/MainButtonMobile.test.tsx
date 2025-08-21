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

import { MainButtonMobile } from ".";
import { ButtonOption } from "./MainButtonMobile.types";

jest.mock("PUBLIC_DIR/images/button.alert.react.svg", () => ({
  __esModule: true,
  default: () => <div className="alertIcon" data-testid="alert-icon" />,
}));

describe("<MainButtonMobile />", () => {
  const mockOnClick = jest.fn();

  const buttonOptions: ButtonOption[] = [
    {
      key: "option1",
      label: "Option 1",
      onClick: jest.fn(),
    },
    {
      key: "option2",
      label: "Option 2",
      onClick: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    render(<MainButtonMobile />);
    expect(screen.getByTestId("main-button-mobile")).toBeInTheDocument();
  });

  it("renders with button options", () => {
    render(<MainButtonMobile buttonOptions={buttonOptions} opened />);
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("handles main button click", () => {
    render(<MainButtonMobile onClick={mockOnClick} withMenu={false} />);
    const button = screen.getByTestId("floating-button");
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
  });
});
