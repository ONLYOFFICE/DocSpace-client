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

const path = require("path");

// Set custom environment variables here before requiring server.js
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.PORT = process.env.PORT || "5011";

process.env.NEXT_APP_LOCALES_DIR ||= path.join(
  __dirname,
  "packages/login/public/locales",
);
process.env.NEXT_SHARED_LOCALES_DIR ||= path.join(__dirname, "public/locales");

// You can pass command line arguments to the server.js process
// by setting them before requiring the file
const argv = (key) => {
  if (process.argv.includes(`--${key}`)) return true;

  return (
    process.argv.find((arg) => arg.startsWith(`--${key}=`))?.split("=")[1] ||
    null
  );
};

// Set port from command line arguments if provided
if (argv("app.port")) {
  process.env.PORT = argv("app.port");
}

// Set hostname from command line arguments if provided
if (argv("app.hostname")) {
  process.env.HOSTNAME = argv("app.hostname");
}

console.log(
  `Starting server with environment: NODE_ENV=${process.env.NODE_ENV}, PORT=${process.env.PORT}` +
    (process.env.HOSTNAME ? `, HOSTNAME=${process.env.HOSTNAME}` : ""),
);

// Now require server.js which will use the environment variables we just set
require("./packages/login/server.js");
