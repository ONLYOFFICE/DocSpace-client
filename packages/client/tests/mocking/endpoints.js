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
