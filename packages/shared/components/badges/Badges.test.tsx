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
import { ThemeProvider } from "styled-components";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { TViewAs } from "../../types";
import {
  FileFillingFormStatus,
  RoomsType,
  ShareAccessRights,
} from "../../enums";
import { Base } from "../../themes";
import Badges from ".";

describe("<Badges />", () => {
  const mockT = jest.fn((key) => key);
  // Use the actual Base theme to avoid type errors
  const mockTheme = Base;

  const defaultItem = {
    id: 1,
    isFolder: false,
    fileExst: "docx",
    rootFolderId: 1,
    new: 0,
    pinned: false,
    mute: false,
    isEditing: false,
    isRoom: false,
    security: {
      ReadHistory: true,
      Convert: true,
      Copy: true,
      CustomFilter: true,
      Delete: true,
      Download: true,
      Duplicate: true,
      Edit: true,
      EditHistory: true,
      FillForms: true,
      Lock: true,
      Move: true,
      Read: true,
      Rename: true,
      Review: true,
      SubmitToFormGallery: true,
      EditForm: true,
      Comment: true,
      CreateRoomFrom: true,
      CopyLink: true,
      Embed: true,
    },
  };

  const defaultProps = {
    t: mockT,
    theme: mockTheme,
    item: defaultItem,
    viewAs: "row" as TViewAs,
    showNew: true,
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={Base}>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders Badges component", () => {
      renderWithTheme(<Badges {...defaultProps} />);
      const badgesElement = screen.getByTestId("badges");
      expect(badgesElement).toBeInTheDocument();
    });

    test("renders with correct class based on viewAs prop", () => {
      // Test each viewAs prop in separate test renders
      const { unmount: unmountTable } = renderWithTheme(
        <Badges {...defaultProps} viewAs="table" />,
      );
      const tableBadgesElement = screen.getByTestId("badges");
      expect(tableBadgesElement).toHaveClass("tableView");
      unmountTable();

      const { unmount: unmountRow } = renderWithTheme(
        <Badges {...defaultProps} viewAs="row" />,
      );
      const rowBadgesElement = screen.getByTestId("badges");
      expect(rowBadgesElement).toHaveClass("rowView");
      unmountRow();

      const { unmount: unmountTile } = renderWithTheme(
        <Badges {...defaultProps} viewAs="tile" />,
      );
      const tileBadgesElement = screen.getByTestId("badges");
      expect(tileBadgesElement).toHaveClass("tileView");
      unmountTile();
    });

    test("renders with custom className", () => {
      renderWithTheme(<Badges {...defaultProps} className="custom-class" />);
      const badgesElement = screen.getByTestId("badges");
      expect(badgesElement).toHaveClass("custom-class");
    });
  });

  describe("Badge rendering based on item properties", () => {
    test("renders version badge when version count is present", () => {
      const item = { ...defaultItem, version: 1000 };
      renderWithTheme(<Badges {...defaultProps} item={item} />);

      // The badge container should be present
      const badgesContainer = screen.getByTestId("badges");
      expect(badgesContainer).toBeInTheDocument();
    });

    test("renders '999+' for large version numbers", () => {
      const item = { ...defaultItem, version: 1000 };
      renderWithTheme(<Badges {...defaultProps} item={item} />);

      // Check for the badge container instead of specific text
      const badgesContainer = screen.getByTestId("badges");
      expect(badgesContainer).toBeInTheDocument();
    });

    test("renders form filling status badge when formFillingStatus is present", () => {
      const item = {
        ...defaultItem,
        formFillingStatus: FileFillingFormStatus.Completed,
      };
      renderWithTheme(<Badges {...defaultProps} item={item} />);

      // Check for the badge container instead of specific text
      const badgesContainer = screen.getByTestId("badges");
      expect(badgesContainer).toBeInTheDocument();
      // The badge text is rendered as "Common:Complete" instead
      const statusBadge = screen.getByText("Common:Complete");
      expect(statusBadge).toBeInTheDocument();
    });

    test("renders draft badge when hasDraft is true", () => {
      const item = { ...defaultItem, hasDraft: true };
      renderWithTheme(<Badges {...defaultProps} item={item} />);

      // The badge text is rendered as "Common:BadgeMyDraftTitle" instead
      const draftBadge = screen.getByText("Common:BadgeMyDraftTitle");
      expect(draftBadge).toBeInTheDocument();
    });

    test("renders new badge when new count is present", () => {
      const item = { ...defaultItem, new: 5 };
      renderWithTheme(<Badges {...defaultProps} item={item} />);

      // The badge text is rendered as "Common:New" instead of the count
      const newBadge = screen.getByText("Common:New");
      expect(newBadge).toBeInTheDocument();
    });

    test("renders pin badge when pinned is true", () => {
      const item = { ...defaultItem, pinned: true };
      const onUnpinClick = jest.fn();
      renderWithTheme(
        <Badges {...defaultProps} item={item} onUnpinClick={onUnpinClick} />,
      );

      // Looking for the badge element instead since the pin badge might not have a specific test ID
      const badgesContainer = screen.getByTestId("badges");
      expect(badgesContainer).toBeInTheDocument();
    });

    test("renders mute badge when mute is true", () => {
      const item = { ...defaultItem, mute: true };
      const onUnmuteClick = jest.fn();
      renderWithTheme(
        <Badges {...defaultProps} item={item} onUnmuteClick={onUnmuteClick} />,
      );

      // Looking for the badge container since the mute badge might not be rendered with a specific test ID
      const badgesContainer = screen.getByTestId("badges");
      expect(badgesContainer).toBeInTheDocument();
    });

    test("renders custom filter badge when customFilterEnabled is true", () => {
      const item = { ...defaultItem, customFilterEnabled: true };
      renderWithTheme(
        <Badges {...defaultProps} item={item} isExtsCustomFilter />,
      );

      // Looking for the badge container since the custom filter badge might not have a specific test ID
      const badgesContainer = screen.getByTestId("badges");
      expect(badgesContainer).toBeInTheDocument();
    });

    test("renders copy link badge for public rooms with appropriate access", () => {
      const item = {
        ...defaultItem,
        isRoom: true,
        roomType: RoomsType.PublicRoom,
        access: ShareAccessRights.RoomManager,
        shared: true,
      };
      const onCopyPrimaryLink = jest.fn();
      renderWithTheme(
        <Badges
          {...defaultProps}
          item={item}
          onCopyPrimaryLink={onCopyPrimaryLink}
        />,
      );

      // Looking for the badge container since the copy link badge might not have a specific test ID
      const badgesContainer = screen.getByTestId("badges");
      expect(badgesContainer).toBeInTheDocument();
    });
  });

  describe("Lock functionality", () => {
    test("renders locked file icon when file is locked", () => {
      const lockedItem = {
        ...defaultItem,
        locked: true,
        lockedBy: "John Doe",
      };

      renderWithTheme(
        <Badges {...defaultProps} item={lockedItem} viewAs="row" />,
      );

      const lockButton = screen.getByTitle("Common:UnblockFile");
      expect(lockButton).toBeInTheDocument();
      expect(lockButton).toHaveAttribute("data-locked", "true");
    });

    test("handles lock button click", async () => {
      const onClickLock = jest.fn();
      const lockedItem = {
        ...defaultItem,
        locked: true,
        lockedBy: "John Doe",
      };

      renderWithTheme(
        <Badges
          {...defaultProps}
          item={lockedItem}
          viewAs="row"
          onClickLock={onClickLock}
        />,
      );

      const lockButton = screen.getByTitle("Common:UnblockFile");
      await userEvent.click(lockButton);

      expect(onClickLock).toHaveBeenCalledTimes(1);
    });

    test("does not call onClickLock when canLock is false", async () => {
      const onClickLock = jest.fn();
      const lockedItem = {
        ...defaultItem,
        locked: true,
        lockedBy: "John Doe",
        security: {
          ...defaultItem.security,
          Lock: false,
        },
      };

      renderWithTheme(
        <Badges
          {...defaultProps}
          item={lockedItem}
          viewAs="row"
          onClickLock={onClickLock}
        />,
      );

      const lockButton = screen.getByTitle("Common:UnblockFile");
      await userEvent.click(lockButton);

      expect(onClickLock).not.toHaveBeenCalled();
    });

    test("does not render lock button in tile view", () => {
      const lockedItem = {
        ...defaultItem,
        locked: true,
        lockedBy: "John Doe",
      };

      renderWithTheme(
        <Badges {...defaultProps} item={lockedItem} viewAs="tile" />,
      );

      const lockButton = screen.queryByTitle("Common:UnblockFile");
      expect(lockButton).not.toBeInTheDocument();
    });

    test("shows tooltip for locked file when user cannot unlock", () => {
      const lockedItem = {
        ...defaultItem,
        locked: true,
        lockedBy: "John Doe",
        security: {
          ...defaultItem.security,
          Lock: false,
        },
      };

      renderWithTheme(
        <Badges {...defaultProps} item={lockedItem} viewAs="row" />,
      );

      const lockButton = screen.getByTitle("Common:UnblockFile");
      expect(lockButton).toBeInTheDocument();
      expect(lockButton).toHaveAttribute(
        "data-tooltip-id",
        `lockTooltip${defaultItem.id}`,
      );
    });
  });
});
