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

module.exports = class Endpoints {
  static confirm = {
    url: ["http://localhost:8092/api/2.0/authentication/confirm.json"],
    method: "POST",
    baseDir: "user",
  };

  static settings = {
    url: ["http://localhost:8092/api/2.0/settings.json"],
    method: "GET",
    baseDir: "settings",
  };

  static timeandlanguage = {
    url: ["http://localhost:8092/api/2.0/settings/timeandlanguage.json"],
    method: "PUT",
    baseDir: "settings",
  };

  static restore = {
    url: [
      "http://localhost:8092/api/2.0/settings/greetingsettings/restore.json",
    ],
    method: "POST",
    baseDir: "settings",
  };

  static greetingsettings = {
    url: ["http://localhost:8092/api/2.0/settings/greetingsettings.json"],
    method: "POST",
    baseDir: "settings",
  };

  static portalRenaming = {
    url: ["http://localhost:8092/api/2.0/portal/portalrename.json"],
    method: "PUT",
    baseDir: "settings",
  };

  static common = {
    url: ["http://localhost:8092/api/2.0/settings/customschemas/Common.json"],
    method: "GET",
    baseDir: "settings",
  };

  static build = {
    url: ["http://localhost:8092/api/2.0/settings/version/build.json"],
    method: "GET",
    baseDir: "settings",
  };

  static password = {
    url: ["http://localhost:8092/api/2.0/settings/security/password"],
    method: ["GET", "PUT"],
    baseDir: "settings",
  };

  static providers = {
    url: ["http://localhost:8092/api/2.0/people/thirdparty/providers"],
    method: "GET",
    baseDir: "people",
  };

  static code = {
    url: ["http://localhost:8092/api/2.0/authentication/123456"],
    method: "POST",
    baseDir: "auth",
  };

  static self = {
    url: [
      "http://localhost:8092/api/2.0/people/@self.json",
      "http://localhost:8092/api/2.0/people/%40self.json",
    ],
    method: "GET",
    baseDir: "people",
  };

  static info = {
    url: ["http://localhost:8092/api/2.0/modules/info"],
    method: "GET",
    baseDir: "modules",
  };

  static setup = {
    url: ["http://localhost:8092/api/2.0/settings/tfaapp/setup"],
    method: "GET",
    baseDir: "settings",
  };

  static validation = {
    url: ["http://localhost:8092/api/2.0/settings/tfaapp/validate"],
    method: "POST",
    baseDir: "settings",
  };

  static cultures = {
    url: ["http://localhost:8092/api/2.0/settings/cultures.json"],
    method: "GET",
    baseDir: "settings",
  };

  static timezones = {
    url: ["http://localhost:8092/api/2.0/settings/timezones.json"],
    method: "GET",
    baseDir: "settings",
  };

  static capabilities = {
    url: ["http://localhost:8092/api/2.0/capabilities"],
    method: "GET",
    baseDir: "settings",
  };

  static user = {
    url: ["http://localhost:8092/api/2.0/people/user.json"],
    method: "GET",
    baseDir: "people",
  };

  static tfaapp = {
    url: ["http://localhost:8092/api/2.0/settings/tfaapp"],
    method: "GET",
    baseDir: "settings",
  };

  static settfaapp = {
    url: ["http://localhost:8092/api/2.0/settings/tfaapp"],
    method: "PUT",
    baseDir: "settings",
  };

  static tfaconfirm = {
    url: ["http://localhost:8092/api/2.0/settings/tfaapp/confirm"],
    method: "GET",
    baseDir: "settings",
  };

  static passwordError = {
    url: ["http://localhost:8092/api/2.0/settings/password"],
    method: "PUT",
    baseDir: "settings",
  };

  static maildomainsettings = {
    url: ["http://localhost:8092/api/2.0/settings/maildomainsettings.json"],
    method: "POST",
    baseDir: "settings",
  };

  static auth = {
    url: ["http://localhost:8092/api/2.0/authentication.json"],
    method: "POST",
    baseDir: "auth",
  };

  static self = {
    url: [
      "http://localhost:8092/api/2.0/people/@self.json",
      "http://localhost:8092/api/2.0/people/%40self.json",
    ],
    method: "GET",
    baseDir: "people",
  };
  static info = {
    url: ["http://localhost:8092/api/2.0/modules/info"],
    method: "GET",
    baseDir: "modules",
  };
  static build = {
    url: ["http://localhost:8092/api/2.0/settings/version/build.json"],
    method: "GET",
    baseDir: "settings",
  };
  static settings = {
    url: ["http://localhost:8092/api/2.0/settings.json"],
    method: "GET",
    baseDir: "settings",
  };
  static common = {
    url: ["http://localhost:8092/api/2.0/settings/customschemas/Common.json"],
    method: "GET",
    baseDir: "settings",
  };
  static cultures = {
    url: ["http://localhost:8092/api/2.0/settings/cultures.json"],
    method: "GET",
    baseDir: "settings",
  };
  static root = {
    url: [
      "http://localhost:8092/api/2.0/files/@root",
      "http://localhost:8092/api/2.0/files/%40root",
    ],
    method: "GET",
    baseDir: "files/root",
  };
  static fileSettings = {
    url: ["http://localhost:8092/api/2.0/files/settings"],
    method: "GET",
    baseDir: "files/settings",
  };
  static my = {
    url: [
      "http://localhost:8092/api/2.0/files/@my",
      "http://localhost:8092/api/2.0/files/%40my",
    ],
    method: "GET",
    baseDir: "files/my",
  };
  static capabilities = {
    url: ["http://localhost:8092/api/2.0/files/thirdparty/capabilities"],
    method: "GET",
    baseDir: "files/settings",
  };
  static thirdparty = {
    url: ["http://localhost:8092/api/2.0/files/thirdparty"],
    method: "GET",
    baseDir: "files/settings",
  };
  static thumbnails = {
    url: ["http://localhost:8092/api/2.0/files/thumbnails"],
    method: "POST",
    baseDir: "files/settings",
  };

  static group = {
    url: ["http://localhost:8092/api/2.0/group"],
    method: "GET",
    baseDir: "people",
  };

  static people = {
    url: ["http://localhost:8092/api/2.0/people/filter"],
    method: "GET",
    baseDir: "people",
  };

  static admin = {
    url: [
      "http://localhost:8092/api/2.0/people/3e71bbca-7f67-11ec-aaa4-80ce62334fc7",
    ],
    method: "GET",
    baseDir: "people",
  };

  static share = {
    url: ["http://localhost:8092/api/2.0/files/share"],
    method: "POST",
    baseDir: "files/file",
  };

  static history = {
    url: ["ttp://localhost:8092/api/2.0/files/file/5417/history"],
    method: "GET",
    baseDir: "files/file",
  };

  static favorites = {
    url: ["http://localhost:8092/api/2.0/files/favorites"],
    method: "POST",
    baseDir: "files/file",
  };

  static fileops = {
    url: ["http://localhost:8092/api/2.0/files/fileops"],
    method: "GET",
    baseDir: "files/file",
  };

  static copy = {
    url: ["http://localhost:8092/api/2.0/files/fileops/copy"],
    method: "PUT",
    baseDir: "files/file",
  };

  static news = {
    url: ["http://localhost:8092/api/2.0/files/2/news"],
    method: "GET",
    baseDir: "files/file",
  };

  static getFolder = (folderId) => {
    return {
      url: [`http://localhost:8092/api/2.0/files/folder/${folderId}`],
      method: "GET",
      baseDir: "files/folder",
    };
  };

  static getSubfolder = (folderId) => {
    return {
      url: [`http://localhost:8092/api/2.0/files/${folderId}/subfolders`],
      method: "GET",
      baseDir: "files/subfolder",
    };
  };

  static getFile = (fileId) => {
    return {
      url: [`ttp://localhost:8092/api/2.0/files/file/${fileId}`],
      method: "GET",
      baseDir: "files/file",
    };
  };

  static getFileOperation = (fileId) => {
    return {
      url: [`ttp://localhost:8092/api/2.0/files/${fileId}`],
      method: "GET",
      baseDir: "files/operation",
    };
  };

  static root = {
    url: [
      "http://localhost:8092/api/2.0/files/@root",
      "http://localhost:8092/api/2.0/files/%40root",
    ],
    method: "GET",
    baseDir: "files/root",
  };
  static fileSettings = {
    url: ["http://localhost:8092/api/2.0/files/settings"],
    method: "GET",
    baseDir: "files/settings",
  };
  static my = {
    url: [
      "http://localhost:8092/api/2.0/files/@my",
      "http://localhost:8092/api/2.0/files/%40my",
    ],
    method: "GET",
    baseDir: "files/my",
  };
  static capabilities = {
    url: ["http://localhost:8092/api/2.0/files/thirdparty/capabilities"],
    method: "GET",
    baseDir: "files/settings",
  };
  static thirdparty = {
    url: ["http://localhost:8092/api/2.0/files/thirdparty"],
    method: "GET",
    baseDir: "files/settings",
  };
  static thumbnails = {
    url: ["http://localhost:8092/api/2.0/files/thumbnails"],
    method: "POST",
    baseDir: "files/settings",
  };

  static share = {
    url: ["http://localhost:8092/api/2.0/files/share"],
    method: "POST",
    baseDir: "files/file",
  };

  static history = {
    url: ["ttp://localhost:8092/api/2.0/files/file/5417/history"],
    method: "GET",
    baseDir: "files/file",
  };

  static favorites = {
    url: ["http://localhost:8092/api/2.0/files/favorites"],
    method: "POST",
    baseDir: "files/file",
  };

  static fileops = {
    url: ["http://localhost:8092/api/2.0/files/fileops"],
    method: "GET",
    baseDir: "files/file",
  };

  static copy = {
    url: ["http://localhost:8092/api/2.0/files/fileops/copy"],
    method: "PUT",
    baseDir: "files/file",
  };

  static news = {
    url: ["http://localhost:8092/api/2.0/files/2/news"],
    method: "GET",
    baseDir: "files/file",
  };

  static getFolder = (folderId) => {
    return {
      url: [`http://localhost:8092/api/2.0/files/folder/${folderId}`],
      method: "GET",
      baseDir: "files/folder",
    };
  };

  static getSubfolder = (folderId) => {
    return {
      url: [`http://localhost:8092/api/2.0/files/${folderId}/subfolders`],
      method: "GET",
      baseDir: "files/subfolder",
    };
  };

  static getFile = (fileId) => {
    return {
      url: [`ttp://localhost:8092/api/2.0/files/file/${fileId}`],
      method: "GET",
      baseDir: "files/file",
    };
  };

  static getFileOperation = (fileId) => {
    return {
      url: [`ttp://localhost:8092/api/2.0/files/${fileId}`],
      method: "GET",
      baseDir: "files/operation",
    };
  };
};
