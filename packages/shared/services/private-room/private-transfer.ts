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


import type { TFile, TFolder } from "../../api/files/types";
import type { FolderType, RoomsType } from "../../enums";
import type { Nullable } from "../../types";
import type { TBreadCrumb } from "@onlyoffice/apps-ui-kit/components/selector";
import type { IdentityKeyPair } from "../encryption/types";
import {
  listDecryptedFileNames,
  resolveNameClashes,
} from "./encrypted-name-clash";

export type TEncryptedTransferDest = {
  private?: boolean;
  rootFolderId?: number | string;
  roomType?: Nullable<RoomsType>;
  rootFolderType?: FolderType;
};

/** An item of a transfer: only whether it is a folder matters to the plan. */
export type TPrivateTransferItem = { isFolder?: boolean };

export type TPrivateTransferPlan<
  T extends TPrivateTransferItem = TPrivateTransferItem,
> =
  | { kind: "generic" }
  | { kind: "refuse-into" }
  | { kind: "same-room" }
  | { kind: "refuse-folder-out" }
  | { kind: "refuse-move-into" }
  | {
      kind: "decrypt-out";
      files: T[];
      refusedFolders: T[];
    }
  | {
      kind: "reencrypt-into";
      files: T[];
      refusedFolders: T[];
    };

// Spec: private-rooms/file-operations, "Transfer into a private room is refused",
// "Folders cannot leave a private room", "Files leaving a private room are decrypted",
// "Copy into another private room is re-encrypted", "Move into another private room is refused".
export type TPrivateTransferParams<
  T extends TPrivateTransferItem = TPrivateTransferItem,
> = {
  items: T[];
  sourceInPrivateRoom: boolean;
  /** The private room the items are in, when the caller knows it. */
  sourceRoomId?: number | string | null;
  move?: boolean;
  dest:
    | (TEncryptedTransferDest & {
        /**
         * Whether the destination lies inside a private room, when the caller
         * knows it (current folder, picker). Without it the plan falls back to
         * `private`, which only a room row carries.
         */
        insidePrivateRoom?: boolean;
        /** The private room that contains the destination, when known. */
        roomId?: number | string | null;
      })
    | null
    | undefined;
};

/** Whether two ids, either of which may be missing, name the same entry. */
export const isSameId = (
  a: number | string | null | undefined,
  b: number | string | null | undefined,
) =>
  a !== undefined && a !== null && b !== undefined && b !== null
    ? String(a) === String(b)
    : false;

export const planPrivateTransfer = <T extends TPrivateTransferItem>(
  params: TPrivateTransferParams<T>,
): TPrivateTransferPlan<T> => {
  const { items, sourceInPrivateRoom, sourceRoomId, move, dest } = params;

  const destPrivate = dest?.insidePrivateRoom ?? dest?.private === true;

  if (destPrivate && !sourceInPrivateRoom) return { kind: "refuse-into" };
  if (!sourceInPrivateRoom) return { kind: "generic" };
  if (destPrivate && isSameId(dest?.roomId, sourceRoomId)) {
    return { kind: "same-room" };
  }
  // Spec: private-rooms/file-operations, "Move into another private room is refused".
  if (destPrivate && move) return { kind: "refuse-move-into" };

  const files = items.filter((el) => !el.isFolder);
  const refusedFolders = items.filter((el) => !!el.isFolder);
  if (files.length === 0) return { kind: "refuse-folder-out" };
  return destPrivate
    ? { kind: "reencrypt-into", files, refusedFolders }
    : { kind: "decrypt-out", files, refusedFolders };
};

// Spec: private-rooms/file-operations, "Copy within the same private room".
export const sameRoomCopyNames = async <T>(
  decrypted: { item: T; file: File }[],
  destFolderId: number | string,
  roomId: number | string,
  userId: string,
  identity: IdentityKeyPair,
): Promise<Map<T, string>> => {
  let existingNames: string[] = [];
  try {
    existingNames = await listDecryptedFileNames(
      destFolderId,
      roomId,
      userId,
      identity,
    );
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: the copy goes on with the names it has; the failure is logged for triage.
    console.error("[ENCRYPTION] same-room copy names not listed:", error);
  }
  const clashes = resolveNameClashes(
    decrypted.map(({ item, file }) => ({ item, name: file.name })),
    [...existingNames, ...decrypted.map(({ file }) => file.name)],
  );
  return new Map(clashes.map(({ item, renamed }) => [item, renamed]));
};

/**
 * Whether the picker warns that encrypted files leaving a private room are
 * saved in decrypted form.
 * Spec: private-rooms/file-operations, "No decryption warning in a Move that stays in the room".
 */
export const getShowEncryptedTransferBanner = (params: {
  selection: (TFile | TFolder | { id: number | string })[];
  sourceInPrivateRoom?: boolean;
  isCopy?: boolean;
}): boolean => {
  const { selection, sourceInPrivateRoom, isCopy } = params;
  if (!isCopy || !sourceInPrivateRoom) return false;
  return selection.some(
    (item) =>
      "fileExst" in item &&
      !!item.fileExst &&
      (item as TFile).encrypted === true,
  );
};

export type TSelectorTransfer =
  | { kind: "refuse" }
  | { kind: "generic" }
  | {
      kind: "encrypted";
      encryptedFiles: TFile[];
      fileIds: number[];
      folderIds: number[];
      movesIntoItself: boolean;
      refusedFolders: boolean;
      deleteSourceOnSuccess: boolean;
    };

/**
 * The room that contains the folder the picker points at, if it is known.
 * ui-kit flags the section root with `isRoom`; only the room crumb carries a
 * room type.
 */
export const getPickedRoomId = (breadCrumbs: TBreadCrumb[] | undefined) =>
  breadCrumbs?.find((crumb) => typeof crumb.roomType !== "undefined")?.id;

/**
 * Splits the picker selection for a copy or move according to the
 * private-room transfer plan: encrypted files go through the client-side
 * copy, plain files and allowed folders through the server-side transfer.
 */
export const getSelectorTransfer = (params: {
  plan: TPrivateTransferPlan<TPrivateTransferItem>;
  selection: (TFile | TFolder | { id: number | string })[];
  selectedItemId: string | number | undefined;
  isCopy?: boolean;
  isMove?: boolean;
}): TSelectorTransfer => {
  const { plan, selection, selectedItemId, isCopy, isMove } = params;

  if (
    plan.kind === "refuse-into" ||
    plan.kind === "refuse-folder-out" ||
    plan.kind === "refuse-move-into"
  ) {
    return { kind: "refuse" };
  }

  const isFileItem = (item: (typeof selection)[number]) =>
    ("fileExst" in item && !!item.fileExst) ||
    ("contentLength" in item && !!item.contentLength);
  const encryptedFiles = selection.filter(
    (item) => isFileItem(item) && (item as TFile).encrypted === true,
  ) as TFile[];

  const leavesRoom =
    plan.kind === "decrypt-out" || plan.kind === "reencrypt-into";
  const sameRoomCopy =
    plan.kind === "same-room" && !!isCopy && encryptedFiles.length > 0;
  if (!leavesRoom && !sameRoomCopy) return { kind: "generic" };

  const fileIds: number[] = [];
  const folderIds: number[] = [];
  let movesIntoItself = false;
  for (const item of selection) {
    if (isFileItem(item)) {
      if ((item as TFile).encrypted !== true) fileIds.push(item.id as number);
    } else if (item.id === selectedItemId) {
      movesIntoItself = true;
    } else if (!leavesRoom) {
      folderIds.push(item.id as number);
    }
  }

  return {
    kind: "encrypted",
    encryptedFiles,
    fileIds,
    folderIds,
    movesIntoItself,
    refusedFolders: leavesRoom && plan.refusedFolders.length > 0,
    deleteSourceOnSuccess: plan.kind === "decrypt-out" && !!isMove,
  };
};
