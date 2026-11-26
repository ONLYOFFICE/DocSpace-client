/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied
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

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ValidationStatus } from "@docspace/shared/enums";

import { PrivateLinkPage } from "..";

const validatePublicRoomKey = vi.hoisted(() => vi.fn());
const getFileInfo = vi.hoisted(() => vi.fn());
const getFolder = vi.hoisted(() => vi.fn());
const visitor = vi.hoisted(() => ({
  openVisitorLink: vi.fn(),
  readVisitorFileName: vi.fn(),
  decryptVisitorFile: vi.fn(),
}));
const triggerFileDownload = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api/rooms", () => ({ validatePublicRoomKey }));
vi.mock("@docspace/shared/api/files", () => ({ getFileInfo, getFolder }));
vi.mock("@docspace/shared/api/files/filter", () => ({
  default: { getDefault: () => ({}) },
}));
vi.mock(
  "@docspace/shared/services/private-room/private-link-visitor",
  async (io) => ({ ...((await io()) as object), ...visitor }),
);
vi.mock("@docspace/shared/services/private-room/encrypted-download", () => ({
  triggerFileDownload,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

// 43 characters of the alphabet, ending in one of the sixteen a secret ends in.
const SECRET = `${"a".repeat(42)}A`;
const link = { key: "k", linkId: "l", identity: {} };

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <PrivateLinkPage />
    </MemoryRouter>,
  );

const status = (over: object = {}) => ({
  status: ValidationStatus.Password,
  id: "21",
  type: 2,
  isPrivate: true,
  passwordRequired: false,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  validatePublicRoomKey.mockResolvedValue(status());
  visitor.openVisitorLink.mockResolvedValue({
    state: "open",
    link,
    status: status({ status: ValidationStatus.Ok }),
  });
  visitor.readVisitorFileName.mockResolvedValue("Report.docx");
  getFileInfo.mockResolvedValue({ id: 21, title: "stored", viewUrl: "/v" });
});

describe("A visitor opens an external link without an account", () => {
  it("Address without the secret", async () => {
    renderAt("/share/private?key=k");

    expect(
      await screen.findByText("Common:PrivateLinkIncomplete"),
    ).toBeInTheDocument();
    expect(validatePublicRoomKey).not.toHaveBeenCalled();
  });

  it("Secret cut short", async () => {
    renderAt(`/share/private?key=k#${SECRET.slice(0, 30)}`);

    expect(
      await screen.findByText("Common:PrivateLinkIncomplete"),
    ).toBeInTheDocument();
    expect(visitor.openVisitorLink).not.toHaveBeenCalled();
  });

  it("Link to a file", async () => {
    visitor.decryptVisitorFile.mockResolvedValue({
      success: true,
      file: new File(["x"], "Report.docx"),
    });
    renderAt(`/share/private?key=k#${SECRET}`);

    expect(await screen.findByText("Report.docx")).toBeInTheDocument();
    expect(visitor.openVisitorLink).toHaveBeenCalledWith("k", SECRET, undefined);
    // The request for the status carries the key, never the secret.
    expect(validatePublicRoomKey).toHaveBeenCalledWith("k");

    await userEvent.click(screen.getByTestId("private_link_download_21"));

    await waitFor(() => expect(triggerFileDownload).toHaveBeenCalled());
  });

  it("Wrong password", async () => {
    validatePublicRoomKey.mockResolvedValue(status({ passwordRequired: true }));
    visitor.openVisitorLink.mockResolvedValue({ state: "wrong-proof" });
    renderAt(`/share/private?key=k#${SECRET}`);

    await userEvent.type(
      await screen.findByPlaceholderText("Common:Password"),
      "guess",
    );
    await userEvent.click(screen.getByTestId("private_link_open"));

    expect(
      await screen.findByText("Common:IncorrectPassword"),
    ).toBeInTheDocument();
    expect(visitor.openVisitorLink).toHaveBeenCalledWith("k", SECRET, "guess");
    expect(getFileInfo).not.toHaveBeenCalled();
  });

  it("Revoked or expired link", async () => {
    validatePublicRoomKey.mockResolvedValue(
      status({ status: ValidationStatus.Invalid }),
    );
    renderAt(`/share/private?key=k#${SECRET}`);

    expect(
      await screen.findByText("Common:LinkNoLongerAvailable"),
    ).toBeInTheDocument();
    expect(visitor.openVisitorLink).not.toHaveBeenCalled();
  });

  it("File the link has no key for", async () => {
    visitor.readVisitorFileName.mockResolvedValue("not-ready");
    renderAt(`/share/private?key=k#${SECRET}`);

    expect(
      await screen.findByText("Common:PrivateLinkFileNotReady"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("private_link_download_21")).toBeNull();
  });

  it("Link to a folder or a room", async () => {
    visitor.openVisitorLink.mockResolvedValue({
      state: "open",
      link,
      status: status({ status: ValidationStatus.Ok, type: 1, id: "5" }),
    });
    getFolder.mockResolvedValue({
      folders: [{ id: 8, title: "Drafts" }],
      files: [{ id: 21, title: "stored", viewUrl: "/v" }],
    });
    renderAt(`/share/private?key=k&folder=7#${SECRET}`);

    expect(await screen.findByText("Drafts")).toBeInTheDocument();
    expect(await screen.findByText("Report.docx")).toBeInTheDocument();
    expect(getFolder.mock.calls[0][0]).toBe(7);
  });

  it("Link for DocSpace users only opened without signing in", async () => {
    validatePublicRoomKey.mockResolvedValue(
      status({ status: ValidationStatus.ExternalAccessDenied }),
    );
    renderAt(`/share/private?key=k#${SECRET}`);

    expect(await screen.findByTestId("private_link_sign_in")).toBeInTheDocument();
    expect(visitor.openVisitorLink).not.toHaveBeenCalled();
  });
});
