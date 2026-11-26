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

import { privateLinkVisitorHandlers } from "@docspace/shared/__mocks__/handlers";
import {
  createLinkKey,
  generateLinkSecret,
} from "@docspace/shared/services/encryption/link-key";

import { expect, test } from "./fixtures";

const LINK_ID = "33333333-3333-4333-8333-333333333333";
const LINK_KEY = "signed-link-key";
const FOLDER_ID = 9910;

test.describe("No external links of private items in the SDK", () => {
  test("Address of a link opened in an embedding frame", async ({
    page,
    port,
    baseUrl,
    serverRequestInterceptor,
  }) => {
    const secret = generateLinkSecret();
    const { material } = await createLinkKey(secret, "correct horse battery");
    serverRequestInterceptor.use(
      ...privateLinkVisitorHandlers(port, {
        key: LINK_KEY,
        linkId: LINK_ID,
        entryId: FOLDER_ID,
        entryType: 1,
        passwordRequired: true,
        ...material,
        memberKeys: [],
        files: {},
      }),
    );
    // The proxy builds the address of the portal from what its own proxy sent.
    await page.setExtraHTTPHeaders({
      "x-forwarded-host": `localhost:${port}`,
      "x-forwarded-proto": "http",
    });

    await page.goto(
      `${baseUrl}/sdk/public-room?key=${LINK_KEY}&folder=${FOLDER_ID}#${secret}`,
    );

    // The page of the portal, with the part after # carried over, and not
    // the password form of an ordinary link.
    await expect(page).toHaveURL(
      `${baseUrl}/share/private?key=${LINK_KEY}&folder=${FOLDER_ID}#${secret}`,
    );
    expect(new URL(page.url()).pathname).not.toContain("public-room");
  });
});
