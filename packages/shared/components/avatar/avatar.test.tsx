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
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Avatar } from ".";
import { AvatarRole, AvatarSize } from "./Avatar.enums";

const baseProps = {
  size: AvatarSize.max,
  role: AvatarRole.user,
  source: "",
  editLabel: "Edit",
  userName: "Demo User",
  editing: false,
  editAction: vi.fn(),
};

describe("<Avatar />", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders avatar with default props", () => {
    render(<Avatar {...baseProps} />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.getByText("DU")).toBeInTheDocument(); // Initials
  });

  it("renders different avatar sizes", () => {
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

  it("displays image when source is provided", () => {
    const source = "https://example.com/avatar.jpg";
    render(<Avatar {...baseProps} source={source} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", source);
  });

  it("shows edit button when editing and hasAvatar are true", () => {
    render(<Avatar {...baseProps} editing hasAvatar />);
    const editButton = screen.getByTestId("edit_avatar_icon_button");
    expect(editButton).toBeInTheDocument();
  });

  it("handles click events when onClick is provided", () => {
    const onClick = vi.fn();
    render(<Avatar {...baseProps} onClick={onClick} />);
    const avatar = screen.getByTestId("avatar");
    fireEvent.click(avatar);
    expect(onClick).toHaveBeenCalled();
  });

  it("displays correct initials for group avatar", () => {
    render(<Avatar {...baseProps} isGroup userName="Project Team" />);
    expect(screen.getByText("PT")).toBeInTheDocument();
  });

  it("handles file change when onChangeFile is provided", () => {
    const onChangeFile = vi.fn();
    render(<Avatar {...baseProps} editing onChangeFile={onChangeFile} />);
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["test"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onChangeFile).toHaveBeenCalled();
  });
});
