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

import { Link, LinkType } from ".";

import { renderWithTheme } from "../../utils/render-with-theme";

// Mock CSS modules
jest.mock("./Link.module.scss", () => ({
  link: "link",
  semitransparent: "semitransparent",
  isHovered: "isHovered",
  textOverflow: "textOverflow",
  noHover: "noHover",
  enableUserSelect: "enableUserSelect",
  page: "page",
}));

const baseProps = {
  type: LinkType.page,
  color: "black",
  href: "https://github.com",
};

describe("<Link />", () => {
  it("renders without error", () => {
    renderWithTheme(<Link {...baseProps}>link</Link>);
    expect(screen.queryByTestId("link")).toBeInTheDocument();
  });

  it("renders with custom data-testid", () => {
    renderWithTheme(
      <Link {...baseProps} dataTestId="custom-link">
        link
      </Link>,
    );
    expect(screen.queryByTestId("custom-link")).toBeInTheDocument();
  });

  it("renders with isBold prop", () => {
    renderWithTheme(
      <Link {...baseProps} isBold>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveStyle({ fontWeight: "700" });
  });

  it("renders with isHovered prop", () => {
    renderWithTheme(
      <Link {...baseProps} isHovered>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveClass("isHovered");
  });

  it("renders with isSemitransparent prop", () => {
    renderWithTheme(
      <Link {...baseProps} isSemitransparent>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveClass("semitransparent");
  });

  it("renders with isTextOverflow prop", () => {
    renderWithTheme(
      <Link {...baseProps} isTextOverflow>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveClass("textOverflow");
  });

  it("renders with noHover prop", () => {
    renderWithTheme(
      <Link {...baseProps} noHover>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveClass("noHover");
  });

  it("renders with enableUserSelect prop", () => {
    renderWithTheme(
      <Link {...baseProps} enableUserSelect>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveClass("enableUserSelect");
  });

  it("renders with type prop action", () => {
    renderWithTheme(
      <Link {...baseProps} type={LinkType.action}>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).not.toHaveClass("page");
  });

  it("renders with custom fontSize and lineHeight", () => {
    renderWithTheme(
      <Link {...baseProps} fontSize="16px" lineHeight="24px">
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveStyle({ fontSize: "16px", lineHeight: "24px" });
  });

  it("accepts id", () => {
    renderWithTheme(
      <Link {...baseProps} id="testId">
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("id", "testId");
  });

  it("accepts className", () => {
    const className = "custom-class";
    renderWithTheme(
      <Link {...baseProps} className={className}>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveClass(className);
  });

  it("sets aria-label", () => {
    renderWithTheme(
      <Link {...baseProps} ariaLabel="Custom label">
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("aria-label", "Custom label");
  });

  it("uses children as aria-label when ariaLabel prop is not provided", () => {
    renderWithTheme(<Link {...baseProps}>Custom text</Link>);
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("aria-label", "Custom text");
  });

  it("renders with custom rel attribute", () => {
    renderWithTheme(
      <Link {...baseProps} rel="noopener">
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("renders with custom tabIndex", () => {
    renderWithTheme(
      <Link {...baseProps} tabIndex={-1}>
        link
      </Link>,
    );
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("tabindex", "-1");
  });
});
