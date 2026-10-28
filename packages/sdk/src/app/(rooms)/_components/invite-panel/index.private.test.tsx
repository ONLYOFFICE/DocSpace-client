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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import type { TInviteOutcome } from "@docspace/shared/services/private-room/room-member-flows";

type TInviteInputProps = {
  setAddUsersPanelVisible: (visible: boolean) => void;
  setInviteItems: (items: unknown[]) => void;
};

const BOB = {
  id: "bob",
  avatar: "/avatar.png",
  displayName: "Bob",
  email: "bob@example.com",
  access: ShareAccessRights.Editing,
};
const DAN = {
  id: "dan",
  avatar: "/avatar.png",
  displayName: "Dan",
  email: "dan@example.com",
  access: ShareAccessRights.Editing,
};

const mocks = vi.hoisted(() => ({
  setRoomSecurity: vi.fn(),
  selector: null as Record<string, unknown> | null,
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: () => null,
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      setRoomSecurity: mocks.setRoomSecurity,
      getRoomSecurityInfo: vi.fn(async () => ({ items: [] })),
    },
    files: { getFolderInfo: vi.fn(async () => ({ id: 10, roomType: 5 })) },
    settings: {
      getInvitationSettings: vi.fn(async () => ({ allowInvitingGuests: true })),
    },
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const ModalDialog = Object.assign(Slot, {
    Container: Slot,
    Header: Slot,
    Body: Slot,
    Footer: Slot,
  });
  return { ModalDialog, ModalDialogType: { aside: "aside" } };
});

vi.mock("@onlyoffice/apps-ui-kit/selectors/People", () => ({
  default: (props: Record<string, unknown>) => {
    mocks.selector = props;
    return null;
  },
}));

vi.mock("./sub-components/InviteInput", () => ({
  default: ({ setAddUsersPanelVisible, setInviteItems }: TInviteInputProps) => (
    <>
      <button
        type="button"
        data-testid="open_selector"
        onClick={() => setAddUsersPanelVisible(true)}
      />
      <button
        type="button"
        data-testid="add_bob"
        onClick={() => setInviteItems([BOB])}
      />
      <button
        type="button"
        data-testid="add_bob_and_dan"
        onClick={() => setInviteItems([BOB, DAN])}
      />
    </>
  ),
}));
vi.mock("./sub-components/ItemsList", () => ({ default: () => null }));
vi.mock("./sub-components/ExternalLinks", () => ({ default: () => null }));
vi.mock("../link-settings-panel", () => ({ default: () => null }));

import InvitePanel from ".";

let root: Root | null = null;
let container: HTMLDivElement;

const renderPanel = async (
  props: Partial<React.ComponentProps<typeof InvitePanel>>,
) => {
  const onClose = vi.fn();
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => {
    root?.render(
      <InvitePanel
        visible
        onClose={onClose}
        roomId={10}
        roomType={RoomsType.CustomRoom}
        {...props}
      />,
    );
  });
  return { onClose };
};

const click = (testId: string) =>
  act(async () => {
    container
      .querySelector<HTMLElement>(`[data-testid="${testId}"]`)
      ?.click();
  });

const find = (testId: string) =>
  container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

describe("InvitePanel of a private room", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  beforeEach(() => {
    mocks.selector = null;
    mocks.setRoomSecurity.mockImplementation(async () => ({}));
  });

  it("People selector: no Guests tab and no groups", async () => {
    await renderPanel({ isPrivateRoom: true });

    await click("open_selector");

    expect(mocks.selector?.withGuests).toBe(false);
    expect(mocks.selector?.withGroups).toBeFalsy();
  });

  it("offers guests and groups in an ordinary room", async () => {
    await renderPanel({});

    await click("open_selector");

    expect(mocks.selector?.withGuests).toBe(true);
    expect(mocks.selector?.withGroups).toBe(true);
  });

  it("Order of operations: the keys are re-wrapped after the security update, and the panel stays open with the result until closed", async () => {
    const onBeforeSubmit = vi.fn(async () => true);
    let finish: (outcome: TInviteOutcome) => void = () => {};
    const onInviteSubmitted = vi.fn(
      () =>
        new Promise<TInviteOutcome | null>((resolve) => {
          finish = resolve;
        }),
    );
    const { onClose } = await renderPanel({
      isPrivateRoom: true,
      onBeforeSubmit,
      onInviteSubmitted,
    });

    await click("add_bob");
    await click("invite_panel_send_button");

    expect(onInviteSubmitted).toHaveBeenCalledWith(["bob"], { bob: "Bob" });
    const order = [
      onBeforeSubmit,
      mocks.setRoomSecurity,
      onInviteSubmitted,
    ].map((fn) => fn.mock.invocationCallOrder[0]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(onClose).not.toHaveBeenCalled();
    expect(find("invite_panel_result")).toBeNull();

    await act(async () => {
      finish({
        granted: [{ id: "bob", displayName: "Bob" }],
        pending: [],
        skipped: [],
      });
    });

    expect(find("invite_panel_result_granted")?.textContent).toContain("Bob");
    expect(find("invite_panel_invite_again_button")).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    await click("invite_panel_close_button");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Mixed invitation: the panel stays open listing the skipped invitee with the reason, and Invite again sends only them", async () => {
    const onInviteSubmitted = vi.fn(async () => ({
      granted: [{ id: "bob", displayName: "Bob" }],
      pending: [],
      skipped: [{ id: "dan", displayName: "Dan", reason: "no-key" as const }],
    }));
    const { onClose } = await renderPanel({
      isPrivateRoom: true,
      onBeforeSubmit: async () => true,
      onInviteSubmitted,
    });

    await click("add_bob_and_dan");
    await click("invite_panel_send_button");

    expect(find("invite_panel_result_granted")?.textContent).toContain("Bob");
    expect(find("invite_panel_result_skipped")?.textContent).toContain(
      "Common:EncryptedSkippedNoKeys",
    );
    expect(onClose).not.toHaveBeenCalled();

    await click("invite_panel_invite_again_button");

    expect(find("invite_panel_result")).toBeNull();
    await click("invite_panel_send_button");

    expect(mocks.setRoomSecurity).toHaveBeenCalledTimes(2);
    expect(mocks.setRoomSecurity.mock.calls[1][1].invitations).toEqual([
      { id: "dan", access: ShareAccessRights.Editing },
    ]);
  });

  it("Some files fail: the panel lists the invitee as pending with the failed file count", async () => {
    await renderPanel({
      isPrivateRoom: true,
      onBeforeSubmit: async () => true,
      onInviteSubmitted: async () => ({
        granted: [],
        pending: [
          { member: { id: "bob", displayName: "Bob" }, missingFileIds: [7] },
        ],
        skipped: [],
      }),
    });

    await click("add_bob");
    await click("invite_panel_send_button");

    const pending = find("invite_panel_result_pending")?.textContent;
    expect(pending).toContain("Common:EncryptedAccessPending");
    expect(pending).toContain("Bob");
    expect(pending).toContain("Common:EncryptedReencryptPartialFailure");
  });

  it("shows a failed re-wrap as a toast and closes the panel", async () => {
    const onInviteSubmitted = vi.fn(async () => {
      throw new Error("Common:EncryptionUnlockRequired");
    });
    const { onClose } = await renderPanel({
      isPrivateRoom: true,
      onBeforeSubmit: async () => true,
      onInviteSubmitted,
    });

    await click("add_bob");
    await click("invite_panel_send_button");

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.toastr.error).toHaveBeenCalledWith(
      new Error("Common:EncryptionUnlockRequired"),
    );
  });

  it("sends nothing when the unlock is declined", async () => {
    const onInviteSubmitted = vi.fn();
    const { onClose } = await renderPanel({
      isPrivateRoom: true,
      onBeforeSubmit: async () => false,
      onInviteSubmitted,
    });

    await click("add_bob");
    await click("invite_panel_send_button");

    expect(mocks.setRoomSecurity).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(onInviteSubmitted).not.toHaveBeenCalled();
  });
});
