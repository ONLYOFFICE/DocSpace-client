// (c) Copyright Ascensio System SIA 2010-2024
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

const docSpacePath = "../../../../";

const imagesPattern = /\.(gif|jpe|jpeg|tiff?|png|webp|bmp|svg)$/i;
const filesPattern = /\.(js|jsx|ts|tsx|html|css|scss|saas|json)$/i;
const excludeFilesPattern = /\.(stories|test)$/i;

const excludePath = [
  "C:",
  "GitHub",
  "DocSpace",
  "public",
  "packages",
  "client",
  "common",
  "components",
];

const modules = ["public", "client", "components", "common", "login", "editor"];
// const modules = ["public"];

const publicPath = path.join(__dirname, docSpacePath, "/public");
const clientPath = path.join(__dirname, docSpacePath, "/packages/client");
const componentsPath = path.join(
  __dirname,
  docSpacePath,
  "/packages/components"
);
const commonPath = path.join(__dirname, docSpacePath, "/packages/common");
const loginPath = path.join(__dirname, docSpacePath, "/packages/login");
const editorPath = path.join(__dirname, docSpacePath, "/packages/editor");

const paths = {
  public: publicPath,
  client: clientPath,
  components: componentsPath,
  common: commonPath,
  login: loginPath,
  editor: editorPath,
};

const imageHelperPath = path.join(commonPath, "/utils/image-helpers.js");

const wrongImportImages = [
  `"/static/images`,
  `"/images`,
  `"static/images`,
  `"images/`,
];

module.exports = {
  imagesPattern,
  filesPattern,
  excludeFilesPattern,
  modules,
  paths,
  imageHelperPath,
  excludePath,
  wrongImportImages,
};
