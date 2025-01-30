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
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithTheme } from "../../utils/render-with-theme";

import { Loader } from ".";
import { LoaderTypes } from "./Loader.enums";

const baseProps = {
  type: LoaderTypes.base,
  color: "black",
  size: "18px",
  label: "Loading",
};

describe("<Loader />", () => {
  test("renders without error", () => {
    renderWithTheme(<Loader {...baseProps} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  test("renders base type with text", () => {
    renderWithTheme(<Loader {...baseProps} />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  test("renders oval type", () => {
    renderWithTheme(<Loader {...baseProps} type={LoaderTypes.oval} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByTestId("oval-loader")).toBeInTheDocument();
  });

  test("renders dual-ring type", () => {
    renderWithTheme(<Loader {...baseProps} type={LoaderTypes.dualRing} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByTestId("dual-ring-loader")).toBeInTheDocument();
  });

  test("renders rombs type", () => {
    renderWithTheme(<Loader {...baseProps} type={LoaderTypes.rombs} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByTestId("rombs-loader")).toBeInTheDocument();
  });

  test("renders track type", () => {
    renderWithTheme(<Loader {...baseProps} type={LoaderTypes.track} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByTestId("track-loader")).toBeInTheDocument();
  });

  test("accepts custom className", () => {
    renderWithTheme(<Loader {...baseProps} className="custom-loader" />);
    expect(screen.getByTestId("loader")).toHaveClass("custom-loader");
  });

  test("accepts custom style", () => {
    const customStyle = { marginTop: "20px" };
    renderWithTheme(<Loader {...baseProps} style={customStyle} />);
    expect(screen.getByTestId("loader")).toHaveStyle(customStyle);
  });

  test("accepts custom id", () => {
    renderWithTheme(<Loader {...baseProps} id="custom-loader" />);
    expect(screen.getByTestId("loader")).toHaveAttribute("id", "custom-loader");
  });
});
