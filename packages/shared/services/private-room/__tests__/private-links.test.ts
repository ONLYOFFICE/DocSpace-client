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


import { beforeEach, describe, expect, it, vi } from "vitest";

import { FolderType, RoomsType, ShareAccessRights } from "../../../enums";
import type { TFile, TFileLink, TFolder } from "../../../api/files/types";
import type { TRoom } from "../../../api/rooms/types";
import {
  deriveLinkProof,
  isLinkSecret,
  openLinkKey,
} from "../../encryption/link-key";
import { generateIdentityKeyPair } from "../../encryption/identity";
import { arrayBufferToBase64 } from "../../encryption/utils";
import {
  canManagePrivateLinks,
  canManagePrivateRoomLinks,
  canReadPrivateLinkAddress,
  createPrivateItemLink,
  getPrivateLinkAddress,
  readPrivateLinkAddress,
  editPrivateItemLink,
  getPrivateLinkNeed,
  revokePrivateItemLink,
} from "../private-links";

const setPrivateItemLink = vi.hoisted(() => vi.fn());
const getEncryptionKeys = vi.hoisted(() => vi.fn());
const requireUnlock = vi.hoisted(() => vi.fn());
const wrapFilesForLink = vi.hoisted(() => vi.fn());

vi.mock("../../../api/privacy", () => ({
  setPrivateItemLink,
  getEncryptionKeys,
}));
vi.mock("../../encryption/secret-storage", () => ({ requireUnlock }));
vi.mock("../room-encryption", () => ({ wrapFilesForLink }));

const file = { id: 9, fileExst: ".docx", folderId: 14 } as unknown as TFile;
const folder = { id: 18, isFolder: true, parentId: 14 } as unknown as TFolder;
const SHORT = "https://portal.example/s/abc";

const stored = (id = "link-1") =>
  ({
    access: ShareAccessRights.ReadOnly,
    sharedTo: {
      id,
      shareLink: SHORT,
      title: "Shared link",
      primary: true,
      internal: false,
      expirationDate: "2030-01-01T00:00:00.000Z",
    },
  }) as unknown as TFileLink;

beforeEach(() => {
  setPrivateItemLink.mockReset().mockResolvedValue(stored());
  getEncryptionKeys.mockReset().mockResolvedValue([]);
  requireUnlock.mockReset().mockResolvedValue({});
  wrapFilesForLink.mockReset().mockResolvedValue({ missingFileIds: [] });
});

describe("canManagePrivateLinks", () => {
  const room = (over: object) =>
    ({
      private: true,
      security: { EditAccess: true },
      rootFolderType: FolderType.Rooms,
      ...over,
    }) as unknown as TRoom;

  it("Member who manages links", () => {
    expect(canManagePrivateLinks(room({}))).toBe(true);
  });

  it("Member who may not change the access", () => {
    expect(
      canManagePrivateLinks(room({ security: { EditAccess: false } })),
    ).toBe(false);
  });

  it("Room archived", () => {
    expect(
      canManagePrivateLinks(room({ rootFolderType: FolderType.Archive })),
    ).toBe(false);
  });

  it("is false for a room that is not private and for no room", () => {
    expect(canManagePrivateLinks(room({ private: false }))).toBe(false);
    expect(canManagePrivateLinks(null)).toBe(false);
  });
});

describe("canManagePrivateRoomLinks", () => {
  const room = (roomType: RoomsType) =>
    ({
      private: true,
      security: { EditAccess: true },
      rootFolderType: FolderType.Rooms,
      roomType,
    }) as unknown as TRoom;

  it("Members view", () => {
    expect(canManagePrivateRoomLinks(room(RoomsType.CustomRoom))).toBe(true);
  });

  it("Room of a type without room links", () => {
    expect(canManagePrivateRoomLinks(room(RoomsType.EditingRoom))).toBe(false);
    expect(canManagePrivateRoomLinks(room(RoomsType.VirtualDataRoom))).toBe(
      false,
    );
  });
});

describe("getPrivateLinkNeed", () => {
  it("Link to a folder or a room without a password", () => {
    expect(getPrivateLinkNeed(folder, { expirationDate: "2030-01-01" })).toBe(
      "password",
    );
  });

  it("End date cleared", () => {
    expect(getPrivateLinkNeed(file, { expirationDate: null })).toBe("end-date");
  });

  it("needs nothing with a password, or for one file with an end date", () => {
    expect(getPrivateLinkNeed(folder, { password: "p" })).toBeNull();
    expect(getPrivateLinkNeed(file, { expirationDate: "2030-01-01" })).toBe(
      null,
    );
  });
});

describe("createPrivateItemLink", () => {
  it("Link to a file to view without a password", async () => {
    const before = Date.now();
    const made = await createPrivateItemLink(file, "u-1", { primary: true });

    const [target, request] = setPrivateItemLink.mock.calls[0];
    expect(target).toEqual({ fileId: 9 });
    expect(request).toMatchObject({
      access: ShareAccessRights.ReadOnly,
      passwordRequired: false,
      primary: true,
    });
    expect(request).not.toHaveProperty("password");

    const days =
      (new Date(request.expirationDate).getTime() - before) / 86400000;
    expect(days).toBeGreaterThanOrEqual(7);
    expect(days).toBeLessThan(7.01);

    // The address carries the secret after `#`, and the secret opens what
    // the server was sent.
    // The address is kept for the page, and dropped with the link.
    expect(getPrivateLinkAddress("link-1")).toBe(made!.address);
    const [address, secret] = made!.address.split("#");
    expect(address).toBe(SHORT);
    expect(isLinkSecret(secret)).toBe(true);
    await expect(openLinkKey(request, secret)).resolves.toBeDefined();
    const proof = Uint8Array.from(atob(await deriveLinkProof(secret)), (c) =>
      c.charCodeAt(0),
    );
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", proof));
    expect(request.linkProofHash).toBe(btoa(String.fromCharCode(...hash)));
  });

  it("Link to a file created: its key is wrapped for the link", async () => {
    wrapFilesForLink.mockResolvedValue({ missingFileIds: [9] });

    const made = await createPrivateItemLink(file, "u-1");

    const request = setPrivateItemLink.mock.calls[0][1];
    expect(wrapFilesForLink).toHaveBeenCalledWith(
      { id: 9, isFile: true },
      { id: "link-1", publicKey: request.linkPublicKey },
      { currentUserId: "u-1", identity: {} },
    );
    expect(made!.missingFileIds).toEqual([9]);
  });

  it("Link to a folder created: the files under it are wrapped for the link", async () => {
    await createPrivateItemLink(folder, "u-1", { password: "p" });

    expect(wrapFilesForLink.mock.calls[0][0]).toEqual({
      id: 18,
      isFile: false,
    });
  });

  it("Link to a folder or a room without a password", async () => {
    await expect(createPrivateItemLink(folder, "u-1")).rejects.toThrow(
      "password",
    );
    expect(setPrivateItemLink).not.toHaveBeenCalled();
  });

  it("End date cleared", async () => {
    await expect(
      createPrivateItemLink(file, "u-1", { expirationDate: null }),
    ).rejects.toThrow("end-date");
    expect(setPrivateItemLink).not.toHaveBeenCalled();
  });

  it("sends a folder link with a password as one that asks for it, and never the password", async () => {
    await createPrivateItemLink(folder, "u-1", { password: "Secret-pass" });

    const [target, request] = setPrivateItemLink.mock.calls[0];
    expect(target).toEqual({ folderId: 18 });
    expect(request.passwordRequired).toBe(true);
    expect(JSON.stringify(request)).not.toContain("Secret-pass");
  });

  it("Creator's key locked", async () => {
    requireUnlock.mockResolvedValue(null);

    await expect(createPrivateItemLink(file, "u-1")).resolves.toBeNull();
    expect(requireUnlock).toHaveBeenCalledWith("u-1");
    expect(setPrivateItemLink).not.toHaveBeenCalled();
  });
});

describe("links that exist", () => {
  it("changes the title, the end date and the audience without key material", async () => {
    await editPrivateItemLink(file, stored());

    expect(setPrivateItemLink).toHaveBeenCalledWith(
      { fileId: 9 },
      {
        linkId: "link-1",
        access: ShareAccessRights.ReadOnly,
        title: "Shared link",
        expirationDate: "2030-01-01T00:00:00.000Z",
        internal: false,
        primary: true,
      },
    );
  });

  it("Link revoked", async () => {
    await createPrivateItemLink(file, "u-1");
    setPrivateItemLink.mockClear();
    expect(getPrivateLinkAddress("link-1")).toBeDefined();
    await revokePrivateItemLink(file, stored("link-1"));
    expect(getPrivateLinkAddress("link-1")).toBeUndefined();

    await revokePrivateItemLink(folder, stored("link-2"));

    expect(setPrivateItemLink).toHaveBeenLastCalledWith(
      { folderId: 18 },
      { linkId: "link-2", access: ShareAccessRights.None },
    );
  });
});

describe("The secret of a link is wrapped for those who manage links", () => {
  const USER_ID = "11111111-1111-4111-8111-111111111111";
  const LINK_ID = "33333333-3333-4333-8333-333333333333";

  /** Makes a link as its creator and answers what the server then holds. */
  const make = async () => {
    const identity = await generateIdentityKeyPair();
    const ownKey = {
      id: "key-1",
      userId: USER_ID,
      publicKey: arrayBufferToBase64(identity.publicKey),
    };
    requireUnlock.mockResolvedValue(identity);
    getEncryptionKeys.mockResolvedValue([ownKey]);
    setPrivateItemLink.mockResolvedValue(stored(LINK_ID));

    const made = await createPrivateItemLink(folder, USER_ID, {
      password: "p",
    });
    const [created, wrapped] = setPrivateItemLink.mock.calls.map(
      ([, request]) => request,
    );
    const link = {
      ...stored(LINK_ID),
      sharedTo: {
        ...stored(LINK_ID).sharedTo,
        linkPublicKey: created.linkPublicKey,
        linkSecretWrap: wrapped.linkSecretWraps[0],
      },
    } as TFileLink;
    return { identity, made: made!, created, wrapped, link };
  };

  it("stores a wrap for the creator, with the settings of the link sent again", async () => {
    const { wrapped } = await make();

    expect(wrapped).toMatchObject({
      linkId: LINK_ID,
      title: "Shared link",
      expirationDate: "2030-01-01T00:00:00.000Z",
      primary: true,
    });
    expect(wrapped.linkSecretWraps).toEqual([
      { userId: USER_ID, publicKeyId: "key-1", wrap: expect.any(String) },
    ]);
    expect(wrapped).not.toHaveProperty("linkPrivateKeyEnc");
  });

  it("Manager copies the address: the wrap gives the address the creator got", async () => {
    const { made, link } = await make();
    // Another page: nothing is remembered of the link.
    await revokePrivateItemLink(folder, link);
    expect(getPrivateLinkAddress(LINK_ID)).toBeUndefined();

    expect(canReadPrivateLinkAddress(link)).toBe(true);
    expect(await readPrivateLinkAddress(link, USER_ID)).toBe(made.address);
  });

  it("Key locked", async () => {
    const { link } = await make();
    await revokePrivateItemLink(folder, link);
    requireUnlock.mockResolvedValue(null);

    expect(await readPrivateLinkAddress(link, USER_ID)).toBeNull();
  });

  it("Member who does not manage links", async () => {
    const bare = stored(LINK_ID);

    expect(canReadPrivateLinkAddress(bare)).toBe(false);
    expect(await readPrivateLinkAddress(bare, USER_ID)).toBeNull();
    expect(requireUnlock).not.toHaveBeenCalled();
  });

  it("gives no address for a wrap made for a key the user replaced", async () => {
    const { link } = await make();
    await revokePrivateItemLink(folder, link);
    getEncryptionKeys.mockResolvedValue([]);

    expect(await readPrivateLinkAddress(link, USER_ID)).toBeNull();
  });

  it("keeps the link when the wrap cannot be stored", async () => {
    const identity = await generateIdentityKeyPair();
    requireUnlock.mockResolvedValue(identity);
    getEncryptionKeys.mockResolvedValue([
      {
        id: "key-1",
        userId: USER_ID,
        publicKey: arrayBufferToBase64(identity.publicKey),
      },
    ]);
    setPrivateItemLink
      .mockResolvedValueOnce(stored(LINK_ID))
      .mockRejectedValueOnce(new Error("403"));

    const made = await createPrivateItemLink(folder, USER_ID, {
      password: "p",
    });

    expect(made!.link.sharedTo.id).toBe(LINK_ID);
    expect(getPrivateLinkAddress(LINK_ID)).toBe(made!.address);
  });
});

