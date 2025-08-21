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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HelpButton } from ".";

describe("<HelpButton />", () => {
  const tooltipContent = "Your tooltip content";

  it("renders without error", () => {
    render(<HelpButton tooltipContent={tooltipContent} />);
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(
      <HelpButton tooltipContent={tooltipContent} className="custom-class" />,
    );
    expect(screen.getByTestId("icon-button")).toHaveClass("custom-class");
  });

  it("renders with custom id", () => {
    render(<HelpButton tooltipContent={tooltipContent} id="custom-id" />);
    expect(screen.getByTestId("icon-button")).toHaveAttribute(
      "id",
      "custom-id",
    );
  });

  it("renders with custom style", () => {
    const customStyle = { backgroundColor: "red" };
    render(<HelpButton tooltipContent={tooltipContent} style={customStyle} />);
    expect(screen.getByTestId("help-button")).toHaveStyle(customStyle);
  });

  it("renders with custom size", () => {
    render(<HelpButton tooltipContent={tooltipContent} size={24} />);
    const button = screen.getByTestId("icon-button");
    expect(button).toHaveStyle({ "--icon-button-size": "24px" });
  });

  it("renders with custom color", () => {
    render(<HelpButton tooltipContent={tooltipContent} color="#ff0000" />);
    const button = screen.getByTestId("icon-button");
    expect(button).toHaveStyle({ "--icon-button-color": "#ff0000" });
  });

  it("renders as non-clickable when isClickable is false", () => {
    render(<HelpButton tooltipContent={tooltipContent} isClickable={false} />);
    const button = screen.getByTestId("icon-button");
    expect(button).toHaveClass("notClickable");
  });

  it("renders with getContent function", () => {
    const getContent = () => "Dynamic content";
    render(<HelpButton getContent={getContent} />);
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders with custom place", () => {
    render(<HelpButton tooltipContent={tooltipContent} place="bottom" />);
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders with custom offset", () => {
    render(<HelpButton tooltipContent={tooltipContent} offset={10} />);
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders with afterShow callback", () => {
    const afterShow = jest.fn();
    render(
      <HelpButton tooltipContent={tooltipContent} afterShow={afterShow} />,
    );
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders with afterHide callback", () => {
    const afterHide = jest.fn();
    render(
      <HelpButton tooltipContent={tooltipContent} afterHide={afterHide} />,
    );
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders with custom tooltipMaxWidth", () => {
    render(
      <HelpButton tooltipContent={tooltipContent} tooltipMaxWidth="300px" />,
    );
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders with openOnClick set to false", () => {
    render(<HelpButton tooltipContent={tooltipContent} openOnClick={false} />);
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });
});
