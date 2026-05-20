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

import { request } from "../client";
import type {
  TPrivacyRoomRequest,
  TPrivacySettingsRequest,
  TEncryptionKeyPair,
} from "./types";

export async function getPrivacySettings() {
  const res = (await request({
    method: "get",
    url: "privacyroom",
  })) as boolean;

  return res;
}

export async function updatePrivacySettings(data: TPrivacySettingsRequest) {
  const res = (await request({
    method: "put",
    url: "privacyroom",
    data,
  })) as boolean;

  return res;
}

export async function setEncryptionKeys(data: TPrivacyRoomRequest) {
  const res = (await request({
    method: "post",
    url: "privacyroom/keys",
    data,
  })) as TEncryptionKeyPair[];

  return res ?? [];
}

export async function updateEncryptionKeys(data: TPrivacyRoomRequest) {
  const res = (await request({
    method: "put",
    url: "privacyroom/keys",
    data,
  })) as TEncryptionKeyPair[];

  return res ?? [];
}

export async function getEncryptionKeys() {
  const res = (await request({
    method: "get",
    url: "privacyroom/keys",
  })) as TEncryptionKeyPair[];
  return res ?? [];
}

export async function getRoomEncryptionKeys(roomId: string | number) {
  const res = (await request({
    method: "get",
    url: `privacyroom/${roomId}/access`,
  })) as TEncryptionKeyPair[];
  return res ?? [];
}

export async function getFilePublicKeys(fileId: string | number) {
  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/publickeys`,
  })) as TEncryptionKeyPair[];
  return res;
}

export async function deleteEncryptionKey(keyId: string) {
  const res = (await request({
    method: "delete",
    url: `privacyroom/keys/${keyId}`,
  })) as TEncryptionKeyPair[];

  return res ?? [];
}
