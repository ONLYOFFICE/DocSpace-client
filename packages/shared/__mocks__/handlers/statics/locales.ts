/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import path from "path";
import { http } from "msw";
import fs from "fs";

export const localesHandler = () => {
  return http.get("*/**/locales/**", async ({ request }) => {
    try {
      const url = request.url;

      // Skip campaign locales - they are handled by campaignsHandler
      if (url.includes("/campaigns/locales/")) {
        return;
      }

      const hasStatic = url.includes("static");
      const local = url.split("/locales/").at(-1)!.split("?")[0];

      const localePath = hasStatic
        ? `../../../../../public/locales/${local}`
        : `../../../../client/public/locales/${local}`;
      const localeFullPath = path.join(__dirname, localePath);

      // Check if file exists, fallback to en if not
      if (!fs.existsSync(localeFullPath)) {
        const enLocal = local.replace(/^[a-z]{2}(-[A-Z]{2})?\//, "en/");
        const enLocalePath = hasStatic
          ? `../../../../../public/locales/${enLocal}`
          : `../../../../client/public/locales/${enLocal}`;
        const enLocaleFullPath = path.join(__dirname, enLocalePath);

        if (fs.existsSync(enLocaleFullPath)) {
          const localeContent = fs.readFileSync(enLocaleFullPath, "utf-8");
          return new Response(localeContent, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        // Return empty object if no locale found
        return new Response("{}", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const localeContent = fs.readFileSync(localeFullPath, "utf-8");

      return new Response(localeContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error reading locale file:", error);
      // Return empty object instead of error to prevent JSON parse errors
      return new Response("{}", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  });
};
