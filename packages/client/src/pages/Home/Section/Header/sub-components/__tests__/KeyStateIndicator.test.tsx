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


import { createContext, type ComponentType } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "mobx-react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCurrentAutoLockPresetId,
  setAutoLockPreset,
} from "@docspace/shared/services/encryption/auto-lock-preference";

type TestEncryption = {
  isUnlocked: boolean;
  hasConfiguredKey: boolean;
  keysLoaded: boolean;
  requireIdentity: () => Promise<unknown>;
  lock: () => void;
};

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn() },
}));

vi.mock("@docspace/shared/context/encryption", async () => {
  const { createContext: create, useContext } = await import("react");
  const TestEncryptionContext = create<TestEncryption | null>(null);
  return {
    TestEncryptionContext,
    useEncryption: () => useContext(TestEncryptionContext),
  };
});

const { TestEncryptionContext } = (await import(
  "@docspace/shared/context/encryption"
)) as unknown as {
  TestEncryptionContext: ReturnType<typeof createContext<TestEncryption | null>>;
};

const { default: KeyStateIndicator } = (await import(
  "../KeyStateIndicator"
)) as unknown as { default: ComponentType<{ isPrivate: boolean }> };

const INDICATOR = "key_state_indicator";

const encryptionState = (
  overrides: Partial<TestEncryption> = {},
): TestEncryption => ({
  isUnlocked: true,
  hasConfiguredKey: true,
  keysLoaded: true,
  requireIdentity: vi.fn(async () => null),
  lock: vi.fn(),
  ...overrides,
});

const renderIndicator = (
  encryption: TestEncryption,
  { isPrivate = true } = {},
) => {
  const syncEncryptedRoom = vi.fn();
  const filesStore = { syncEncryptedRoom };
  const tree = (value: TestEncryption) => (
    <MemoryRouter>
      <Provider filesStore={filesStore}>
        <TestEncryptionContext.Provider value={value}>
          <KeyStateIndicator isPrivate={isPrivate} />
        </TestEncryptionContext.Provider>
      </Provider>
    </MemoryRouter>
  );
  const view = render(tree(encryption));

  return {
    syncEncryptedRoom,
    update: (value: TestEncryption) => view.rerender(tree(value)),
  };
};

describe("Key state is shown in the header of a private room", () => {
  it("Unlocked key", () => {
    renderIndicator(encryptionState());

    expect(screen.getByTestId(INDICATOR)).toHaveTextContent(
      "Common:KeyUnlocked",
    );
  });

  it("Key locks while the room is open", () => {
    const { update } = renderIndicator(encryptionState());

    update(encryptionState({ isUnlocked: false }));

    expect(screen.getByTestId(INDICATOR)).toHaveTextContent("Common:KeyLocked");
  });

  it.each([
    ["known to hold no key", true],
    ["not known", false],
  ])("User without a key: key list %s", (_name, keysLoaded) => {
    renderIndicator(encryptionState({ hasConfiguredKey: false, keysLoaded }));

    expect(screen.queryByTestId(INDICATOR)).toBeNull();
  });

  it("Room that is not private", () => {
    renderIndicator(encryptionState(), { isPrivate: false });

    expect(screen.queryByTestId(INDICATOR)).toBeNull();
  });

  it("raises the unlock dialog when the key is locked", async () => {
    const requireIdentity = vi.fn(async () => ({ publicKey: "pub" }));
    const { syncEncryptedRoom } = renderIndicator(
      encryptionState({ isUnlocked: false, requireIdentity }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Common:KeyLocked" }));

    expect(requireIdentity).toHaveBeenCalledTimes(1);
    expect(syncEncryptedRoom).toHaveBeenCalledTimes(1);
  });

  it("does not sync the room when the unlock dialog is cancelled", async () => {
    const requireIdentity = vi.fn(async () => null);
    const { syncEncryptedRoom } = renderIndicator(
      encryptionState({ isUnlocked: false, requireIdentity }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Common:KeyLocked" }));

    expect(requireIdentity).toHaveBeenCalledTimes(1);
    expect(syncEncryptedRoom).not.toHaveBeenCalled();
  });
});

describe("Key state indicator leads to the key actions", () => {
  beforeEach(() => {
    setAutoLockPreset("30m");
  });

  const popover = () =>
    screen.queryByRole("dialog", { name: "Common:KeyUnlocked" });

  it("Popover of an unlocked key", async () => {
    const user = userEvent.setup();
    renderIndicator(encryptionState());

    await user.click(screen.getByRole("button", { name: "Common:KeyUnlocked" }));

    const dialog = popover();
    expect(dialog).not.toBeNull();
    const inside = within(dialog as HTMLElement);
    expect(inside.getByText("Common:KeyUnlocked")).toBeInTheDocument();
    const preset = within(
      inside.getByRole("group", { name: "Common:AutoLockLabel" }),
    ).getByRole("button");
    await user.click(preset);
    const offered = inside
      .getAllByText(/^Common:AutoLock\d+m$/)
      .map((node) => node.textContent);
    expect(new Set(offered)).toEqual(
      new Set(["Common:AutoLock5m", "Common:AutoLock15m", "Common:AutoLock30m"]),
    );
    expect(
      inside.getByRole("button", { name: "Common:LockNow" }),
    ).toBeInTheDocument();
    expect(
      inside.getByRole("link", { name: "Common:KeysManagement" }),
    ).toHaveAttribute("href", "/profile/keys-management");
  });

  it("Preset picked in the popover", async () => {
    const user = userEvent.setup();
    renderIndicator(encryptionState());

    await user.click(screen.getByRole("button", { name: "Common:KeyUnlocked" }));
    const inside = within(popover() as HTMLElement);
    await user.click(
      within(inside.getByRole("group", { name: "Common:AutoLockLabel" })).getByRole(
        "button",
      ),
    );
    await user.click(inside.getByText("Common:AutoLock5m"));

    expect(getCurrentAutoLockPresetId()).toBe("5m");
    expect(popover()).not.toBeNull();
  });

  it("Lock from the popover", async () => {
    const user = userEvent.setup();
    const lock = vi.fn();
    const { update } = renderIndicator(encryptionState({ lock }));
    lock.mockImplementation(() =>
      update(encryptionState({ isUnlocked: false, lock })),
    );

    await user.click(screen.getByRole("button", { name: "Common:KeyUnlocked" }));
    await user.click(
      within(popover() as HTMLElement).getByRole("button", {
        name: "Common:LockNow",
      }),
    );

    expect(lock).toHaveBeenCalledTimes(1);
    expect(popover()).toBeNull();
    expect(screen.getByTestId(INDICATOR)).toHaveTextContent("Common:KeyLocked");
  });

  it("Locked key", async () => {
    const user = userEvent.setup();
    const requireIdentity = vi.fn(async () => null);
    renderIndicator(encryptionState({ isUnlocked: false, requireIdentity }));

    await user.click(screen.getByRole("button", { name: "Common:KeyLocked" }));

    expect(requireIdentity).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each([["{Enter}"], [" "]])("Keyboard: %s", async (key) => {
    const user = userEvent.setup();
    renderIndicator(encryptionState());
    const indicator = screen.getByRole("button", { name: "Common:KeyUnlocked" });

    indicator.focus();
    await user.keyboard(key);

    const dialog = popover() as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(indicator).toHaveAttribute("aria-expanded", "true");
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");

    expect(popover()).toBeNull();
    expect(indicator).toHaveFocus();
    expect(indicator).toHaveAttribute("aria-expanded", "false");
  });

  it("leaves the first Escape to an open preset list", async () => {
    const user = userEvent.setup();
    renderIndicator(encryptionState());

    await user.click(screen.getByRole("button", { name: "Common:KeyUnlocked" }));
    const preset = within(
      within(popover() as HTMLElement).getByRole("group", {
        name: "Common:AutoLockLabel",
      }),
    ).getByRole("button");
    preset.focus();
    await user.keyboard("{ArrowDown}");
    expect(preset).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(preset).toHaveAttribute("aria-expanded", "false");
    expect(popover()).not.toBeNull();
  });

  it("closes when the key locks while it is open", async () => {
    const user = userEvent.setup();
    const { update } = renderIndicator(encryptionState());

    await user.click(screen.getByRole("button", { name: "Common:KeyUnlocked" }));
    update(encryptionState({ isUnlocked: false }));

    expect(popover()).toBeNull();
  });
});
