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

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyPrivateRoomView } from "./index";

// Spec: private-rooms/file-operations, "Empty folder inside a private room shows a folder empty view"
describe("EmptyPrivateRoomView (shared)", () => {
  const renderView = (
    props: Partial<React.ComponentProps<typeof EmptyPrivateRoomView>> = {},
  ) => {
    const onCreateFolder = vi.fn();
    const onUploadFiles = vi.fn();
    render(
      <EmptyPrivateRoomView
        canCreate
        onCreateFolder={onCreateFolder}
        onUploadFiles={onUploadFiles}
        {...props}
      />,
    );
    return { onCreateFolder, onUploadFiles };
  };

  it("Room root", () => {
    renderView();

    expect(screen.getByTestId("empty-private-room-view")).toBeInTheDocument();
    expect(
      screen.getByText("Common:PrivateRoomEmptyTitle"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(
      screen.getByText("Common:PrivateRoomEmptyCreateFolderDescription"),
    ).toBeInTheDocument();
  });

  it("Empty folder with the create right", async () => {
    const user = userEvent.setup();
    const { onCreateFolder, onUploadFiles } = renderView({ isFolder: true });

    expect(screen.getByTestId("empty-private-folder-view")).toBeInTheDocument();
    expect(screen.getByText("Common:EmptyScreenFolder")).toBeInTheDocument();
    expect(screen.queryByText("Common:PrivateRoomEmptyTitle")).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(
      screen.getByText("Common:PrivateRoomFolderEmptyDescription"),
    ).toBeInTheDocument();

    await user.click(screen.getByText("Common:NewFolder"));
    await user.click(screen.getByText("Common:PrivateRoomEmptyUploadTitle"));
    expect(onCreateFolder).toHaveBeenCalledTimes(1);
    expect(onUploadFiles).toHaveBeenCalledTimes(1);
  });

  it("Empty folder without the create right", () => {
    renderView({ isFolder: true, canCreate: false });

    expect(screen.getByText("Common:EmptyScreenFolder")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
