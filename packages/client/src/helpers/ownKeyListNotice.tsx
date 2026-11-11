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

import { Link } from "@onlyoffice/apps-ui-kit/components/link";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import i18n from "../i18n";

type TOwnKeysStore = {
  encryptionKeys: readonly unknown[] | null;
  ensureEncryptionKeys: () => Promise<readonly unknown[] | null>;
};

let loadFailedToastId: ReturnType<typeof toastr.error> | null = null;

const warnNotConfigured = () => {
  toastr.warning(i18n.t("Common:EncryptionKeysNotConfigured"));
};

const reportKeyList = (
  userStore: TOwnKeysStore,
  keys: readonly unknown[] | null,
) => {
  if (keys === null) {
    showKeyListLoadFailed(userStore);
    return;
  }

  if (keys.length === 0) warnNotConfigured();
};

/**
 * The error toast of a key list that could not be read, with its retry. It
 * stays until closed and is not stacked while one is open.
 */
function showKeyListLoadFailed(userStore: TOwnKeysStore) {
  if (loadFailedToastId !== null && toastr.isActive(loadFailedToastId)) return;

  const retry = () => {
    if (loadFailedToastId !== null) toastr.clear(loadFailedToastId);
    loadFailedToastId = null;

    void userStore
      .ensureEncryptionKeys()
      .then((keys) => reportKeyList(userStore, keys));
  };

  loadFailedToastId = toastr.error(
    <>
      {i18n.t("Common:EncryptionKeysLoadFailed")}{" "}
      <Link tag="a" isHovered color="accent" onClick={retry}>
        {i18n.t("Common:TryAgain")}
      </Link>
    </>,
    null,
    0,
    true,
  );
}

/**
 * What a user entering a private room is told about their keys: nothing when
 * they hold one, the not-configured warning for a list known to be empty, and
 * for a list that is not known a new read, reported with a retry if it fails.
 * Spec: private-rooms/file-operations, "Entering a private room without keys warns"
 */
export const noticeOwnKeysOnRoomEntry = (
  userStore: TOwnKeysStore | null | undefined,
) => {
  if (!userStore) return;

  const known = userStore.encryptionKeys;
  if (Array.isArray(known)) {
    reportKeyList(userStore, known);
    return;
  }

  void userStore
    .ensureEncryptionKeys()
    .then((keys) => reportKeyList(userStore, keys));
};

/** The same error for an action that could not read the key list. */
export const reportKeyListLoadFailed = (
  userStore: TOwnKeysStore | null | undefined,
) => {
  if (userStore) showKeyListLoadFailed(userStore);
};
