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

import { act, render } from "@testing-library/react";
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
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
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

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const ModalDialog = () => null;
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

const renderPrivateRoomCreation = () => {
  const onClose = vi.fn();

  render(
    <CreateRoomDialog
      t={(key: string) => key}
      visible
      onClose={onClose}
      fetchedTags={[]}
      startRoomType={RoomsTypePrivate}
      setSelectedRoomType={vi.fn()}
      selectionItems={[]}
      encryptionKeys={[]}
      userId="me"
      accountEmail="me@example.com"
      setUserEncryptionKeys={vi.fn()}
    />,
  );

  return { onClose };
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
