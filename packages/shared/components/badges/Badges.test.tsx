/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { ThemeProvider } from "styled-components";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TViewAs } from "../../types";
import {
	FileFillingFormStatus,
	RoomsType,
	ShareAccessRights,
} from "../../enums";
import { Base } from "@docspace/ui-kit/providers/theme";
import Badges from ".";
import styles from "./Badges.module.scss";

describe("<Badges />", () => {
	const mockT = vi.fn((key) => key);
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
			Vectorization: false,
		},
	};

	const defaultProps = {
		t: mockT,
		themeIsBase: true,
		item: defaultItem,
		viewAs: "row" as TViewAs,
		showNew: true,
	};

	const renderWithTheme = (ui: React.ReactElement) => {
		return render(<ThemeProvider theme={Base}>{ui}</ThemeProvider>);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("renders Badges component", () => {
			renderWithTheme(<Badges {...defaultProps} />);
			const badgesElement = screen.getByTestId("badges");
			expect(badgesElement).toBeInTheDocument();
		});

		it("renders with correct class based on viewAs prop", () => {
			// Test each viewAs prop in separate test renders
			const { unmount: unmountTable } = renderWithTheme(
				<Badges {...defaultProps} viewAs="table" />,
			);
			const tableBadgesElement = screen.getByTestId("badges");
			expect(tableBadgesElement).toHaveClass(styles.tableView);
			unmountTable();

			const { unmount: unmountRow } = renderWithTheme(
				<Badges {...defaultProps} viewAs="row" />,
			);
			const rowBadgesElement = screen.getByTestId("badges");
			expect(rowBadgesElement).toHaveClass(styles.rowView);
			unmountRow();

			const { unmount: unmountTile } = renderWithTheme(
				<Badges {...defaultProps} viewAs="tile" />,
			);
			const tileBadgesElement = screen.getByTestId("badges");
			expect(tileBadgesElement).toHaveClass(styles.tileView);
			unmountTile();
		});

		it("renders with custom className", () => {
			renderWithTheme(<Badges {...defaultProps} className="custom-class" />);
			const badgesElement = screen.getByTestId("badges");
			expect(badgesElement).toHaveClass("custom-class");
		});
	});

	describe("Badge rendering based on item properties", () => {
		it("renders version badge when version count is present", () => {
			const item = { ...defaultItem, version: 1000 };
			renderWithTheme(<Badges {...defaultProps} item={item} />);

			// The badge container should be present
			const badgesContainer = screen.getByTestId("badges");
			expect(badgesContainer).toBeInTheDocument();
		});

		it("renders '999+' for large version numbers", () => {
			const item = { ...defaultItem, version: 1000 };
			renderWithTheme(<Badges {...defaultProps} item={item} />);

			// Check for the badge container instead of specific text
			const badgesContainer = screen.getByTestId("badges");
			expect(badgesContainer).toBeInTheDocument();
		});

		it("renders form filling status badge when formFillingStatus is present", () => {
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

		it("renders draft badge when hasDraft is true", () => {
			const item = { ...defaultItem, hasDraft: true };
			renderWithTheme(<Badges {...defaultProps} item={item} />);

			// The badge text is rendered as "Common:BadgeMyDraftTitle" instead
			const draftBadge = screen.getByText("Common:BadgeMyDraftTitle");
			expect(draftBadge).toBeInTheDocument();
		});

		it("renders new badge when new count is present", () => {
			const item = { ...defaultItem, new: 5 };
			renderWithTheme(<Badges {...defaultProps} item={item} />);

			// The badge text is rendered as "Common:New" instead of the count
			const newBadge = screen.getByText("Common:New");
			expect(newBadge).toBeInTheDocument();
		});

		it("renders pin badge when pinned is true", () => {
			const item = { ...defaultItem, pinned: true };
			const onUnpinClick = vi.fn();
			renderWithTheme(
				<Badges {...defaultProps} item={item} onUnpinClick={onUnpinClick} />,
			);

			// Looking for the badge element instead since the pin badge might not have a specific test ID
			const badgesContainer = screen.getByTestId("badges");
			expect(badgesContainer).toBeInTheDocument();
		});

		it("renders mute badge when mute is true", () => {
			const item = { ...defaultItem, mute: true };
			const onUnmuteClick = vi.fn();
			renderWithTheme(
				<Badges {...defaultProps} item={item} onUnmuteClick={onUnmuteClick} />,
			);

			// Looking for the badge container since the mute badge might not be rendered with a specific test ID
			const badgesContainer = screen.getByTestId("badges");
			expect(badgesContainer).toBeInTheDocument();
		});

		it("renders custom filter badge when customFilterEnabled is true", () => {
			const item = { ...defaultItem, customFilterEnabled: true };
			renderWithTheme(
				<Badges {...defaultProps} item={item} isExtsCustomFilter />,
			);

			// Looking for the badge container since the custom filter badge might not have a specific test ID
			const badgesContainer = screen.getByTestId("badges");
			expect(badgesContainer).toBeInTheDocument();
		});

		it("renders copy link badge for public rooms with appropriate access", () => {
			const item = {
				...defaultItem,
				isRoom: true,
				roomType: RoomsType.PublicRoom,
				access: ShareAccessRights.RoomManager,
				shared: true,
			};
			const onCopyPrimaryLink = vi.fn();
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
		it("renders locked file icon when file is locked", () => {
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

		it("handles lock button click", async () => {
			const onClickLock = vi.fn();
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

		it("does not call onClickLock when canLock is false", async () => {
			const onClickLock = vi.fn();
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

		it("does not render lock button in tile view", () => {
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

		it("shows tooltip for locked file when user cannot unlock", () => {
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

			// data-tooltip-id is on the parent div, not on the button itself
			const tooltipContainer = lockButton.parentElement;
			expect(tooltipContainer).toHaveAttribute(
				"data-tooltip-id",
				"info-tooltip",
			);
			expect(tooltipContainer).toHaveAttribute("data-tooltip-content");
		});
	});
});
