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
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

import EmptyPrivateRoomView from "../EmptyPrivateRoomView";

describe("EmptyPrivateRoomView", () => {
  it("renders the benefits list outside the description paragraph", () => {
    const consoleError = vi.spyOn(console, "error");

    const { container } = render(
      <Provider
        selectedFolderStore={{ security: { Create: true } }}
        uploadDataStore={{ shouldEncryptCurrentUpload: () => true }}
      >
        <EmptyPrivateRoomView />
      </Provider>,
    );

    const list = container.querySelector("ul");
    expect(list).not.toBeNull();
    expect(list!.closest("p")).toBeNull();
    expect(
      screen.getByText("Common:PrivateRoomEmptyBenefitE2EE"),
    ).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });
});

// Spec: private-rooms/file-operations, "Empty folder inside a private room shows a folder empty view"
describe("Empty folder inside a private room", () => {
  const folderView = {
    title: "Common:EmptyScreenFolder",
    icon: <svg data-testid="folder-illustration" />,
  };

  const renderView = ({
    canCreate = true,
    hasKeys = true,
    inFolder = true,
  }: { canCreate?: boolean; hasKeys?: boolean; inFolder?: boolean } = {}) =>
    render(
      <Provider
        selectedFolderStore={{ security: { Create: canCreate } }}
        uploadDataStore={{ shouldEncryptCurrentUpload: () => hasKeys }}
      >
        <EmptyPrivateRoomView folderView={inFolder ? folderView : undefined} />
      </Provider>,
    );

  it("Empty folder with keys", () => {
    const { container } = renderView();

    expect(screen.getByText("Common:EmptyScreenFolder")).toBeInTheDocument();
    expect(screen.getByTestId("folder-illustration")).toBeInTheDocument();
    expect(screen.getByText("EmptyView:CreateNewFileTitle")).toBeInTheDocument();
    expect(
      screen.getByText("Common:PrivateRoomFolderEmptyDescription"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("EmptyView:UploadDeviceOptionTitle"),
    ).toBeInTheDocument();

    expect(screen.queryByText("Common:PrivateRoomEmptyTitle")).toBeNull();
    expect(screen.queryByText("Common:PrivateRoomEmptyBenefitE2EE")).toBeNull();
    expect(container.querySelector("ul")).toBeNull();
  });

  it("Empty folder without keys", () => {
    renderView({ hasKeys: false });

    expect(screen.queryByText("EmptyView:CreateNewFileTitle")).toBeNull();
    expect(screen.getByText("Common:NewFolder")).toBeInTheDocument();
    expect(
      screen.getByText("EmptyView:UploadDeviceOptionTitle"),
    ).toBeInTheDocument();
  });

  it("Empty folder without the create right", () => {
    renderView({ canCreate: false });

    expect(screen.getByText("Common:EmptyScreenFolder")).toBeInTheDocument();
    expect(screen.queryByText("EmptyView:CreateNewFileTitle")).toBeNull();
    expect(screen.queryByText("Common:NewFolder")).toBeNull();
    expect(screen.queryByText("EmptyView:UploadDeviceOptionTitle")).toBeNull();
  });

  it("gives each welcome line an icon of its own", () => {
    renderView({ inFolder: false });
    const icons = Array.from(document.querySelectorAll("li svg")).map(
      (icon) => icon.innerHTML,
    );
    expect(icons).toHaveLength(4);
    expect(new Set(icons).size).toBe(4);
  });

  it("Room root", () => {
    renderView({ inFolder: false });

    expect(
      screen.getByText("Common:PrivateRoomEmptyTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Common:PrivateRoomEmptyBenefitE2EE"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Common:EmptyScreenFolder")).toBeNull();
    expect(
      screen.queryByText("Common:PrivateRoomFolderEmptyDescription"),
    ).toBeNull();
  });

  // An archived room is read-only: its folders give no create right.
  it("Folder of an archived private room", () => {
    renderView({ canCreate: false, hasKeys: true });

    expect(screen.getByText("Common:EmptyScreenFolder")).toBeInTheDocument();
    expect(screen.queryByText("EmptyView:CreateNewFileTitle")).toBeNull();
    expect(screen.queryByText("EmptyView:UploadDeviceOptionTitle")).toBeNull();
    expect(screen.queryByText("Common:PrivateRoomEmptyBenefitE2EE")).toBeNull();
  });
});
