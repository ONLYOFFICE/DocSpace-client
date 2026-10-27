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

const mocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: { rooms: { createRoom: mocks.createRoom, editRoom: vi.fn() } },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    ModalDialog: Object.assign(Slot, { Header: Slot, Body: Slot, Footer: Slot }),
    ModalDialogType: { aside: "aside" },
  };
});

vi.mock("@onlyoffice/apps-ui-kit/components/button", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  Button: ({
    label,
    onClick,
    isDisabled,
  }: {
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
  }) => (
    <button
      type="button"
      data-label={label}
      disabled={isDisabled}
      onClick={onClick}
    />
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/text-input", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  TextInput: ({
    placeholder,
    value,
    onChange,
  }: {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input data-placeholder={placeholder} value={value} onChange={onChange} />
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/room-icon", () => ({
  RoomIcon: () => null,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/avatar-editor-dialog", () => ({
  AvatarEditorDialog: () => null,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/room-logo-cover-dialog", () => ({
  RoomLogoCoverDialog: () => null,
}));
vi.mock("react-svg", () => ({ ReactSVG: () => null }));

vi.mock("@/app/(docspace)/_store/DialogsStore", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useDialogsStore: () => ({ getCovers: vi.fn(), covers: [] }),
}));

import CreateEditRoomDialog from ".";

describe("CreateEditRoomDialog of a private room", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;

  const render = async (
    props: Partial<React.ComponentProps<typeof CreateEditRoomDialog>>,
  ) => {
    container = document.createElement("div");
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <CreateEditRoomDialog visible onClose={vi.fn()} {...props} />,
      );
    });
  };

  const typeName = (value: string) =>
    act(() => {
      const input = container.querySelector<HTMLInputElement>(
        '[data-placeholder="Common:EnterName"]',
      )!;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

  const clickCreate = () =>
    act(async () => {
      container
        .querySelector<HTMLElement>('[data-label="Common:Create"]')
        ?.click();
    });

  beforeEach(() => {
    mocks.createRoom.mockImplementation(async () => ({ id: 77 }));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("creates nothing, with the localized message, when no key is found on a second look", async () => {
    const resolveEncryptionKeys = vi.fn(async () => false);
    await render({ isPrivate: true, resolveEncryptionKeys });

    await typeName("Vault");
    await clickCreate();

    expect(resolveEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionKeysRequiredForPrivateRoom",
    );
    expect(mocks.createRoom).not.toHaveBeenCalled();
  });

  it("creates the private room once the keys are confirmed", async () => {
    await render({
      isPrivate: true,
      resolveEncryptionKeys: async () => true,
      onRoomCreated: vi.fn(),
    });

    await typeName("Vault");
    await clickCreate();

    expect(mocks.createRoom).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Vault", private: true }),
    );
  });

  it("shows the private badge when a private room is created", async () => {
    await render({ isPrivate: true });

    expect(container.textContent).toContain("Common:PrivateRoomTitle");
  });

  it("shows the private badge when a private room is edited from any entry", async () => {
    await render({
      room: { id: 10, title: "Vault", private: true } as React.ComponentProps<
        typeof CreateEditRoomDialog
      >["room"],
    });

    expect(container.textContent).toContain("Common:EditPrivateRoom");
    expect(container.textContent).toContain("Common:PrivateRoomTitle");
  });
});
