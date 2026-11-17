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
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));
vi.mock("@docspace/shared/dialogs/confirmation-modal", () => ({
  ConfirmationModal: () => null,
}));
vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
  PassphraseModal: () => null,
}));
vi.mock("@docspace/shared/dialogs/key-generation/RecoveryPhraseDisplayModal", () => ({
  RecoveryPhraseDisplayModal: () => null,
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  getEncryptionKeys: vi.fn(async () => []),
  setEncryptionKeys: vi.fn(),
}));
vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ suspendAutoLock: () => () => {} }),
}));
// Only the header is drawn: it is what the test reads.
vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const ModalDialog = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  ModalDialog.Container = () => null;
  ModalDialog.Header = ({ children }: { children: ReactNode }) => (
    <h1 data-testid="dialog-header">{children}</h1>
  );
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

describe("Create room dialog header", () => {
  it.each([
    [RoomsType.InstructionsRoom, "Common:CreateSkillSet"],
    [RoomsType.KnowledgeRoom, "Common:CreateKnowledgeBase"],
    [RoomsType.FormRoom, "Common:CreateFormSpaceAction"],
    [RoomsType.CustomRoom, "Common:CreateRoom"],
  ])("titles the form of room type %s %s", (startRoomType, header) => {
    render(
      <CreateRoomDialog
        t={(key: string) => key}
        visible
        onClose={vi.fn()}
        fetchedTags={[]}
        startRoomType={startRoomType}
        setSelectedRoomType={vi.fn()}
        selectionItems={[]}
        encryptionKeys={[]}
      />,
    );

    expect(screen.getByTestId("dialog-header")).toHaveTextContent(header);
  });
});
