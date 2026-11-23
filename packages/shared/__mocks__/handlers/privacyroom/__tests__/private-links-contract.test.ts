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


import { setupServer } from "msw/node";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  createLinkKey,
  generateLinkSecret,
  sealLinkKey,
} from "../../../../services/encryption/link-key";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import {
  privateLinksHandlers,
  type PrivateLinksHandlerHandle,
} from "../privateLinks";

const PORT = "3233";
const ROOM_ID = 9780;
const FOLDER_ID = 9781;
const FILE_ID = 9782;
const USER_ID = "11111111-1111-4111-8111-111111111111";
const NEXT_WEEK = "2026-12-01T00:00:00.000Z";

const handle: { current: PrivateLinksHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...privateLinksHandlers(PORT, {
    roomId: ROOM_ID,
    folderIds: [FOLDER_ID],
    fileIds: [FILE_ID],
    takenIds: [USER_ID],
    handle,
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
beforeEach(() => handle.current!.reset());

const url = (path: string) =>
  `${BASE_URL}:${PORT}/${API_PREFIX}/files/${path}/links`;
const ROOM = `rooms/${ROOM_ID}`;
const FOLDER = `folder/${FOLDER_ID}`;
const FILE = `file/${FILE_ID}`;

const put = async (path: string, body: Record<string, unknown>) => {
  const res = await fetch(url(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access: 2, ...body }),
  });
  return { status: res.status, body: await res.json() };
};

const list = async (path: string) =>
  (await (await fetch(url(path))).json()).response as Array<{
    sharedTo: Record<string, unknown>;
  }>;

const material = async () =>
  (await createLinkKey(generateLinkSecret())).material;

describe("privateLinks mock (mirrors FileSharingAceHelper.ValidatePrivateLinksAsync) - No external or invitation links on a private room", () => {
  it("External link requested", async () => {
    const { status } = await put(ROOM, { linkType: 1, title: "Link" });

    expect(status).toBe(403);
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it("Invitation link requested", async () => {
    const { status } = await put(ROOM, { linkType: 0, ...(await material()) });

    expect(status).toBe(403);
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it("External link with key material requested", async () => {
    const keys = await material();

    const { status, body } = await put(ROOM, { linkType: 1, ...keys });

    expect(status).toBe(200);
    expect(body.response.access).toBe(2);
    expect(body.response.sharedTo).toMatchObject({
      passwordRequired: true,
      linkPublicKey: keys.linkPublicKey,
    });
    expect(body.response.sharedTo.shareLink).not.toContain("#");
  });

  it("Link read", async () => {
    await put(FOLDER, await material());

    const [link] = await list(FOLDER);

    expect(link.sharedTo).toHaveProperty("linkPublicKey");
    expect(link.sharedTo).toHaveProperty("passwordRequired", true);
    expect(link.sharedTo).not.toHaveProperty("linkPrivateKeyEnc");
    expect(link.sharedTo).not.toHaveProperty("linkProofHash");
  });

  it("Link revoked", async () => {
    const created = await put(ROOM, { linkType: 1, ...(await material()) });
    const linkId = created.body.response.sharedTo.id;

    const { status } = await put(ROOM, { linkType: 1, linkId, access: 0 });

    expect(status).toBe(200);
    expect(await list(ROOM)).toEqual([]);
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it.each([
    ["the access to edit", { access: 10 }],
    ["the access to comment", { access: 6 }],
    ["the download ban", { denyDownload: true }],
  ])("Another access or a download ban requested: %s", async (_, extra) => {
    const { status } = await put(FILE, { ...(await material()), ...extra });

    expect(status).toBe(403);
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it.each([
    ["a public key of 31 bytes", { linkPublicKey: btoa("a".repeat(31)) }],
    ["a proof hash that is not base64", { linkProofHash: "*".repeat(44) }],
    ["an empty sealed key", { linkPrivateKeyEnc: "" }],
    ["a sealed key of 4097 characters", { linkPrivateKeyEnc: "a".repeat(4097) }],
  ])("Malformed key material: %s", async (_, wrong) => {
    const { status } = await put(FILE, { ...(await material()), ...wrong });

    expect(status).toBe(400);
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it("Password sent", async () => {
    const { status, body } = await put(FILE, {
      ...(await material()),
      password: "Abc12345",
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain("password");
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it("Id of a new link held by somebody else", async () => {
    const { status } = await put(FILE, {
      ...(await material()),
      linkId: USER_ID,
    });

    expect(status).toBe(400);
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it("Link of a file or a folder set by a room manager", async () => {
    expect((await put(FILE, await material())).status).toBe(200);
    expect((await put(FOLDER, await material())).status).toBe(200);

    handle.current!.setCanManage(false);

    expect((await put(FILE, await material())).status).toBe(403);
    expect(await list(FILE)).toEqual([]);
    expect(handle.current!.getLinks()).toHaveLength(2);
  });
});

describe("privateLinks mock - A link of a private item without a password is limited", () => {
  it("Link to a file to view with an end date", async () => {
    const { status, body } = await put(FILE, {
      ...(await material()),
      passwordRequired: false,
      expirationDate: NEXT_WEEK,
    });

    expect(status).toBe(200);
    expect(body.response.sharedTo.passwordRequired).toBe(false);
  });

  it.each([
    ["a folder", FOLDER, { expirationDate: NEXT_WEEK }],
    ["a room", ROOM, { linkType: 1, expirationDate: NEXT_WEEK }],
    ["a file without an end date", FILE, {}],
  ])("Link without a password outside the rule: %s", async (_, path, extra) => {
    const { status } = await put(path, {
      ...(await material()),
      passwordRequired: false,
      ...extra,
    });

    expect(status).toBe(403);
    expect(handle.current!.getLinks()).toEqual([]);
  });

  it("Password removed from a link", async () => {
    const created = await put(FOLDER, await material());
    const linkId = created.body.response.sharedTo.id;

    const { status } = await put(FOLDER, { linkId, passwordRequired: false });

    expect(status).toBe(403);
    expect(handle.current!.getLinks()[0].passwordRequired).toBe(true);
  });

  it("End date removed from a link without a password", async () => {
    const created = await put(FILE, {
      ...(await material()),
      passwordRequired: false,
      expirationDate: NEXT_WEEK,
    });
    const linkId = created.body.response.sharedTo.id;

    const { status } = await put(FILE, { linkId });

    expect(status).toBe(403);
    expect(handle.current!.getLinks()[0].expirationDate).toBe(NEXT_WEEK);
  });
});

describe("privateLinks mock - Password of a link of a private item is replaced with new key material", () => {
  it("Password replaced", async () => {
    const secret = generateLinkSecret();
    const { keyPair, material: first } = await createLinkKey(secret, "one");
    const created = await put(FOLDER, first);
    const linkId = created.body.response.sharedTo.id;

    const second = await sealLinkKey(keyPair, secret, "two");
    const { status } = await put(FOLDER, { linkId, ...second });

    expect(status).toBe(200);
    expect(handle.current!.getLinks()[0]).toMatchObject({
      id: linkId,
      linkPublicKey: first.linkPublicKey,
      linkProofHash: second.linkProofHash,
    });
  });

  it("Public key changed in the same request", async () => {
    const created = await put(FOLDER, await material());
    const linkId = created.body.response.sharedTo.id;
    const before = handle.current!.getLinks()[0];

    const { status } = await put(FOLDER, { linkId, ...(await material()) });

    expect(status).toBe(400);
    expect(handle.current!.getLinks()[0]).toEqual(before);
  });
});
