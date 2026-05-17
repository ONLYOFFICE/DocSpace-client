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

import next from "next";
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import type { UrlWithParsedQuery } from "url";

/**
 * Creates a Next.js test server for e2e tests
 * @param dirPath - Relative path to the Next.js app directory
 * @returns A function that returns the server port and handles server cleanup
 */
export const createNextTestServer = async (
  dirPath: string,
): Promise<{ port: string; server: Server }> => {
  const app = next({
    dev: false,
    dir: dirPath,
  });
  await app.prepare();

  const handle = app.getRequestHandler();

  const server: Server = await new Promise((resolve) => {
    const newServer = createServer((req, res) => {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
      const query: Record<string, string | string[]> = {};
      url.searchParams.forEach((value, key) => {
        const existing = query[key];
        if (existing) {
          query[key] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value];
        } else {
          query[key] = value;
        }
      });
      handle(req, res, { pathname: url.pathname, query } as UrlWithParsedQuery);
    });

    newServer.listen(0, () => {
      resolve(newServer);
    });
  });

  const port = String((server.address() as AddressInfo).port);

  return { port, server };
};
