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
import { makeAutoObservable } from "mobx";

import type { EditableRoom } from "@/app/(rooms)/_components/create-edit-room-dialog";

// Visibility / payload state for private-specific dialogs. Each dialog is
// either fully off (target=null) or fully on with all the data it needs.

export type RemoveUserDialogPayload = {
  roomId: number;
  userId: string;
  displayName: string;
  onConfirm: () => Promise<void>;
};

export type ChangeOwnerDialogPayload = {
  roomId: number;
  roomOwnerId?: string;
  onChanged?: () => void;
};

export type InvitePanelPayload = {
  roomId: number;
  defaultAccess?: number;
  onMembersUpdated?: () => void;
};

export type CreateEditRoomPayload = {
  /** Edit mode when `room` is set; otherwise create mode. */
  room?: EditableRoom;
  onCreated?: (roomId?: number) => void;
  onEdited?: (roomId: number) => void;
};

class PrivateDialogsStore {
  removeUser: RemoveUserDialogPayload | null = null;
  changeOwner: ChangeOwnerDialogPayload | null = null;
  invitePanel: InvitePanelPayload | null = null;
  createEditRoom: CreateEditRoomPayload | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  openRemoveUser = (payload: RemoveUserDialogPayload) => {
    this.removeUser = payload;
  };

  closeRemoveUser = () => {
    this.removeUser = null;
  };

  openChangeOwner = (payload: ChangeOwnerDialogPayload) => {
    this.changeOwner = payload;
  };

  closeChangeOwner = () => {
    this.changeOwner = null;
  };

  openInvitePanel = (payload: InvitePanelPayload) => {
    this.invitePanel = payload;
  };

  closeInvitePanel = () => {
    this.invitePanel = null;
  };

  openCreateEditRoom = (payload: CreateEditRoomPayload = {}) => {
    this.createEditRoom = payload;
  };

  closeCreateEditRoom = () => {
    this.createEditRoom = null;
  };

  reset = () => {
    this.removeUser = null;
    this.changeOwner = null;
    this.invitePanel = null;
    this.createEditRoom = null;
  };
}

const PrivateDialogsStoreContext =
  React.createContext<PrivateDialogsStore | null>(null);

export const PrivateDialogsStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new PrivateDialogsStore(), []);
  return (
    <PrivateDialogsStoreContext.Provider value={store}>
      {children}
    </PrivateDialogsStoreContext.Provider>
  );
};

export const usePrivateDialogsStore = (): PrivateDialogsStore => {
  const store = React.useContext(PrivateDialogsStoreContext);
  if (!store) {
    throw new Error(
      "usePrivateDialogsStore must be used within a PrivateDialogsStoreProvider",
    );
  }
  return store;
};
