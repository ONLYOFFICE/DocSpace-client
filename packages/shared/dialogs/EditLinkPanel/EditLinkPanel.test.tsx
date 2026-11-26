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
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { DeviceType, ShareAccessRights, ShareRights } from "../../enums";
import type { TFile, TFileLink } from "../../api/files/types";
import type { TAvailableShareRights } from "../../types";
import { ShareLinkService } from "../../services/share-link.service";

import EditLinkPanel from "./index";
import type {
  EditLinkPanelProps,
  LinkBlockProps,
} from "./EditLinkPanel.types";
import type { RoleLinkBlockProps } from "./RoleLinkBlock/RoleLinkBlock.types";

vi.mock("../../services/share-link.service", () => ({
  ShareLinkService: { editLink: vi.fn() },
}));

const privateLinks = vi.hoisted(() => ({
  create: vi.fn(),
  edit: vi.fn(),
  ready: vi.fn(() => true),
}));

vi.mock("../../services/private-room/private-links", async (io) => ({
  ...((await io()) as object),
  createPrivateItemLink: privateLinks.create,
  editPrivateItemLink: privateLinks.edit,
  isPrivateLinkReady: privateLinks.ready,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// The panel is only interesting here through the role block and the save
// button, so every other block is reduced to a stub. LinkBlock keeps a way to
// produce a change, otherwise the save button would never become enabled.
vi.mock("./LinkBlock", () => ({
  default: ({ setLinkNameValue }: LinkBlockProps) => (
    <button
      type="button"
      data-testid="stub_rename_link"
      onClick={() => setLinkNameValue("Renamed link")}
    >
      rename
    </button>
  ),
}));

vi.mock("./PasswordAccessBlock", () => ({
  default: ({
    setPasswordValue,
    setIsPasswordValid,
  }: {
    setPasswordValue: (value: string) => void;
    setIsPasswordValid: (value: boolean) => void;
  }) => (
    <button
      type="button"
      data-testid="stub_password_block"
      onClick={() => {
        setPasswordValue("Pass-1234");
        setIsPasswordValid(true);
      }}
    >
      password
    </button>
  ),
}));

vi.mock("./LimitTimeBlock", () => ({
  default: () => <div data-testid="stub_limit_time_block" />,
}));

vi.mock("./ToggleBlock", () => ({
  default: ({
    bodyText,
    dataTestId,
  }: {
    bodyText?: string;
    dataTestId?: string;
  }) => <div data-testid={dataTestId ?? "stub_toggle_block"}>{bodyText}</div>,
}));

vi.mock("./AccessSelectorBlock", () => ({
  AccessSelectorBlock: () => <div data-testid="stub_access_selector_block" />,
}));

vi.mock("./RoleLinkBlock", () => ({
  RoleLinkBlock: ({
    accessOptions,
    selectedOption,
    warningText,
    onSelect,
  }: RoleLinkBlockProps) => (
    <div data-testid="stub_role_link_block">
      <span data-testid="stub_role_selected">{selectedOption?.key}</span>
      {warningText ? (
        <span data-testid="stub_role_warning">{warningText}</span>
      ) : null}
      {accessOptions.map((option) => (
        <button
          key={option.key}
          type="button"
          data-testid={`stub_role_option_${option.key}`}
          onClick={() => onSelect?.(option)}
        >
          {option.key}
        </button>
      ))}
    </div>
  ),
}));

const createItem = (availableShareRights: TAvailableShareRights) =>
  ({
    id: 11,
    title: "form.pdf",
    fileExst: ".pdf",
    isFile: true,
    availableShareRights,
  }) as unknown as TFile;

const createLink = (access: ShareAccessRights) =>
  ({
    access,
    canEditAccess: true,
    canEditDenyDownload: true,
    canEditInternal: false,
    canRevoke: true,
    canEditExpirationDate: true,
    isLocked: false,
    isOwner: true,
    sharedTo: {
      denyDownload: false,
      id: "link-id",
      isExpired: false,
      linkType: 1,
      primary: false,
      requestToken: "token",
      shareLink: "https://example.com/s/link-id",
      title: "Shared link",
      internal: false,
    },
  }) as unknown as TFileLink;

const renderPanel = (
  availableShareRights: TAvailableShareRights,
  access: ShareAccessRights,
) => {
  const props: EditLinkPanelProps = {
    link: createLink(access),
    item: createItem(availableShareRights),
    language: "en",
    visible: true,
    setIsVisible: vi.fn(),
    setLinkParams: vi.fn(),
    updateLink: vi.fn(),
    currentDeviceType: DeviceType.desktop,
    passwordSettings: undefined,
    getPortalPasswordSettings: vi.fn(async () => {}),
  };

  render(<EditLinkPanel {...props} />);

  return props;
};

const getSaveButton = () => screen.getByTestId("edit_link_panel_save_button");

describe("<EditLinkPanel />", () => {
  beforeEach(() => {
    vi.mocked(ShareLinkService.editLink).mockResolvedValue(
      createLink(ShareAccessRights.Editing),
    );
  });

  it("hides the role block when a single access option is available", async () => {
    renderPanel(
      { ExternalLink: [ShareRights.Editing] },
      ShareAccessRights.Editing,
    );

    await waitFor(() => expect(getSaveButton()).toBeInTheDocument());
    expect(screen.queryByTestId("stub_role_link_block")).not.toBeInTheDocument();
  });

  it("renders the role block when several access options are available", async () => {
    renderPanel(
      { ExternalLink: [ShareRights.Editing, ShareRights.Read] },
      ShareAccessRights.Editing,
    );

    expect(await screen.findByTestId("stub_role_link_block")).toBeInTheDocument();
    expect(screen.queryByTestId("stub_role_warning")).not.toBeInTheDocument();
  });

  it("keeps a revoked access selected and blocks saving", async () => {
    renderPanel(
      { ExternalLink: [ShareRights.Editing] },
      ShareAccessRights.FormFilling,
    );

    expect(screen.getByTestId("stub_role_selected")).toHaveTextContent(
      "filling",
    );
    expect(screen.getByTestId("stub_role_warning")).toHaveTextContent(
      "Common:RoleForLinkNotAvailable",
    );

    await userEvent.click(screen.getByTestId("stub_rename_link"));

    await waitFor(() => expect(getSaveButton()).toBeDisabled());
    expect(ShareLinkService.editLink).not.toHaveBeenCalled();
  });

  it("explains the blocked save for an access that has no role of its own", async () => {
    renderPanel(
      { ExternalLink: [ShareRights.Editing] },
      ShareAccessRights.DenyAccess,
    );

    expect(await screen.findByTestId("stub_role_selected")).toHaveTextContent(
      "deny-access",
    );
    expect(screen.getByTestId("stub_role_warning")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("stub_rename_link"));

    await waitFor(() => expect(getSaveButton()).toBeDisabled());
  });

  it("still explains the blocked save when no role is available at all", async () => {
    // A link blocked by the admin comes back with no available rights, so the
    // revoked access is the only option there is - the block has to render
    // anyway, or the disabled save button has no visible reason.
    renderPanel({ ExternalLink: [] }, ShareAccessRights.ReadOnly);

    expect(await screen.findByTestId("stub_role_link_block")).toBeInTheDocument();
    expect(screen.getByTestId("stub_role_warning")).toHaveTextContent(
      "Common:RoleForLinkNotAvailable",
    );
    expect(screen.getByTestId("stub_role_selected")).toHaveTextContent(
      "viewing",
    );

    await userEvent.click(screen.getByTestId("stub_rename_link"));

    await waitFor(() => expect(getSaveButton()).toBeDisabled());
  });

  it("allows saving once an available role is selected", async () => {
    renderPanel(
      { ExternalLink: [ShareRights.Editing] },
      ShareAccessRights.FormFilling,
    );

    await userEvent.click(screen.getByTestId("stub_role_option_editing"));

    expect(screen.queryByTestId("stub_role_warning")).not.toBeInTheDocument();
    await waitFor(() => expect(getSaveButton()).toBeEnabled());
  });

  it("closes the panel after a successful save", async () => {
    const props = renderPanel(
      { ExternalLink: [ShareRights.Editing, ShareRights.Read] },
      ShareAccessRights.Editing,
    );

    await userEvent.click(screen.getByTestId("stub_rename_link"));
    await waitFor(() => expect(getSaveButton()).toBeEnabled());

    await userEvent.click(getSaveButton());

    await waitFor(() => expect(props.setIsVisible).toHaveBeenCalledWith(false));
    expect(props.updateLink).toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  // Picking a calendar day with Enter used to save the panel before the date
  // was set: Enter belongs to the control it is pressed on.
  it("leaves Enter on a control in the panel to that control", async () => {
    const props = renderPanel(
      { ExternalLink: [ShareRights.Editing, ShareRights.Read] },
      ShareAccessRights.Editing,
    );

    await userEvent.click(screen.getByTestId("stub_rename_link"));
    await waitFor(() => expect(getSaveButton()).toBeEnabled());

    screen.getByTestId("stub_rename_link").focus();
    await userEvent.keyboard("{Enter}");

    expect(props.updateLink).not.toHaveBeenCalled();
  });

  it("saves on Enter with nothing in particular focused", async () => {
    const props = renderPanel(
      { ExternalLink: [ShareRights.Editing, ShareRights.Read] },
      ShareAccessRights.Editing,
    );

    await userEvent.click(screen.getByTestId("stub_rename_link"));
    await waitFor(() => expect(getSaveButton()).toBeEnabled());

    (document.activeElement as HTMLElement | null)?.blur();
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(props.updateLink).toHaveBeenCalled());
  });

  it("keeps the panel open and reports the error when saving fails", async () => {
    vi.mocked(ShareLinkService.editLink).mockRejectedValue(
      new Error("Role is not available"),
    );

    const props = renderPanel(
      { ExternalLink: [ShareRights.Editing, ShareRights.Read] },
      ShareAccessRights.Editing,
    );

    await userEvent.click(screen.getByTestId("stub_rename_link"));
    await waitFor(() => expect(getSaveButton()).toBeEnabled());

    await userEvent.click(getSaveButton());

    await waitFor(() =>
      expect(toastr.error).toHaveBeenCalledWith("Role is not available"),
    );
    expect(props.setIsVisible).not.toHaveBeenCalled();
  });

  describe("link of a private item", () => {
    const renderPrivate = (over: object = {}) => {
      const props = {
        link: createLink(ShareAccessRights.ReadOnly),
        item: createItem({ ExternalLink: [ShareRights.Read] }),
        language: "en",
        visible: true,
        setIsVisible: vi.fn(),
        setLinkParams: vi.fn(),
        updateLink: vi.fn(),
        currentDeviceType: DeviceType.desktop,
        passwordSettings: undefined,
        getPortalPasswordSettings: vi.fn(async () => {}),
        privateLinkUserId: "u-1",
        ...over,
      } as EditLinkPanelProps;

      render(<EditLinkPanel {...props} />);

      return props;
    };

    it("Download ban", async () => {
      renderPrivate();

      await waitFor(() => expect(getSaveButton()).toBeInTheDocument());
      expect(screen.queryByTestId("stub_toggle_block")).toBeNull();
    });

    it("Looking for the old password", async () => {
      renderPrivate();

      await waitFor(() => expect(getSaveButton()).toBeInTheDocument());
      expect(screen.queryByTestId("stub_password_block")).toBeNull();
      expect(
        screen.getByTestId("edit_link_panel_password_fixed"),
      ).toHaveTextContent("Common:PrivateLinkPasswordFixed");
    });

    it("changes a link that exists without key material", async () => {
      const link = createLink(ShareAccessRights.ReadOnly);
      link.sharedTo.passwordRequired = true;
      privateLinks.edit.mockResolvedValue(link);
      const props = renderPrivate({ link });
      const user = userEvent.setup();

      await user.click(screen.getByTestId("stub_rename_link"));
      await user.click(getSaveButton());

      await waitFor(() => expect(props.setIsVisible).toHaveBeenCalledWith(false));
      expect(privateLinks.edit.mock.calls[0][1].sharedTo.title).toBe(
        "Renamed link",
      );
      expect(ShareLinkService.editLink).not.toHaveBeenCalled();
      expect(props.updateLink).toHaveBeenCalledWith(link);
    });

    it("Link to a folder or a room without a password", async () => {
      const folder = { id: 18, isFolder: true, parentId: 14 };
      const props = renderPrivate({
        link: { sharedTo: { primary: true } } as unknown as TFileLink,
        item: folder as unknown as EditLinkPanelProps["item"],
      });
      const user = userEvent.setup();

      // A new link asks for its password: the block is there, and a save
      // with none entered makes nothing.
      expect(screen.getByTestId("stub_password_block")).toBeInTheDocument();
      await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
      await user.click(getSaveButton());

      expect(privateLinks.create).not.toHaveBeenCalled();
      expect(props.setIsVisible).not.toHaveBeenCalled();
    });

    it("Link to a room with many files: the progress is shown, and a link left not ready is not copied", async () => {
      const folder = { id: 18, isFolder: true, parentId: 14 };
      const made = createLink(ShareAccessRights.ReadOnly);
      let finish: () => void = () => {};
      privateLinks.create.mockImplementation(
        (_item, _userId, options) =>
          new Promise((resolve) => {
            options.onProgress(2, 5);
            finish = () => resolve({ link: made, address: "address#secret" });
          }),
      );
      privateLinks.ready.mockReturnValue(false);
      const props = renderPrivate({
        link: { sharedTo: { primary: true } } as unknown as TFileLink,
        item: folder as unknown as EditLinkPanelProps["item"],
      });
      const user = userEvent.setup();

      await user.click(screen.getByTestId("stub_password_block"));
      await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
      await user.click(getSaveButton());

      expect(
        await screen.findByTestId("edit_link_panel_wrap_progress"),
      ).toHaveTextContent("Common:PrivateLinkPreparing");
      expect(privateLinks.create.mock.calls[0][2].password).toBe("Pass-1234");

      finish();

      await waitFor(() =>
        expect(toastr.warning).toHaveBeenCalledWith(
          "Common:PrivateLinkNotReady",
        ),
      );
      expect(props.updateLink).toHaveBeenCalledWith(made);
      expect(screen.queryByTestId("edit_link_panel_wrap_progress")).toBeNull();
      privateLinks.ready.mockReturnValue(true);
    });
  });
});
