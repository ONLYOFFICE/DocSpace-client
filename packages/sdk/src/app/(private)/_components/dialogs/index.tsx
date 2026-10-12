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

import type { TUser } from "@docspace/shared/api/people/types";

import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";

import { usePrivateDialogsStore } from "../../_store/PrivateDialogsStore";
import RemoveUserConfirmationDialog from "./RemoveUserConfirmationDialog";
import PrivateInvitePanel from "../invite-panel";
import PrivateChangeOwnerDialog from "../owner-change/PrivateChangeOwnerDialog";
import PrivateCreateRoomDialog from "../create-room/PrivateCreateRoomDialog";

const PrivateDialogsInner: React.FC = () => {
  const dialogs = usePrivateDialogsStore();
  const docsUser = useDocsUserStore();
  const user = docsUser.user as TUser | null;

  return (
    <>
      {dialogs.removeUser ? (
        <RemoveUserConfirmationDialog
          visible
          displayName={dialogs.removeUser.displayName}
          onConfirm={dialogs.removeUser.onConfirm}
          onClose={dialogs.closeRemoveUser}
        />
      ) : null}

      {dialogs.invitePanel ? (
        <PrivateInvitePanel
          visible
          onClose={dialogs.closeInvitePanel}
          roomId={dialogs.invitePanel.roomId}
          user={user ?? undefined}
          defaultAccess={dialogs.invitePanel.defaultAccess}
          onMembersUpdated={dialogs.invitePanel.onMembersUpdated}
        />
      ) : null}

      {dialogs.changeOwner ? (
        <PrivateChangeOwnerDialog
          visible
          onClose={dialogs.closeChangeOwner}
          roomId={dialogs.changeOwner.roomId}
          roomOwnerId={dialogs.changeOwner.roomOwnerId}
          currentUserId={user?.id}
          onChanged={dialogs.changeOwner.onChanged}
        />
      ) : null}

      {dialogs.createEditRoom ? (
        <PrivateCreateRoomDialog
          visible
          onClose={dialogs.closeCreateEditRoom}
          room={dialogs.createEditRoom.room}
          onCreated={dialogs.createEditRoom.onCreated}
          onEdited={dialogs.createEditRoom.onEdited}
        />
      ) : null}
    </>
  );
};

export const PrivateDialogs = observer(PrivateDialogsInner);

export default PrivateDialogs;
