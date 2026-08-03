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

const { createServer } = require("http");
const next = require("next");
const config = require("./config/config.json");

import("./logger.mjs").then(({ logger }) => {
  const dev = process.env.NODE_ENV === "development";

  const argv = (key) => {
    if (process.argv.includes(`--${key}`)) return true;

    return (
      process.argv.find((arg) => arg.startsWith(`--${key}=`))?.split("=")[1] ||
      null
    );
  };

  const port = (argv("app.port") || process.env.PORT) ?? 5011;
  const hostname = (argv("app.hostname") || config.HOSTNAME) ?? "0.0.0.0";

  // when using middleware `hostname` and `port` must be provided below
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        logger.error(`url: ${req.url}, error: ${err} Error occurred handling`);
        res.statusCode = 500;
        res.end("internal server error");
      }
    })
      .once("error", (err) => {
        logger.error(`error: ${err} Server error`);
        process.exit(1);
      })
      .listen(port, () => {
        logger.info(`Server is listening on port ${port}`);
      });

    process.on("unhandledRejection", (reason, process) => {
      logger.error(
        `process: ${process}, reason: ${reason} Unhandled rejection at`,
      );
    });

    process.on("uncaughtException", (error) => {
      logger.error(
        `error: ${error}, stack: ${error.stack} Unhandled exception`,
      );
    });

    process.on("SIGINT", function () {
      console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
      process.exit(0);
    });
  });
});
