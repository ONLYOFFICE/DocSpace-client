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
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmptyScreenContainer } from ".";
import styles from "./EmptyScreenContainer.module.scss";

const baseProps = {
  imageSrc: "empty_screen_filter.png",
  imageAlt: "Empty Screen Filter image",
  headerText: "No results found",
  descriptionText: "No results matching your search could be found",
  buttons: <a href="/">Go to home</a>,
};

describe("<EmptyScreenContainer />", () => {
  it("renders without error", () => {
    render(<EmptyScreenContainer {...baseProps} />);
    expect(screen.getByTestId("empty-screen-container")).toBeInTheDocument();
  });

  it("renders all provided content correctly", () => {
    render(<EmptyScreenContainer {...baseProps} />);

    expect(
      screen.getByRole("img", { name: baseProps.imageAlt }),
    ).toBeInTheDocument();
    expect(screen.getByText(baseProps.headerText)).toBeInTheDocument();
    expect(screen.getByText(baseProps.descriptionText)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to home" }),
    ).toBeInTheDocument();
  });

  it("applies custom className correctly", () => {
    const customClass = "custom-class";
    render(<EmptyScreenContainer {...baseProps} className={customClass} />);

    const container = screen.getByTestId("empty-screen-container");
    expect(container).toHaveClass(customClass);
  });

  it("renders with subheading text when provided", () => {
    const subheadingText = "This is a subheading";
    render(
      <EmptyScreenContainer {...baseProps} subheadingText={subheadingText} />,
    );

    expect(screen.getByText(subheadingText)).toBeInTheDocument();
    expect(screen.getByTestId("empty-screen-container")).toHaveClass(
      styles.withSubheading,
    );
  });

  it("applies withoutFilter class when prop is true", () => {
    render(<EmptyScreenContainer {...baseProps} withoutFilter />);

    expect(screen.getByTestId("empty-screen-container")).toHaveClass(
      styles.withoutFilter,
    );
  });

  it("applies custom styles to image when provided", () => {
    const imageStyle = { width: "200px" };
    render(<EmptyScreenContainer {...baseProps} imageStyle={imageStyle} />);

    const image = screen.getByRole("img", { name: baseProps.imageAlt });
    expect(image).toHaveStyle(imageStyle);
  });

  it("applies custom styles to buttons when provided", () => {
    const buttonStyle = { marginTop: "20px" };
    render(<EmptyScreenContainer {...baseProps} buttonStyle={buttonStyle} />);

    const buttonsContainer = screen.getByRole("link", {
      name: "Go to home",
    }).parentElement;
    expect(buttonsContainer).toHaveStyle(buttonStyle);
  });
});
