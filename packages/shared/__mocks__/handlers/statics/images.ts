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

import path from "path";
import { http } from "msw";
import fs from "fs";

export const imagesHandler = () => {
  return http.get("*/**/**/_next/public/images/*", async ({ request }) => {
    try {
      // Parse the URL manually instead of using the URL constructor
      const requestUrl = request.url;
      const imagePath = requestUrl
        .split("/_next/public/images/")
        .at(-1)!
        .split("?")[0];

      const imageFilePath = path.join(
        __dirname,
        "../../../../../public/images/",
        imagePath,
      );
      const imageContent = fs.readFileSync(imageFilePath);

      // Determine content type based on file extension
      const ext = path.extname(imagePath).toLowerCase();
      let contentType: string = "image/jpeg";

      if (ext === ".svg") contentType = "image/svg+xml";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";

      return new Response(imageContent, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": imageContent.length.toString(),
        },
      });
    } catch (error) {
      console.error("Error reading image file:", error);
      return new Response("Error loading image", { status: 500 });
    }
  });
};

export const imagesHandlerClient = () => {
  return http.get("*/**/static/images/**", async ({ request }) => {
    try {
      const requestUrl = request.url;
      const imagePath = requestUrl
        .split("/static/images/")
        .at(-1)!
        .split("?")[0];

      const imageFilePath = path.join(
        __dirname,
        "../../../../../public/images/",
        imagePath,
      );
      const imageContent = fs.readFileSync(imageFilePath);

      // Determine content type based on file extension
      const ext = path.extname(imagePath).toLowerCase();
      let contentType: string = "image/jpeg";

      if (ext === ".svg") contentType = "image/svg+xml";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";

      return new Response(imageContent, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": imageContent.length.toString(),
        },
      });
    } catch (error) {
      console.error("Error reading image file:", error);
      return new Response("Error loading image", { status: 500 });
    }
  });
};
