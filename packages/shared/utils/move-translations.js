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

/* eslint-disable func-names */
/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-var-requires */

const { readdir, readFile, writeFile } = require("fs/promises");
const path = require("path");

const commonDir = "../../../public/locales";
const clientDir = "../../client/public/locales";

const keys = [];

const run = () => {
  readdir(path.join(__dirname, commonDir), {
    withFileTypes: true,
  }).then((res) => {
    res.forEach(async (value) => {
      const lng = value.name;

      const commonFilePath = path.join(
        __dirname,
        commonDir,
        lng,
        "Common.json",
      );

      const filePath = path.join(__dirname, clientDir, lng, "YOUR_FILE.json");

      const commonFile = JSON.parse(await readFile(commonFilePath, "utf8"));
      const file = JSON.parse(await readFile(filePath, "utf8"));

      keys.forEach((key) => {
        if (!file[key]) return;
        commonFile[key] = file[key];
        delete file[key];
      });

      await writeFile(commonFilePath, JSON.stringify(commonFile));
      await writeFile(filePath, JSON.stringify(file));
    });
  });
};

run();
