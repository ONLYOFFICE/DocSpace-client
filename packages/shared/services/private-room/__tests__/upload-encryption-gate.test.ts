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

import { describe, it, expect } from "vitest";

import { RoomsType } from "../../../enums";
import {
  resolveItemRoomContext,
  willEncryptUploadItem,
} from "../encrypted-upload";

const KEYS = { publicKey: "pub-base64", userId: "user-1" };

describe("resolveItemRoomContext", () => {
  it("falls back to CustomRoom + private inside a privacy folder", () => {
    const ctx = resolveItemRoomContext(undefined, {
      isPrivacyFolder: true,
      selectedRoomType: RoomsType.PublicRoom,
    });
    expect(ctx.roomType).toBe(RoomsType.CustomRoom);
    expect(ctx.isPrivate).toBe(true);
  });

  it("uses the selected room type outside a privacy folder", () => {
    const ctx = resolveItemRoomContext(undefined, {
      isPrivacyFolder: false,
      selectedRoomType: RoomsType.EditingRoom,
    });
    expect(ctx.roomType).toBe(RoomsType.EditingRoom);
    expect(ctx.isPrivate).toBe(false);
  });

  it("honors the per-file uploadContext override over the folder context", () => {
    const ctx = resolveItemRoomContext(
      { roomType: RoomsType.CustomRoom, isPrivate: true },
      { isPrivacyFolder: false, selectedRoomType: RoomsType.PublicRoom },
    );
    expect(ctx.roomType).toBe(RoomsType.CustomRoom);
    expect(ctx.isPrivate).toBe(true);
  });

  it("treats an override with isPrivate=false as non-private", () => {
    const ctx = resolveItemRoomContext(
      { roomType: RoomsType.CustomRoom, isPrivate: false },
      { isPrivacyFolder: true, selectedRoomType: null },
    );
    expect(ctx.isPrivate).toBe(false);
  });
});

describe("willEncryptUploadItem", () => {
  const privacyFolder = {
    isPrivacyFolder: true,
    selectedRoomType: RoomsType.CustomRoom,
  };

  it("encrypts a fresh file in a private custom room when keys exist", () => {
    expect(willEncryptUploadItem({ ...KEYS }, privacyFolder)).toBe(true);
  });

  it("does NOT encrypt when encryption keys are missing", () => {
    expect(
      willEncryptUploadItem({ publicKey: null, userId: null }, privacyFolder),
    ).toBe(false);
    expect(
      willEncryptUploadItem({ publicKey: "pub", userId: null }, privacyFolder),
    ).toBe(false);
  });

  it("does NOT re-encrypt an already-encrypted item", () => {
    expect(
      willEncryptUploadItem({ ...KEYS, alreadyEncrypted: true }, privacyFolder),
    ).toBe(false);
  });

  it("does NOT encrypt in a non-private folder", () => {
    expect(
      willEncryptUploadItem(
        { ...KEYS },
        { isPrivacyFolder: false, selectedRoomType: RoomsType.EditingRoom },
      ),
    ).toBe(false);
  });

  it("does NOT encrypt a non-encryptable room type even when private", () => {
    expect(
      willEncryptUploadItem(
        { ...KEYS, uploadContext: { roomType: RoomsType.PublicRoom, isPrivate: true } },
        { isPrivacyFolder: false, selectedRoomType: null },
      ),
    ).toBe(false);
  });

  it("returns false when no room type can be resolved", () => {
    expect(
      willEncryptUploadItem(
        { ...KEYS },
        { isPrivacyFolder: false, selectedRoomType: null },
      ),
    ).toBe(false);
  });
});
