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

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "../../../../enums";
import { copyShareLink } from "../../Share.helpers";
import { useShare } from "../useShare";
import type { UseShareProps } from "../../Share.types";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});

const links = vi.hoisted(() => ({
  create: vi.fn(),
  edit: vi.fn(),
  revoke: vi.fn(),
  address: vi.fn(),
}));

vi.mock("../../Share.helpers", async (io) => ({
  ...((await io()) as object),
  copyShareLink: vi.fn(),
}));

vi.mock("../../../../services/private-room/private-links", async (io) => ({
  ...((await io()) as object),
  createPrivateItemLink: links.create,
  editPrivateItemLink: links.edit,
  revokePrivateItemLink: links.revoke,
  readPrivateLinkAddress: links.address,
}));

const SHORT = "https://portal.example/s/abc";

const link = (id: string, over: object = {}) => ({
  access: ShareAccessRights.ReadOnly,
  canEditInternal: true,
  canEditExpirationDate: true,
  sharedTo: {
    id,
    title: `Link ${id}`,
    shareLink: SHORT,
    linkType: 1,
    internal: false,
    primary: id === "1",
    isExpired: false,
    passwordRequired: true,
    ...over,
  },
});

// An entry of a private room as the server answers it: no right to share and
// no link settings of its own.
const propsOf = (over: object, selection: object = {}) =>
  ({
    infoPanelSelection: {
      id: 9,
      isFolder: false,
      fileExst: ".docx",
      canShare: false,
      encrypted: true,
      security: {},
      ...selection,
    },
    fileLinkProps: [],
    privateLinks: true,
    selfId: "u-1",
    setIsLoading: vi.fn(),
    setLinkParams: vi.fn(),
    setEditLinkPanelIsVisible: vi.fn(),
    ...over,
  }) as unknown as UseShareProps;

// The links as the share panel lays them out, without its virtualized list.
const Links = ({ props }: { props: UseShareProps }) => {
  const { getLinkElements, privateLinkDialog } = useShare(props);
  return (
    <div data-testid="links">
      {getLinkElements()}
      {privateLinkDialog}
    </div>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  links.address.mockReset();
});

describe("useShare: links of a private item", () => {
  it("Link to a file to view without a password", async () => {
    const made = link("1", { passwordRequired: false });
    links.create.mockResolvedValue({ link: made, address: `${SHORT}#secret` });
    links.address.mockResolvedValue(`${SHORT}#secret`);
    const props = propsOf({});
    render(<Links props={props} />);

    fireEvent.click(
      screen.getByTestId("info_panel_share_create_and_copy_link"),
    );

    expect(await screen.findByText("Link 1")).toBeInTheDocument();
    expect(links.create).toHaveBeenCalledWith(props.infoPanelSelection, "u-1", {
      primary: true,
    });
    // What is copied is the address with its secret, not the short address.
    expect(vi.mocked(copyShareLink).mock.calls[0][1].sharedTo.shareLink).toBe(
      `${SHORT}#secret`,
    );
  });

  it("Creator's key locked", async () => {
    links.create.mockResolvedValue(null);
    render(<Links props={propsOf({})} />);

    fireEvent.click(
      screen.getByTestId("info_panel_share_create_and_copy_link"),
    );

    await waitFor(() => expect(links.create).toHaveBeenCalled());
    expect(
      await screen.findByTestId("info_panel_share_create_and_copy_link"),
    ).toBeInTheDocument();
    expect(copyShareLink).not.toHaveBeenCalled();
  });

  it("Link to a folder or a room without a password", () => {
    const props = propsOf({}, { isFolder: true, fileExst: undefined });
    render(<Links props={props} />);

    fireEvent.click(
      screen.getByTestId("info_panel_share_create_and_copy_link"),
    );

    // The settings of the link ask for the password; nothing is made before.
    expect(links.create).not.toHaveBeenCalled();
    expect(props.setEditLinkPanelIsVisible).toHaveBeenCalledWith(true);
    expect(vi.mocked(props.setLinkParams).mock.calls[0][0]).toMatchObject({
      privateLinkUserId: "u-1",
      item: props.infoPanelSelection,
    });
  });

  it("Limit of links reached", () => {
    const six = ["1", "2", "3", "4", "5", "6"].map((id) => link(id));
    const { rerender } = render(
      <Links props={propsOf({ fileLinkProps: six.slice(0, 5) })} />,
    );
    const add = () => screen.getByTestId("info_panel_share_add_link_button");
    expect(add()).not.toHaveAttribute("aria-disabled", "true");

    rerender(<Links props={propsOf({ fileLinkProps: six })} />);
    expect(add()).toHaveAttribute("aria-disabled", "true");
  });

  it("Member who does not manage links: no address without a wrap of the secret", async () => {
    links.address.mockResolvedValue(null);
    render(<Links props={propsOf({ fileLinkProps: [link("1")] })} />);

    fireEvent.click(screen.getByText("Link 1"));

    await vi.waitFor(() => expect(links.address).toHaveBeenCalled());
    expect(copyShareLink).not.toHaveBeenCalled();
  });

  it("Manager copies the address", async () => {
    const wrapped = link("1", {
      linkSecretWrap: { publicKeyId: "key-1", wrap: "wrap" },
    });
    links.address.mockResolvedValue(`${SHORT}#secret`);
    render(<Links props={propsOf({ fileLinkProps: [wrapped] })} />);

    fireEvent.click(screen.getByText("Link 1"));

    await vi.waitFor(() => expect(copyShareLink).toHaveBeenCalled());
    expect(links.address.mock.calls[0].slice(1)).toEqual([wrapped, "u-1"]);
    expect(vi.mocked(copyShareLink).mock.calls[0][1].sharedTo.shareLink).toBe(
      `${SHORT}#secret`,
    );
  });

  it("Key locked", async () => {
    const wrapped = link("1", {
      linkSecretWrap: { publicKeyId: "key-1", wrap: "wrap" },
    });
    links.address.mockResolvedValue(null);
    render(<Links props={propsOf({ fileLinkProps: [wrapped] })} />);

    fireEvent.click(screen.getByText("Link 1"));

    await vi.waitFor(() => expect(links.address).toHaveBeenCalled());
    expect(copyShareLink).not.toHaveBeenCalled();
  });
});
