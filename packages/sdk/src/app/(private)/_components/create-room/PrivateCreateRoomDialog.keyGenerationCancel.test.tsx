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

import React, { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type TConfirmProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const mocks = vi.hoisted(() => ({
  confirm: null as TConfirmProps | null,
  passphrase: null as Record<string, unknown> | null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({
    keysLoaded: true,
    suspendAutoLock: () => () => {},
  }),
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@docspace/shared/dialogs/confirmation-modal", () => ({
  ConfirmationModal: (props: TConfirmProps) => {
    mocks.confirm = props;
    return null;
  },
}));
// The real key-generation flow runs; only its dialogs and crypto are stubbed.
vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
  PassphraseModal: (props: Record<string, unknown>) => {
    mocks.passphrase = props;
    useEffect(
      () => () => {
        mocks.passphrase = null;
      },
      [],
    );
    return null;
  },
}));
vi.mock("@docspace/shared/dialogs/key-generation/RecoveryPhraseDisplayModal", () => ({
  RecoveryPhraseDisplayModal: () => null,
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
vi.mock("@/app/(rooms)/_components/create-edit-room-dialog", () => ({
  default: () => null,
}));
vi.mock("@/app/(personal-files)/_store/DocsUserStore", () => ({
  useDocsUserStore: () => ({ user: { id: "me", email: "me@example.com" } }),
}));
vi.mock("../../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({
    keys: [],
    hasKeys: false,
    loadKeys: vi.fn(),
  }),
}));

import PrivateCreateRoomDialog from "./PrivateCreateRoomDialog";

describe("PrivateCreateRoomDialog with the real key-generation flow", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("User cancels inside key generation", () => {
    const onClose = vi.fn();
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(<PrivateCreateRoomDialog visible onClose={onClose} />),
    );

    act(() => mocks.confirm!.onConfirm());
    expect(mocks.passphrase).not.toBeNull();

    act(() => {
      (mocks.passphrase!.onCancel as () => void)();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
