// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

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
  const hostname = "0.0.0.0";

  // when using middleware `hostname` and `port` must be provided below
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);

        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        logger.error(`url: ${req.url}, error: ${err} Error occurred handling`);
        res.statusCode = 500;
        res.end("internal server error");
      }
    })
      .once("error", (err) => {
        logger.error(`url: ${req.url}, error: ${err} Error occurred handling`);
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
