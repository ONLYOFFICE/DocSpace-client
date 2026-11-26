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

import { ValidationStatus } from "../../../enums";
import {
  createLinkKey,
  deriveLinkProof,
  generateLinkSecret,
} from "../../encryption/link-key";
import {
  decryptVisitorFile,
  openVisitorLink,
  readLinkSecret,
  readVisitorFileName,
  type TVisitorLink,
} from "../private-link-visitor";

const openPrivateLink = vi.hoisted(() => vi.fn());
const getFilePublicKeys = vi.hoisted(() => vi.fn());
const downloadAndDecryptFile = vi.hoisted(() => vi.fn());

vi.mock("../../../api/privacy", () => ({ openPrivateLink, getFilePublicKeys }));
vi.mock("../encrypted-download", () => ({ downloadAndDecryptFile }));

const KEY = "signed-link-key";
const LINK_ID = "33333333-3333-4333-8333-333333333333";
const PASSWORD = "correct horse";

beforeEach(() => {
  openPrivateLink.mockReset();
  getFilePublicKeys.mockReset();
  downloadAndDecryptFile.mockReset();
});

describe("The secret of a link is encoded for an address", () => {
  it("reads the secret after #", () => {
    const secret = generateLinkSecret();

    expect(readLinkSecret(`#${secret}`)).toBe(secret);
  });

  it("Secret cut short", () => {
    expect(readLinkSecret(`#${generateLinkSecret().slice(0, 40)}`)).toBeNull();
    expect(readLinkSecret("")).toBeNull();
  });

  it("Foreign character in the secret", () => {
    expect(readLinkSecret(`#${generateLinkSecret().slice(0, 42)}*`)).toBeNull();
  });
});

describe("A visitor opens an external link without an account", () => {
  const make = async (password?: string) => {
    const secret = generateLinkSecret();
    const { keyPair, material } = await createLinkKey(secret, password);
    return { secret, keyPair, material };
  };

  it("sends the proof, never the secret or the password, and opens the sealed key", async () => {
    const { secret, keyPair, material } = await make(PASSWORD);
    openPrivateLink.mockResolvedValue({
      status: ValidationStatus.Ok,
      id: "9",
      linkId: LINK_ID,
      linkPrivateKeyEnc: material.linkPrivateKeyEnc,
    });

    const result = await openVisitorLink(KEY, secret, PASSWORD);

    expect(openPrivateLink).toHaveBeenCalledWith(
      KEY,
      await deriveLinkProof(secret, PASSWORD),
    );
    const sent = JSON.stringify(openPrivateLink.mock.calls);
    expect(sent).not.toContain(secret);
    expect(sent).not.toContain(PASSWORD);
    expect(result.state).toBe("open");
    if (result.state !== "open") return;
    expect(result.link.linkId).toBe(LINK_ID);
    expect(Array.from(result.link.identity.privateKey)).toEqual(
      Array.from(keyPair.privateKey),
    );
  });

  it("Wrong password", async () => {
    const { secret } = await make(PASSWORD);
    openPrivateLink.mockResolvedValue({
      status: ValidationStatus.InvalidPassword,
    });

    expect(await openVisitorLink(KEY, secret, "another")).toEqual({
      state: "wrong-proof",
    });
  });

  it("Revoked or expired link", async () => {
    const { secret } = await make();
    openPrivateLink.mockResolvedValueOnce({ status: ValidationStatus.Invalid });
    openPrivateLink.mockResolvedValueOnce({ status: ValidationStatus.Expired });

    expect((await openVisitorLink(KEY, secret)).state).toBe("invalid");
    expect((await openVisitorLink(KEY, secret)).state).toBe("expired");
  });

  it("Link for DocSpace users only opened without signing in", async () => {
    const { secret } = await make();
    openPrivateLink.mockResolvedValue({
      status: ValidationStatus.ExternalAccessDenied,
    });

    expect((await openVisitorLink(KEY, secret)).state).toBe("sign-in");
  });

  it("Repeated wrong proofs", async () => {
    const { secret } = await make();
    openPrivateLink.mockRejectedValue({ response: { status: 403 } });

    expect((await openVisitorLink(KEY, secret)).state).toBe("blocked");
  });

  it("does not open a sealed key made for another link", async () => {
    const { secret } = await make();
    const other = await make();
    openPrivateLink.mockResolvedValue({
      status: ValidationStatus.Ok,
      id: "9",
      linkPrivateKeyEnc: other.material.linkPrivateKeyEnc,
    });

    expect((await openVisitorLink(KEY, secret)).state).toBe("wrong-proof");
  });
});

describe("a file reached through a link", () => {
  const link = {
    key: KEY,
    linkId: LINK_ID,
    identity: { publicKey: new Uint8Array(32), privateKey: new Uint8Array(32) },
  } as TVisitorLink;
  const file = { id: 21, title: "stored.bin", viewUrl: "/view/21" };

  it("File the link has no key for", async () => {
    getFilePublicKeys.mockResolvedValue([
      { id: "key-1", userId: "u-1", publicKey: "pk-1" },
      { id: LINK_ID, userId: LINK_ID, publicKey: "pk-l", isLink: true, fileKeyEnc: null },
    ]);

    expect(await readVisitorFileName(link, file)).toBe("not-ready");
    expect(await decryptVisitorFile(link, file)).toBe("not-ready");
    expect(downloadAndDecryptFile).not.toHaveBeenCalled();
  });

  it("Link to a file: the file is decrypted with the key of the link", async () => {
    getFilePublicKeys.mockResolvedValue([
      { id: "key-1", userId: "u-1", publicKey: "pk-1" },
      { id: LINK_ID, userId: LINK_ID, publicKey: "pk-l", isLink: true, fileKeyEnc: "wrap" },
    ]);
    downloadAndDecryptFile.mockResolvedValue({ success: true });

    await decryptVisitorFile(link, file);

    expect(downloadAndDecryptFile).toHaveBeenCalledWith(
      expect.objectContaining({
        downloadUrl: "/view/21",
        fileId: 21,
        userId: LINK_ID,
        identity: link.identity,
        fileKeys: [
          { userId: LINK_ID, publicKeyId: LINK_ID, privateKeyEnc: "wrap" },
        ],
        roomMemberKeys: [
          { userId: "u-1", publicKey: "pk-1", publicKeyId: "key-1" },
        ],
      }),
    );
  });
});
