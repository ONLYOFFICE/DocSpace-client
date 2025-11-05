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

import { RoomsType } from "../../enums";
import { RoomLogo } from "./RoomLogo";

// Mock react-device-detect
vi.mock("react-device-detect", () => ({
  isMobile: false,
}));

const baseProps = {
  type: RoomsType.CustomRoom,
  isPrivacy: false,
  isArchive: false,
};

describe("<RoomLogo />", () => {
  it("renders without error", () => {
    render(<RoomLogo {...baseProps} />);
    expect(screen.getByTestId("room-logo")).toBeInTheDocument();
  });

  it("renders with custom props", () => {
    render(
      <RoomLogo
        {...baseProps}
        id="testId"
        className="test-class"
        style={{ color: "red" }}
      />,
    );
    const logo = screen.getByTestId("room-logo");

    expect(logo).toHaveAttribute("id", "testId");
    expect(logo).toHaveClass("test-class");
    expect(logo).toHaveStyle({ color: "red" });
  });

  describe("Checkbox functionality", () => {
    it("handles checkbox change", () => {
      const onChangeMock = vi.fn();
      render(
        <RoomLogo
          {...baseProps}
          withCheckbox
          isChecked={false}
          onChange={onChangeMock}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(onChangeMock).toHaveBeenCalled();
    });
  });

  describe("Room Types", () => {
    const testRoomType = (type: RoomsType, expectedIconUrl: string) => {
      it(`renders correct icon for ${RoomsType[type]} type`, () => {
        render(<RoomLogo {...baseProps} type={type} />);

        const icon = screen.getByAltText("room-logo") as HTMLImageElement;
        expect(icon.src).toContain(expectedIconUrl);
      });
    };

    testRoomType(RoomsType.EditingRoom, "test-file-stub");
    testRoomType(RoomsType.CustomRoom, "test-file-stub");
    testRoomType(RoomsType.PublicRoom, "test-file-stub");
    testRoomType(RoomsType.FormRoom, "test-file-stub");
    testRoomType(RoomsType.VirtualDataRoom, "test-file-stub");
  });

  describe("Special States", () => {
    it("renders archive icon when isArchive is true", () => {
      render(<RoomLogo {...baseProps} isArchive />);

      const icon = screen.getByAltText("room-logo") as HTMLImageElement;
      expect(icon.src).toContain("test-file-stub");
    });

    it("prioritizes archive over room type icon", () => {
      render(
        <RoomLogo {...baseProps} isArchive type={RoomsType.EditingRoom} />,
      );

      const icon = screen.getByAltText("room-logo") as HTMLImageElement;
      expect(icon.src).toContain("test-file-stub");
    });
  });
});
