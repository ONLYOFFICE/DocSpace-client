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

// The flow with its real dialogs, for the behaviour that lives in the dialog
// chrome; useGenerateKeyFlow.test.tsx stubs the dialogs and covers the flow.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock("@docspace/shared/services/encryption/identity", () => ({
  generateIdentityKeyPair: vi.fn(),
  serializeIdentity: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/recovery", () => ({
  generateRecoveryMnemonic: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/apply-new-identity", () => ({
  applyNewIdentity: vi.fn(),
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  setEncryptionKeys: vi.fn(),
}));
vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ suspendAutoLock: () => () => {} }),
}));

import { useGenerateKeyFlow } from "../useGenerateKeyFlow";

beforeAll(() => {
  // The strength tooltip mounts floating-ui, which jsdom does not provide.
  globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
});

const Harness = () => {
  const flow = useGenerateKeyFlow({
    userId: "42",
    refreshKeysFromServer: vi.fn(),
  });
  return (
    <>
      <button type="button" onClick={() => flow.request()}>
        Common:GenerateNewKey
      </button>
      {flow.modals}
    </>
  );
};

describe("useGenerateKeyFlow with its dialogs", () => {
  it("Generation cancelled from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", {
      name: "Common:GenerateNewKey",
    });

    await user.click(trigger);
    const field = screen.getByPlaceholderText("Common:Passphrase");
    expect(field).toHaveFocus();
    await user.type(field, "Correct1horse!battery");

    await user.keyboard("{Escape}");
    expect(
      screen.getByRole("button", { name: "Common:CloseMenu" }),
    ).toBeInTheDocument();
    await user.keyboard("{Enter}");

    expect(screen.queryByPlaceholderText("Common:Passphrase")).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
