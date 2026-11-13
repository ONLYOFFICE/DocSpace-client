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

type TConfirmProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
type TKeyFlowOptions = {
  onError: () => void;
  onSuccess?: () => void;
  hasExistingKeys?: boolean;
};
type TDialogProps = {
  visible?: boolean;
  hasEncryptionKeys?: boolean;
  resolveEncryptionKeys?: () => Promise<boolean | null>;
};

const mocks = vi.hoisted(() => ({
  confirm: null as TConfirmProps | null,
  keyFlow: null as TKeyFlowOptions | null,
  dialog: null as TDialogProps | null,
  requestKey: vi.fn(),
  identity: {
    keys: [] as unknown[] | null,
    hasKeys: false,
    loadKeys: vi.fn(),
  },
  toastr: { success: vi.fn(), error: vi.fn() },
  keysLoaded: true,
  editorsEncrypt: true,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ keysLoaded: mocks.keysLoaded }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@docspace/shared/dialogs/confirmation-modal", () => ({
  ConfirmationModal: (props: TConfirmProps) => {
    mocks.confirm = props;
    return null;
  },
}));

vi.mock("@docspace/shared/dialogs/key-generation", () => ({
  useGenerateKeyFlow: (options: TKeyFlowOptions) => {
    mocks.keyFlow = options;
    return { request: mocks.requestKey, modals: null };
  },
}));

vi.mock("@/app/(rooms)/_components/create-edit-room-dialog", () => ({
  default: (props: TDialogProps) => {
    mocks.dialog = props;
    return null;
  },
}));

vi.mock("@/app/(personal-files)/_store/DocsSettingsStore", () => ({
  useDocsSettingsStore: () => ({
    isEncryptedEditingAvailable: mocks.editorsEncrypt,
  }),
}));

vi.mock("@/app/(personal-files)/_store/DocsUserStore", () => ({
  useDocsUserStore: () => ({ user: { id: "me", email: "me@example.com" } }),
}));

vi.mock("../../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => mocks.identity,
}));

import PrivateCreateRoomDialog from "./PrivateCreateRoomDialog";

describe("PrivateCreateRoomDialog", () => {
  let root: Root | null = null;

  const open = (room?: { id: number; title: string }) => {
    const onClose = vi.fn();
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <PrivateCreateRoomDialog
          visible
          onClose={onClose}
          room={room as never}
        />,
      ),
    );
    return { onClose };
  };

  // Spec: private-rooms/sdk-surface, "SDK private-room dialog waits for the key"
  describe("The creation dialog waits for the key", () => {
    it("Key-less user starts a private room", () => {
      open();

      expect(mocks.confirm?.visible).toBe(true);
      expect(mocks.dialog?.visible).toBe(false);

      act(() => mocks.confirm!.onConfirm());
      expect(mocks.requestKey).toHaveBeenCalledTimes(1);
      expect(mocks.dialog?.visible).toBe(false);

      act(() => mocks.keyFlow!.onSuccess?.());
      expect(mocks.dialog?.visible).toBe(true);
    });

    it("Prompt cancelled", () => {
      const { onClose } = open();

      act(() => mocks.confirm!.onCancel());

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(mocks.dialog?.visible).toBe(false);
    });

    it("Key holder", () => {
      mocks.identity.keys = [{}];
      mocks.identity.hasKeys = true;
      open();

      expect(mocks.dialog?.visible).toBe(true);
      expect(mocks.confirm?.visible ?? false).toBe(false);
    });

    it("Editing a room", () => {
      open({ id: 7, title: "Pirate room" });

      expect(mocks.dialog?.visible).toBe(true);
      expect(mocks.confirm?.visible ?? false).toBe(false);
    });

    it("keeps the dialog while the key list is not known", () => {
      mocks.keysLoaded = false;
      mocks.identity.keys = null;
      open();

      expect(mocks.dialog?.visible).toBe(true);
    });
  });

  beforeEach(() => {
    mocks.confirm = null;
    mocks.keyFlow = null;
    mocks.dialog = null;
    mocks.identity.keys = [];
    mocks.identity.hasKeys = false;
    mocks.keysLoaded = true;
    mocks.editorsEncrypt = true;
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    vi.unstubAllGlobals();
  });

  it("Key list failed to load", () => {
    mocks.keysLoaded = false;
    mocks.identity.keys = null;
    const { onClose } = open();

    expect(mocks.confirm?.visible ?? false).toBe(false);
    expect(mocks.requestKey).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Key list still loading", () => {
    mocks.keysLoaded = false;
    mocks.identity.keys = null;
    open();

    expect(mocks.dialog?.hasEncryptionKeys).toBe(true);
    expect(mocks.keyFlow?.hasExistingKeys).toBe(true);
  });

  it("Key list known to be empty", () => {
    open();

    expect(mocks.dialog?.hasEncryptionKeys).toBe(false);
    expect(mocks.keyFlow?.hasExistingKeys).toBe(false);
  });

  it("reports an unknown key list when the save-time load fails", async () => {
    mocks.keysLoaded = false;
    mocks.identity.keys = null;
    mocks.identity.loadKeys.mockImplementation(async () => {});
    open();

    await expect(mocks.dialog!.resolveEncryptionKeys!()).resolves.toBeNull();
  });

  it("Plain HTTP origin", () => {
    vi.stubGlobal("crypto", {});
    const { onClose } = open();

    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionRequiresHttps",
    );
    expect(mocks.toastr.error).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
    expect(mocks.dialog).toBeNull();
    expect(mocks.confirm?.visible).toBe(false);
  });

  it("Document Server without encryption", () => {
    mocks.editorsEncrypt = false;
    const { onClose } = open();

    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:PrivateRoomDocServiceNotSupported",
    );
    expect(mocks.toastr.error).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
    expect(mocks.dialog).toBeNull();
    expect(mocks.confirm?.visible).toBe(false);
  });

  it("Key generation cancelled", () => {
    const { onClose } = open();

    expect(mocks.confirm?.visible).toBe(true);
    act(() => mocks.confirm!.onCancel());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.requestKey).not.toHaveBeenCalled();
  });

  it("closes the creation when key generation fails", () => {
    const { onClose } = open();

    act(() => mocks.keyFlow!.onError());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks the server for keys again before creating", async () => {
    mocks.identity.loadKeys.mockImplementation(async () => {
      mocks.identity.keys = [{ id: "key-1" }];
    });
    open();

    const hasKeys = await mocks.dialog!.resolveEncryptionKeys!();

    expect(mocks.identity.loadKeys).toHaveBeenCalledTimes(1);
    expect(hasKeys).toBe(true);
  });
});
