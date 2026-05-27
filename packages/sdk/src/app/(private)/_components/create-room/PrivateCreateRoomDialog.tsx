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

"use client";

import React from "react";
import { observer } from "mobx-react";

import CreateEditRoomDialog, {
  type EditableRoom,
} from "@/app/(rooms)/_components/create-edit-room-dialog";

import { useEncryptionIdentityStore } from "../../_store/EncryptionIdentityStore";

// Thin wrapper around (rooms)/CreateEditRoomDialog that hard-codes
// isPrivate=true and feeds hasEncryptionKeys from EncryptionIdentityStore.
// Supports both create and edit flows by passing through the `room` prop —
// editing a private room reuses the full logo/cover/tags UI from the base
// dialog, only the create payload is differentiated.

type PrivateCreateRoomDialogProps = {
  visible: boolean;
  onClose: () => void;
  /** Pass an existing room to switch the dialog into edit mode. */
  room?: EditableRoom;
  onCreated?: (roomId?: number) => void;
  onEdited?: (roomId: number) => void;
};

const PrivateCreateRoomDialogInner: React.FC<PrivateCreateRoomDialogProps> = ({
  visible,
  onClose,
  room,
  onCreated,
  onEdited,
}) => {
  const identityStore = useEncryptionIdentityStore();

  return (
    <CreateEditRoomDialog
      visible={visible}
      onClose={onClose}
      room={room}
      isPrivate
      hasEncryptionKeys={identityStore.hasKeys}
      onRoomCreated={onCreated}
      onRoomEdited={onEdited}
    />
  );
};

const PrivateCreateRoomDialog = observer(PrivateCreateRoomDialogInner);

export default PrivateCreateRoomDialog;
