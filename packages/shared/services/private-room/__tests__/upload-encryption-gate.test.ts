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
import { encryptFile } from "../../encryption/file-keys";
import {
  EncryptedReimportError,
  makeOpaqueUploadName,
  prepareEncryptedUpload,
  resolveItemRoomContext,
  resolveUploadGate,
  sniffDse3Upload,
  willEncryptUploadItem,
} from "../encrypted-upload";

const KEYS = { publicKey: "pub-base64", userId: "user-1" };

const privateTarget = { isPrivate: true, roomType: RoomsType.CustomRoom };
const plainTarget = { isPrivate: false, roomType: RoomsType.EditingRoom };

describe("resolveUploadGate", () => {
  it("encrypts a fresh file fixed for a private room when keys exist", () => {
    expect(resolveUploadGate({ ...KEYS }, privateTarget)).toEqual({
      action: "encrypt",
    });
  });

  it("refuses a key-less uploader before anything else is considered", () => {
    expect(
      resolveUploadGate(
        { publicKey: null, userId: null, alreadyEncrypted: true },
        privateTarget,
      ),
    ).toEqual({ action: "refuse", reason: "no-key" });
  });

  it("passes an already-encrypted item through unchanged", () => {
    expect(
      resolveUploadGate({ ...KEYS, alreadyEncrypted: true }, privateTarget),
    ).toEqual({ action: "plain" });
  });

  it("sends plaintext for a non-private target even without keys", () => {
    expect(
      resolveUploadGate({ publicKey: null, userId: null }, plainTarget),
    ).toEqual({ action: "plain" });
    expect(
      resolveUploadGate(
        { publicKey: null, userId: null },
        { isPrivate: false, roomType: null },
      ),
    ).toEqual({ action: "plain" });
  });

  it("Private target with another room type", () => {
    const refused = {
      action: "refuse",
      reason: "unsupported-room-type",
    };

    expect(
      resolveUploadGate(
        {
          ...KEYS,
          uploadContext: { roomType: RoomsType.PublicRoom, isPrivate: true },
        },
        plainTarget,
      ),
    ).toEqual(refused);
    expect(
      resolveUploadGate({ ...KEYS }, { isPrivate: true, roomType: null }),
    ).toEqual(refused);
    expect(
      resolveUploadGate(
        { ...KEYS, alreadyEncrypted: true },
        { isPrivate: true, roomType: RoomsType.EditingRoom },
      ),
    ).toEqual(refused);
  });
});

describe("resolveItemRoomContext", () => {
  it("takes privacy and room type from the fixed target", () => {
    expect(resolveItemRoomContext(undefined, privateTarget)).toEqual({
      roomType: RoomsType.CustomRoom,
      isPrivate: true,
    });
    expect(resolveItemRoomContext(undefined, plainTarget)).toEqual({
      roomType: RoomsType.EditingRoom,
      isPrivate: false,
    });
  });

  it("honors the per-file uploadContext override over the target", () => {
    const ctx = resolveItemRoomContext(
      { roomType: RoomsType.CustomRoom, isPrivate: true },
      { isPrivate: false, roomType: RoomsType.PublicRoom },
    );
    expect(ctx.roomType).toBe(RoomsType.CustomRoom);
    expect(ctx.isPrivate).toBe(true);
  });

  it("treats an override with isPrivate=false as non-private", () => {
    const ctx = resolveItemRoomContext(
      { roomType: RoomsType.CustomRoom, isPrivate: false },
      privateTarget,
    );
    expect(ctx.isPrivate).toBe(false);
  });
});

describe("willEncryptUploadItem", () => {
  it("encrypts a fresh file fixed for a private room when keys exist", () => {
    expect(willEncryptUploadItem({ ...KEYS }, privateTarget)).toBe(true);
  });

  it("uploader without a key: refuses instead of uploading plaintext", () => {
    expect(
      willEncryptUploadItem({ publicKey: null, userId: null }, privateTarget),
    ).toBe(false);
    expect(
      resolveUploadGate({ publicKey: null, userId: null }, privateTarget),
    ).toEqual({ action: "refuse", reason: "no-key" });
    expect(
      resolveUploadGate({ publicKey: "pub", userId: null }, privateTarget),
    ).toEqual({ action: "refuse", reason: "no-key" });
  });

  it("does NOT re-encrypt an already-encrypted item", () => {
    expect(
      willEncryptUploadItem({ ...KEYS, alreadyEncrypted: true }, privateTarget),
    ).toBe(false);
  });

  it("never encrypts for a non-private target", () => {
    expect(willEncryptUploadItem({ ...KEYS }, plainTarget)).toBe(false);
  });

  it("does NOT encrypt a non-encryptable room type even when private", () => {
    expect(
      willEncryptUploadItem(
        { ...KEYS },
        { isPrivate: true, roomType: RoomsType.PublicRoom },
      ),
    ).toBe(false);
  });

  it("returns false when the target has no room type", () => {
    expect(
      willEncryptUploadItem({ ...KEYS }, { isPrivate: true, roomType: null }),
    ).toBe(false);
  });
});

describe("makeOpaqueUploadName", () => {
  it("produces a uuid name that keeps the lowercased extension", () => {
    const name = makeOpaqueUploadName("Report FINAL.DOCX");
    expect(name).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.docx$/,
    );
  });

  it("produces a bare uuid for a name without extension", () => {
    const name = makeOpaqueUploadName("README");
    expect(name).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});

describe("sniffDse3Upload", () => {
  it("returns null for a regular file", async () => {
    const file = new File([new Uint8Array(1024)], "plain.docx");
    await expect(sniffDse3Upload(file)).resolves.toBeNull();
  });

  it("returns null for an empty file", async () => {
    await expect(sniffDse3Upload(new File([], "empty.docx"))).resolves.toBeNull();
  });

  it("returns the parsed header for a DSE3 blob", async () => {
    const { encryptedBlob } = await encryptFile(
      new TextEncoder().encode("secret"),
      { fileName: "secret.docx" },
    );
    const file = new File([encryptedBlob], "uuid.docx");

    const header = await sniffDse3Upload(file);
    expect(header).not.toBeNull();
    expect(header!.encryptedName).toBeInstanceOf(Uint8Array);
    expect(header!.fileNonce).toBeInstanceOf(Uint8Array);
  });

  it("throws EncryptedReimportError for DSE3 magic with a truncated header", async () => {
    const { encryptedBlob } = await encryptFile(
      new TextEncoder().encode("secret"),
      { fileName: "secret.docx" },
    );
    const truncated = new File([encryptedBlob.slice(0, 10)], "broken.docx");

    await expect(sniffDse3Upload(truncated)).rejects.toBeInstanceOf(
      EncryptedReimportError,
    );
  });
});

describe("prepareEncryptedUpload — DSE3 double-encryption guard", () => {
  it("refuses to encrypt a blob that is already DSE3", async () => {
    const { encryptedBlob } = await encryptFile(
      new TextEncoder().encode("secret"),
      { fileName: "secret.docx" },
    );
    const file = new File([encryptedBlob], "uuid.docx");

    await expect(
      prepareEncryptedUpload({
        file,
        folderId: 1,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      }),
    ).rejects.toBeInstanceOf(EncryptedReimportError);
  });

  it("still passes a regular file through untouched when encryption is off", async () => {
    const file = new File([new Uint8Array(16)], "plain.docx");
    const prepared = await prepareEncryptedUpload({
      file,
      folderId: 1,
      roomType: RoomsType.PublicRoom,
      isPrivate: false,
    });
    expect(prepared.encrypted).toBe(false);
    expect(prepared.data).toBe(file);
  });
});
