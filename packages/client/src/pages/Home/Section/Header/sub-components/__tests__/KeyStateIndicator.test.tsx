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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

type TestEncryption = {
  isUnlocked: boolean;
  hasConfiguredKey: boolean;
  keysLoaded: boolean;
  requireIdentity: () => Promise<unknown>;
};

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
  ...overrides,
});

const renderIndicator = (
  encryption: TestEncryption,
  { isPrivate = true } = {},
) => {
  const syncEncryptedRoom = vi.fn();
  const filesStore = { syncEncryptedRoom };
  const tree = (value: TestEncryption) => (
    <Provider filesStore={filesStore}>
      <TestEncryptionContext.Provider value={value}>
        <KeyStateIndicator isPrivate={isPrivate} />
      </TestEncryptionContext.Provider>
    </Provider>
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
