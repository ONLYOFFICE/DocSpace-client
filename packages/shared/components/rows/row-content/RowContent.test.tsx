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
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Link, LinkType } from "../../link";
import { RowContent } from ".";
import { globalColors } from "../../../themes";
import styles from "./RowContent.module.scss";

const mainLink = (
  <div style={{ width: "140px" }}>
    <Link
      type={LinkType.page}
      title="Main"
      isBold
      fontSize="15px"
      color={globalColors.black}
    >
      Main
    </Link>
  </div>
);

const iconLink = (
  <div>
    <Link
      type={LinkType.action}
      title="Icon"
      fontSize="12px"
      color={globalColors.gray}
    >
      Icon
    </Link>
  </div>
);

const sideLink = (
  <div style={{ width: "80px" }}>
    <Link
      type={LinkType.page}
      title="Side"
      fontSize="12px"
      color={globalColors.gray}
    >
      Side
    </Link>
  </div>
);

describe("<RowContent />", () => {
  it("renders without error", () => {
    render(
      <RowContent>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    expect(screen.getByTestId("row-content")).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Side")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "custom-class";
    render(
      <RowContent className={customClass}>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    expect(screen.getByTestId("row-content")).toHaveClass(customClass);
  });

  it("applies custom id", () => {
    const customId = "custom-id";
    render(
      <RowContent id={customId}>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    expect(screen.getByTestId("row-content")).toHaveAttribute("id", customId);
  });

  it("applies custom style", () => {
    const customStyle = { backgroundColor: "red" };
    render(
      <RowContent style={customStyle}>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    expect(screen.getByTestId("row-content")).toHaveStyle(customStyle);
  });

  it("handles onClick event", () => {
    const onClick = vi.fn();
    render(
      <RowContent onClick={onClick}>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    fireEvent.click(screen.getByTestId("row-content"));
    expect(onClick).toHaveBeenCalled();
  });

  it("disables side info when disableSideInfo is true", () => {
    render(
      <RowContent disableSideInfo>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    expect(screen.queryByTestId("row-content")).not.toHaveClass(
      "tabletSideInfo",
    );
  });

  it("applies side color", () => {
    const sideColor = "rgb(255, 0, 0)";
    render(
      <RowContent sideColor={sideColor}>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    const sideInfo = screen.getByTestId("tablet-side-info");
    expect(sideInfo).toHaveStyle({ color: sideColor });
  });

  it("renders main container with correct width", () => {
    render(
      <RowContent>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    const mainContainer = screen.getByTestId("main-container-wrapper");
    expect(mainContainer).toHaveStyle({ "--main-container-width": "140px" });
  });

  it("renders side container with correct width", () => {
    render(
      <RowContent>
        {mainLink}
        {iconLink}
        {sideLink}
      </RowContent>,
    );

    const sideContainer = screen.getByTestId("side-container");
    expect(sideContainer).toHaveStyle({ width: "40px" });
  });
});
