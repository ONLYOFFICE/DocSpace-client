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

import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TFile } from "@docspace/shared/api/files/types";

import CommentEditor from "../CommentEditor";

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

const EDIT_TOGGLE = "info_panel_details_comment_edit_toggle";

const versionHistoryStore = {
  fetchFileVersions: vi.fn(async () => undefined),
  updateCommentVersion: vi.fn(async () => undefined),
  setVerHistoryFileId: vi.fn(),
  setVerHistoryFileSecurity: vi.fn(),
  isEditingVersion: false,
  isEditing: false,
};
const filesStore = { setFile: vi.fn() };

const fileWith = (overrides: Partial<TFile>) =>
  ({
    id: 7,
    version: 2,
    comment: "Second draft",
    security: { EditHistory: true },
    ...overrides,
  }) as TFile;

const renderEditor = (item: TFile) =>
  render(
    <Provider versionHistoryStore={versionHistoryStore} filesStore={filesStore}>
      <CommentEditor item={item} />
    </Provider>,
  );

describe("CommentEditor", () => {
  beforeEach(() => {
    versionHistoryStore.fetchFileVersions.mockImplementation(
      async () => undefined,
    );
    versionHistoryStore.updateCommentVersion.mockImplementation(
      async () => undefined,
    );
  });

  it("Version comment of an encrypted file in the info panel", () => {
    renderEditor(fileWith({ encrypted: true }));

    expect(screen.getByText("Second draft")).toBeInTheDocument();
    expect(screen.queryByTestId(EDIT_TOGGLE)).not.toBeInTheDocument();
    expect(versionHistoryStore.fetchFileVersions).not.toHaveBeenCalled();
    expect(versionHistoryStore.updateCommentVersion).not.toHaveBeenCalled();
  });

  it("Version comment of an encrypted file without a comment", () => {
    renderEditor(fileWith({ encrypted: true, comment: "" }));

    expect(screen.queryByTestId(EDIT_TOGGLE)).not.toBeInTheDocument();
  });

  it("Version comment of a file that is not encrypted in the info panel", async () => {
    renderEditor(fileWith({}));

    fireEvent.click(screen.getByTestId(EDIT_TOGGLE));
    fireEvent.click(screen.getByTestId("info_panel_details_comment_save_button"));

    await vi.waitFor(() =>
      expect(versionHistoryStore.updateCommentVersion).toHaveBeenCalledWith(
        7,
        "Second draft",
        2,
      ),
    );
  });

  it("File without the edit-history right", () => {
    renderEditor(fileWith({ security: { EditHistory: false } as TFile["security"] }));

    expect(screen.queryByTestId(EDIT_TOGGLE)).not.toBeInTheDocument();
  });
});
