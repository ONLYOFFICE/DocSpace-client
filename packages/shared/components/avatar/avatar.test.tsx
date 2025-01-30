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
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Avatar } from ".";
import { AvatarRole, AvatarSize } from "./Avatar.enums";

const baseProps = {
  size: AvatarSize.max,
  role: AvatarRole.user,
  source: "",
  editLabel: "Edit",
  userName: "Demo User",
  editing: false,
  editAction: jest.fn(),
};

describe("<Avatar />", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders avatar with default props", () => {
    render(<Avatar {...baseProps} />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.getByText("DU")).toBeInTheDocument(); // Initials
  });

  test("renders different avatar sizes", () => {
    const sizes = [
      AvatarSize.max,
      AvatarSize.big,
      AvatarSize.medium,
      AvatarSize.base,
      AvatarSize.small,
      AvatarSize.min,
    ];
    sizes.forEach((size) => {
      const { container } = render(<Avatar {...baseProps} size={size} />);
      expect(container.firstChild).toHaveAttribute("data-size", size);
    });
  });

  test("displays image when source is provided", () => {
    const source = "https://example.com/avatar.jpg";
    render(<Avatar {...baseProps} source={source} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", source);
  });

  test("shows edit button when editing is true", () => {
    render(<Avatar {...baseProps} editing />);
    const editButton = screen.getByTestId("icon-button");
    expect(editButton).toBeInTheDocument();
  });

  test("handles click events when onClick is provided", () => {
    const onClick = jest.fn();
    render(<Avatar {...baseProps} onClick={onClick} />);
    const avatar = screen.getByTestId("avatar");
    fireEvent.click(avatar);
    expect(onClick).toHaveBeenCalled();
  });

  test("displays correct initials for group avatar", () => {
    render(<Avatar {...baseProps} isGroup userName="Project Team" />);
    expect(screen.getByText("PT")).toBeInTheDocument();
  });

  test("handles file change when onChangeFile is provided", () => {
    const onChangeFile = jest.fn();
    render(<Avatar {...baseProps} editing onChangeFile={onChangeFile} />);
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["test"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onChangeFile).toHaveBeenCalled();
  });
});
