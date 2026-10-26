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

const frame = vi.hoisted(() => ({
  src: "https://portal.example.com" as string | undefined,
  forgot: null as null | (() => void),
}));

vi.mock("@/providers/SDKConfigProvider", () => ({
  useSDKConfig: () => ({ sdkConfig: frame.src ? { src: frame.src } : null }),
}));

vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
  PassphraseModal: ({
    onForgotPassphrase,
  }: {
    onForgotPassphrase: () => void;
  }) => {
    frame.forgot = onForgotPassphrase;
    return null;
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { info: vi.fn(), clear: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: () => null,
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { PassphraseDialogAdapter } from "./EncryptionShell";

describe("EncryptionShell passphrase dialog", () => {
  let root: Root | null = null;
  const onCancel = vi.fn();

  const forgotPassphrase = () => {
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <PassphraseDialogAdapter
          visible
          isLoading={false}
          error={null}
          onSubmit={vi.fn()}
          onCancel={onCancel}
        />,
      ),
    );
    act(() => frame.forgot?.());
  };

  beforeEach(() => {
    frame.src = "https://portal.example.com";
    vi.mocked(toastr.info).mockClear();
    onCancel.mockClear();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    vi.restoreAllMocks();
  });

  it("Forgot passphrase", () => {
    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);

    forgotPassphrase();

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      "https://portal.example.com/profile/keys-management?privateRooms=1",
      "_blank",
    );
    expect(toastr.info).not.toHaveBeenCalled();
  });

  it("Client not reachable", () => {
    frame.src = undefined;
    const open = vi.spyOn(window, "open");

    forgotPassphrase();

    expect(open).not.toHaveBeenCalled();
    expect(toastr.info).toHaveBeenCalledWith(
      "Common:EncryptionKeysManagedInProfile",
    );
  });

  it("explains in place when the new tab is blocked", () => {
    vi.spyOn(window, "open").mockReturnValue(null);

    forgotPassphrase();

    expect(toastr.info).toHaveBeenCalledWith(
      "Common:EncryptionKeysManagedInProfile",
    );
  });
});
