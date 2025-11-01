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
import { RoomIcon } from ".";
import { TModel } from "./RoomIcon.types";

const mockImgSrc = "test-image.jpg";
const mockTitle = "Test Room";
const mockSize = "96px";
const mockColor = "FFFFFF";

const baseProps = {
  title: mockTitle,
  size: mockSize,
  color: mockColor,
  imgSrc: mockImgSrc,
  showDefault: true,
};

const mockModel: TModel[] = [
  {
    label: "Upload",
    icon: "upload.svg",
    key: "upload",
    onClick: jest.fn(),
  },
  {
    label: "Remove",
    icon: "remove.svg",
    key: "remove",
    onClick: jest.fn(),
  },
];

describe("<RoomIcon />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    render(<RoomIcon {...baseProps} />);
    expect(screen.getByTestId("room-icon")).toBeInTheDocument();
  });

  it("renders title when showDefault is true", () => {
    render(<RoomIcon {...baseProps} />);
    const title = screen.getByTestId("room-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("TR");
  });

  it("renders empty icon state correctly", () => {
    render(<RoomIcon {...baseProps} isEmptyIcon />);
    const emptyIcon = screen.getByTestId("empty-icon");
    expect(emptyIcon).toBeInTheDocument();
    expect(screen.getByTestId("icon-button")).toBeInTheDocument();
  });

  it("renders edit mode correctly", () => {
    render(<RoomIcon {...baseProps} withEditing model={mockModel} />);
    const editButton = screen.getByTestId("icon-button");
    expect(editButton).toBeInTheDocument();
    expect(screen.getByTestId("room-icon")).toHaveAttribute(
      "data-has-editing",
      "true",
    );
  });

  it("opens dropdown on edit icon click", () => {
    render(<RoomIcon {...baseProps} withEditing model={mockModel} />);
    const editButton = screen.getByTestId("icon-button");
    fireEvent.click(editButton);
    expect(screen.getByText(mockModel[0].label)).toBeInTheDocument();
  });

  it("handles file input change", () => {
    const onChangeFile = jest.fn();
    render(
      <RoomIcon
        {...baseProps}
        withEditing
        model={mockModel}
        onChangeFile={onChangeFile}
      />,
    );
    const input = screen.getByTestId("customFileInput");
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChangeFile).toHaveBeenCalled();
  });

  it("renders badge correctly", () => {
    const badgeUrl = "badge.svg";
    const onBadgeClick = jest.fn();
    render(
      <RoomIcon
        {...baseProps}
        badgeUrl={badgeUrl}
        onBadgeClick={onBadgeClick}
      />,
    );
    const badge = screen.getByTestId("icon-button");
    expect(badge).toBeInTheDocument();
    fireEvent.click(badge);
    expect(onBadgeClick).toHaveBeenCalled();
  });

  it("handles hover state correctly", () => {
    const hoverSrc = "hover-image.jpg";
    render(<RoomIcon {...baseProps} hoverSrc={hoverSrc} />);
    const hoverImg = screen.getByTestId("hover-image");
    expect(hoverImg).toHaveAttribute("src", hoverSrc);
  });

  it("handles archive state correctly", () => {
    render(<RoomIcon {...baseProps} isArchive />);
    expect(screen.getByTestId("room-icon")).toHaveAttribute(
      "data-is-archive",
      "true",
    );
  });

  it("adds tooltip attributes to badge when tooltipContent is provided", () => {
    const tooltipId = "room-tooltip";
    render(
      <RoomIcon
        {...baseProps}
        badgeUrl="badge.svg"
        tooltipContent="Tooltip content"
        tooltipId={tooltipId}
      />,
    );

    const badgeButton = screen.getByTestId("icon-button");
    expect(badgeButton).toHaveAttribute("data-tooltip-id", tooltipId);
  });

  it("adds isHovered class when tooltipContent is provided", () => {
    render(
      <RoomIcon
        {...baseProps}
        badgeUrl="badge.svg"
        tooltipContent="Tooltip content"
        tooltipId="room-tooltip"
      />,
    );
    const badgeButton = screen.getByTestId("icon-button");
    expect(badgeButton).toHaveClass("isHovered");
  });

  it("does not add tooltip attributes when tooltipContent is not provided", () => {
    render(<RoomIcon {...baseProps} badgeUrl="badge.svg" />);
    const badgeButton = screen.getByTestId("icon-button");
    expect(badgeButton).not.toHaveAttribute("data-tooltip-id");
    const buttonWithClass = screen.getByTestId("icon-button");
    expect(buttonWithClass).not.toHaveClass("isHovered");
  });

  it("handles template icon state", () => {
    render(<RoomIcon {...baseProps} isTemplate />);
    const roomIcon = screen.getByTestId("room-icon");
    expect(roomIcon).toHaveAttribute("data-is-template", "true");
  });
});
