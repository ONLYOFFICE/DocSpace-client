/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import { IndexIconButtons } from ".";

describe("<IndexIconButtons />", () => {
  it("renders without error", () => {
    render(<IndexIconButtons />);
    expect(screen.getByTestId("index-icon-buttons")).toBeInTheDocument();
  });

  it("renders with containerClassName prop", () => {
    const className = "custom-class";
    render(<IndexIconButtons containerClassName={className} />);
    expect(screen.getByTestId("index-icon-buttons")).toHaveClass(className);
  });

  it("renders with commonIconClassName prop", () => {
    const className = "custom-class";
    render(<IndexIconButtons commonIconClassName={className} />);
    const upIcon = screen.getByTestId("index-up-icon");
    const downIcon = screen.getByTestId("index-down-icon");

    expect(upIcon).toHaveClass(className);
    expect(downIcon).toHaveClass(className);
  });

  it("applies upIconClassName to the up icon", () => {
    const className = "up-icon-class";

    render(<IndexIconButtons upIconClassName={className} />);

    const upIcon = screen.getByTestId("index-up-icon");
    expect(upIcon).toHaveClass(className);
  });

  it("applies downIconClassName to the down icon", () => {
    const className = "down-icon-class";

    render(<IndexIconButtons downIconClassName={className} />);

    const downIcon = screen.getByTestId("index-down-icon");
    expect(downIcon).toHaveClass(className);
  });

  it("calls onUpIndexClick when up icon is clicked", () => {
    const handleUpClick = jest.fn();

    render(<IndexIconButtons onUpIndexClick={handleUpClick} />);

    const upIcon = screen.getByTestId("index-up-icon");
    fireEvent.click(upIcon);

    expect(handleUpClick).toHaveBeenCalledTimes(1);
  });

  it("calls onDownIndexClick when down icon is clicked", () => {
    const handleDownClick = jest.fn();

    render(<IndexIconButtons onDownIndexClick={handleDownClick} />);

    const downIcon = screen.getByTestId("index-down-icon");
    fireEvent.click(downIcon);

    expect(handleDownClick).toHaveBeenCalledTimes(1);
  });

  it("applies the style prop to the root element", () => {
    const style = {
      backgroundColor: "red",
      padding: "10px",
    };

    render(<IndexIconButtons style={style} />);

    const root = screen.getByTestId("index-icon-buttons");
    expect(root).toHaveStyle("background-color: red");
    expect(root).toHaveStyle("padding: 10px");
  });
});
