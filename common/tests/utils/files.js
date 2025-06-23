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

const path = require("path");
const fs = require("fs");

const BASE_DIR = process.env.BASE_DIR || path.resolve(__dirname, "../../../");

const moduleWorkspaces = [
  "packages/client",
  "packages/doceditor",
  "packages/login",
  "packages/shared",
  "packages/management",
  "public/locales", // common
];

const getWorkSpaces = () => {
  const workspaces = moduleWorkspaces.map((ws) => path.resolve(BASE_DIR, ws));

  return workspaces;
};

const getAllFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.flatMap((file) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    if (isDirectory) {
      if (
        filePath.includes("e2e") ||
        filePath.includes(".yarn") ||
        filePath.includes(".github") ||
        filePath.includes(".vscode") ||
        filePath.includes(".git") ||
        filePath.includes("__mocks__") ||
        filePath.includes("dist") ||
        filePath.includes("test") ||
        filePath.includes("tests") ||
        filePath.includes(".next") ||
        filePath.includes("campaigns") ||
        filePath.includes("storybook-static") ||
        filePath.includes("node_modules") ||
        filePath.includes(".meta")
      ) {
        return null;
      }

      return getAllFiles(filePath);
    } else {
      return filePath;
    }
  });
};

const convertPathToOS = (filePath) => {
  return path.sep == "/"
    ? filePath.replace("\\", "/")
    : filePath.replace("/", "\\");
};

module.exports = {
  BASE_DIR,
  moduleWorkspaces,
  getWorkSpaces,
  getAllFiles,
  convertPathToOS,
};
