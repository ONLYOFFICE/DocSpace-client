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

import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsTypePrivate } from "@docspace/shared/enums";

type TConfirmProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
type TKeyFlowOptions = { onSuccess: () => void; onError: () => void };

const mocks = vi.hoisted(() => ({
  confirm: null as TConfirmProps | null,
  keyFlow: null as TKeyFlowOptions | null,
  requestKey: vi.fn(),
  panel: null as { visible?: boolean | null } | null,
  getEncryptionKeys: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@docspace/shared/api/privacy", () => ({
  getEncryptionKeys: mocks.getEncryptionKeys,
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

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const ModalDialog = (props: { visible?: boolean | null }) => {
    mocks.panel = props;
    return null;
  };
  ModalDialog.Container = () => null;
  ModalDialog.Header = () => null;
  ModalDialog.Body = () => null;
  ModalDialog.Footer = () => null;
  return { ModalDialog };
});

vi.mock("@onlyoffice/apps-ui-kit/selectors/Room", () => ({
  default: () => null,
}));
vi.mock("../sub-components/SetRoomParams", () => ({ default: () => null }));
vi.mock("../sub-components/RoomTypeList", () => ({ default: () => null }));

import CreateRoomDialogComponent from "../CreateRoomDialog";

// The inferred props of the .js dialog list every prop as required.
const CreateRoomDialog = CreateRoomDialogComponent as unknown as React.ComponentType<
  Record<string, unknown>
>;

const renderPrivateRoomCreation = ({
  encryptionKeys = [] as unknown[] | null,
} = {}) => {
  const onClose = vi.fn();
  const setUserEncryptionKeys = vi.fn();

  render(
    <CreateRoomDialog
      t={(key: string) => key}
      visible
      onClose={onClose}
      fetchedTags={[]}
      startRoomType={RoomsTypePrivate}
      setSelectedRoomType={vi.fn()}
      selectionItems={[]}
      encryptionKeys={encryptionKeys}
      userId="me"
      accountEmail="me@example.com"
      setUserEncryptionKeys={setUserEncryptionKeys}
    />,
  );

  return { onClose, setUserEncryptionKeys };
};

describe("Creating a private room without keys", () => {
  beforeEach(() => {
    mocks.confirm = null;
    mocks.keyFlow = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("offers key generation as soon as the dialog opens", () => {
    const { onClose } = renderPrivateRoomCreation();

    expect(mocks.confirm?.visible).toBe(true);
    act(() => mocks.confirm!.onConfirm());
    expect(mocks.requestKey).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Key generation cancelled", () => {
    const { onClose } = renderPrivateRoomCreation();

    act(() => mocks.confirm!.onCancel());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.requestKey).not.toHaveBeenCalled();
  });

  it("closes the creation when key generation fails", () => {
    const { onClose } = renderPrivateRoomCreation();

    act(() => mocks.keyFlow!.onError());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Plain HTTP origin", () => {
    vi.stubGlobal("crypto", {});
    const { onClose } = renderPrivateRoomCreation();

    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionRequiresHttps",
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.confirm?.visible).toBe(false);
  });
});

describe("Creating a private room before the key list is known", () => {
  beforeEach(() => {
    mocks.confirm = null;
    mocks.keyFlow = null;
  });

  it("Key list could not be loaded", async () => {
    mocks.getEncryptionKeys.mockRejectedValue(new Error("Network Error"));
    const { onClose } = renderPrivateRoomCreation({ encryptionKeys: null });

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(
        "Common:EncryptionKeysLoadFailed",
      ),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.confirm?.visible).toBe(false);
    expect(mocks.requestKey).not.toHaveBeenCalled();
  });

  it("User accepts key generation once the list loads empty", async () => {
    mocks.getEncryptionKeys.mockResolvedValue([]);
    const { onClose, setUserEncryptionKeys } = renderPrivateRoomCreation({
      encryptionKeys: null,
    });

    await waitFor(() => expect(mocks.confirm?.visible).toBe(true));
    expect(setUserEncryptionKeys).toHaveBeenCalledWith([]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("offers nothing when the loaded list holds a key", async () => {
    const key = { publicKey: "pk", privateKeyEnc: "enc", date: "2026-10-22" };
    mocks.getEncryptionKeys.mockResolvedValue([key]);
    const { onClose, setUserEncryptionKeys } = renderPrivateRoomCreation({
      encryptionKeys: null,
    });

    await waitFor(() =>
      expect(setUserEncryptionKeys).toHaveBeenCalledWith([key]),
    );
    expect(mocks.confirm?.visible).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
    // Key list still loading: nothing is shown until the list is known.
    expect(mocks.panel?.visible).toBeFalsy();
  });
});

// Spec: room-membership, "Starting private room creation without a key starts key generation"
describe("The create-room panel waits for the key", () => {
  beforeEach(() => {
    mocks.confirm = null;
    mocks.keyFlow = null;
    mocks.panel = null;
  });

  it("No dialog under the prompts", () => {
    renderPrivateRoomCreation();

    expect(mocks.confirm?.visible).toBe(true);
    expect(mocks.panel?.visible).toBeFalsy();

    act(() => mocks.confirm!.onConfirm());

    expect(mocks.requestKey).toHaveBeenCalledTimes(1);
    expect(mocks.panel?.visible).toBeFalsy();
  });

  it("User accepts key generation", async () => {
    mocks.getEncryptionKeys.mockResolvedValue([]);
    renderPrivateRoomCreation();

    act(() => mocks.confirm!.onConfirm());
    expect(mocks.panel?.visible).toBeFalsy();

    await act(async () => {
      mocks.keyFlow!.onSuccess();
    });

    await waitFor(() => expect(mocks.panel?.visible).toBe(true));
  });

  it("User cancels key generation", () => {
    const { onClose } = renderPrivateRoomCreation();

    act(() => mocks.confirm!.onCancel());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.panel?.visible).toBeFalsy();
  });

  it("Key list still loading", async () => {
    let resolveKeys: (keys: unknown[]) => void = () => {};
    mocks.getEncryptionKeys.mockReturnValue(
      new Promise<unknown[]>((resolve) => {
        resolveKeys = resolve;
      }),
    );
    renderPrivateRoomCreation({ encryptionKeys: null });

    expect(mocks.panel?.visible).toBeFalsy();
    expect(mocks.confirm?.visible).toBe(false);

    await act(async () => {
      resolveKeys([{ publicKey: "pk", privateKeyEnc: "enc", date: "2026-10-22" }]);
    });
    expect(mocks.confirm?.visible).toBe(false);
  });

  it("shows the panel at once to a user who holds a key", () => {
    renderPrivateRoomCreation({
      encryptionKeys: [{ publicKey: "pk", privateKeyEnc: "enc", date: "2026-10-22" }],
    });

    expect(mocks.panel?.visible).toBe(true);
    expect(mocks.confirm?.visible).toBe(false);
  });
});
