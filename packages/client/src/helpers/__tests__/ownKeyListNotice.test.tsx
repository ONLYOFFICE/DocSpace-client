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
import { beforeEach, describe, expect, it, vi } from "vitest";

const toast = vi.hoisted(() => ({ active: new Set<number>(), nextId: 1 }));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: {
    warning: vi.fn(),
    error: vi.fn(() => {
      const id = toast.nextId++;
      toast.active.add(id);
      return id;
    }),
    clear: vi.fn((id: number) => toast.active.delete(id)),
    isActive: vi.fn((id: number) => toast.active.has(id)),
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/link", () => ({
  Link: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("../../i18n", () => ({ default: { t: (key: string) => key } }));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import {
  noticeOwnKeysOnRoomEntry,
  reportKeyListLoadFailed,
} from "../ownKeyListNotice";

const KEY = { id: "key-1" };

const storeWith = (
  encryptionKeys: unknown[] | null,
  ...reads: (unknown[] | null)[]
) => {
  const ensureEncryptionKeys = vi.fn(async () => null as unknown[] | null);
  for (const read of reads) ensureEncryptionKeys.mockResolvedValueOnce(read);

  return { encryptionKeys, ensureEncryptionKeys };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Renders the body of the last error toast and presses its retry link. */
const pressTryAgain = async () => {
  const body = vi.mocked(toastr.error).mock.lastCall?.[0] as React.ReactNode;
  const view = render(<div>{body}</div>);

  expect(view.container).toHaveTextContent("Common:EncryptionKeysLoadFailed");
  await userEvent.click(
    screen.getByRole("button", { name: "Common:TryAgain" }),
  );
  view.unmount();
  await settle();
};

describe("Entering a private room without keys warns", () => {
  beforeEach(() => {
    toast.active.clear();
  });

  it("Navigate into room", () => {
    const store = storeWith([]);

    noticeOwnKeysOnRoomEntry(store);

    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:EncryptionKeysNotConfigured",
    );
    expect(store.ensureEncryptionKeys).not.toHaveBeenCalled();
  });

  it("says nothing to a key holder", async () => {
    const store = storeWith([KEY]);

    noticeOwnKeysOnRoomEntry(store);
    await settle();

    expect(toastr.warning).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("reads an unknown list and says nothing when it holds a key", async () => {
    const store = storeWith(null, [KEY]);

    noticeOwnKeysOnRoomEntry(store);
    await settle();

    expect(store.ensureEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(toastr.warning).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("warns when the read of an unknown list answers with an empty one", async () => {
    const store = storeWith(null, []);

    noticeOwnKeysOnRoomEntry(store);
    await settle();

    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:EncryptionKeysNotConfigured",
    );
  });

  it("Key list could not be loaded", async () => {
    const store = storeWith(null, null);

    noticeOwnKeysOnRoomEntry(store);
    await settle();

    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(vi.mocked(toastr.error).mock.lastCall?.slice(1)).toEqual([
      null,
      0,
      true,
    ]);
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("shows the error once while its toast is open", async () => {
    const store = storeWith(null, null, null);

    noticeOwnKeysOnRoomEntry(store);
    await settle();
    noticeOwnKeysOnRoomEntry(store);
    await settle();
    reportKeyListLoadFailed(store);

    expect(toastr.error).toHaveBeenCalledTimes(1);
  });

  it("Retry succeeds", async () => {
    const store = storeWith(null, null, [KEY]);
    noticeOwnKeysOnRoomEntry(store);
    await settle();

    await pressTryAgain();

    expect(store.ensureEncryptionKeys).toHaveBeenCalledTimes(2);
    expect(toastr.clear).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("Retry fails", async () => {
    const store = storeWith(null, null, null);
    noticeOwnKeysOnRoomEntry(store);
    await settle();

    await pressTryAgain();

    expect(toastr.error).toHaveBeenCalledTimes(2);
    expect(toastr.warning).not.toHaveBeenCalled();
  });
});
