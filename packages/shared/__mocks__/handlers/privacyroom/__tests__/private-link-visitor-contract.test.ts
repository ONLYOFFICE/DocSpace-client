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
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createLinkKey,
  deriveLinkProof,
  generateLinkSecret,
  openLinkKey,
} from "../../../../services/encryption/link-key";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import {
  privateLinkVisitorHandlers,
  type PrivateLinkVisitorHandle,
} from "../privateLinkVisitor";

const PORT = "3234";
const KEY = "signed-link-key";
const LINK_ID = "33333333-3333-4333-8333-333333333333";
const COVERED = 21;
const WITHOUT_WRAP = 22;
const OUTSIDE = 23;
const PASSWORD = "correct horse";

const handle: { current: PrivateLinkVisitorHandle | null } = { current: null };
const secret = generateLinkSecret();
const server = setupServer();
let material: Awaited<ReturnType<typeof createLinkKey>>["material"];

beforeAll(async () => {
  ({ material } = await createLinkKey(secret, PASSWORD));
  server.use(
    ...privateLinkVisitorHandlers(PORT, {
      key: KEY,
      linkId: LINK_ID,
      entryId: COVERED,
      entryType: 2,
      passwordRequired: true,
      ...material,
      memberKeys: [{ id: "key-1", userId: "u-1", publicKey: "pk-1" }],
      files: { [COVERED]: "wrap-for-the-link", [WITHOUT_WRAP]: null },
      wrongProofsLimit: 3,
      handle,
    }),
  );
  server.listen({ onUnhandledRequest: "error" });
});
afterAll(() => server.close());
beforeEach(() => handle.current!.reset());

const base = `${BASE_URL}:${PORT}/${API_PREFIX}/files`;
const read = async () =>
  (await (await fetch(`${base}/share/${KEY}`)).json()).response;
const open = async (proof?: string, password?: string) => {
  const res = await fetch(`${base}/share/${KEY}/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proof, password }),
  });
  return { status: res.status, body: (await res.json()).response };
};
const keys = async (fileId: number, token: string | null = KEY) => {
  const res = await fetch(`${base}/file/${fileId}/publickeys`, {
    headers: token ? { "Request-Token": token } : {},
  });
  return { status: res.status, body: (await res.json()).response };
};

describe("privateLinkVisitor mock - A link is served only against a proof of its secret", () => {
  it("Valid proof", async () => {
    const { body } = await open(await deriveLinkProof(secret, PASSWORD));

    expect(body.status).toBe(0);
    // The sealed key opens with the secret and the password of the visitor.
    await expect(
      openLinkKey(
        { ...material, linkPrivateKeyEnc: body.linkPrivateKeyEnc },
        secret,
        PASSWORD,
      ),
    ).resolves.toBeDefined();
  });

  it("Request of an open session", async () => {
    await open(await deriveLinkProof(secret, PASSWORD));

    const status = await read();
    const again = await open();

    expect(status.status).toBe(0);
    expect(status).not.toHaveProperty("linkPrivateKeyEnc");
    expect(again.body.status).toBe(0);
    expect(again.body).not.toHaveProperty("linkPrivateKeyEnc");
  });

  it("Wrong or missing proof", async () => {
    const missing = await read();
    const wrong = await open(await deriveLinkProof(secret, "another"));
    const passwordOnly = await open(undefined, PASSWORD);

    expect(missing).toMatchObject({
      status: 3,
      id: String(COVERED),
      type: 2,
      isPrivate: true,
      passwordRequired: true,
    });
    expect(wrong.body.status).toBe(4);
    expect(wrong.body).not.toHaveProperty("linkPrivateKeyEnc");
    expect(passwordOnly.body.status).toBe(3);
    expect((await keys(COVERED)).status).toBe(403);
  });

  it("Repeated wrong proofs", async () => {
    const wrong = await deriveLinkProof(secret, "another");
    for (let i = 0; i < 3; i += 1) await open(wrong);

    const { status } = await open(await deriveLinkProof(secret, PASSWORD));

    expect(status).toBe(403);
    expect(handle.current!.isOpen()).toBe(false);
  });

  it("Visitor of a link of an archived room, and a link past its end date", async () => {
    const proof = await deriveLinkProof(secret, PASSWORD);
    handle.current!.setClosed(true);
    expect((await open(proof)).body.status).toBe(1);

    handle.current!.setClosed(false);
    handle.current!.setExpired(true);
    expect((await read()).status).toBe(2);
  });
});

describe("privateLinkVisitor mock - A visitor of a link gets the content as stored", () => {
  beforeEach(async () => {
    await open(await deriveLinkProof(secret, PASSWORD));
  });

  it("File requested through a link with the access to view", async () => {
    const { status, body } = await keys(COVERED);

    expect(status).toBe(200);
    expect(body).toEqual([
      { id: "key-1", userId: "u-1", publicKey: "pk-1" },
      {
        id: LINK_ID,
        userId: LINK_ID,
        publicKey: material.linkPublicKey,
        isLink: true,
        fileKeyEnc: "wrap-for-the-link",
      },
    ]);
  });

  it("File no member has wrapped for the link yet", async () => {
    const { body } = await keys(WITHOUT_WRAP);

    expect(body[body.length - 1].fileKeyEnc).toBeNull();
  });

  it("Item outside the link", async () => {
    expect((await keys(OUTSIDE)).status).toBe(403);
  });

  it("Request without the token of the link", async () => {
    expect((await keys(COVERED, null)).status).toBe(403);
  });
});
