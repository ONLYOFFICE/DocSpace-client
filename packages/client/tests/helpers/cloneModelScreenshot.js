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

var path = require("path");
var fs = require("fs");
var async = require("async");

const config = require("../../../../../../buildtools/config/appsettings.json");
const cultures = config.web.cultures;

function getFiles(dirPath, callback) {
  fs.readdir(dirPath, function (err, files) {
    if (err) return callback(err);

    var filePaths = [];
    async.eachSeries(
      files,
      function (fileName, eachCallback) {
        var filePath = path.join(dirPath, fileName);

        fs.stat(filePath, function (err, stat) {
          if (err) return eachCallback(err);

          if (stat.isDirectory()) {
            getFiles(filePath, function (err, subDirFiles) {
              if (err) return eachCallback(err);

              filePaths = filePaths.concat(subDirFiles);
              eachCallback(null);
            });
          } else {
            if (stat.isFile() && /\.png$/.test(filePath)) {
              filePaths.push(filePath);
            }

            eachCallback(null);
          }
        });
      },
      function (err) {
        callback(err, filePaths);
      },
    );
  });
}

function getClonePath(filePath, culture) {
  const splitFilePath = filePath.split("\\");

  const splitFileName = splitFilePath[splitFilePath.length - 1].split("-");

  splitFileName[0] = culture;

  splitFilePath[splitFilePath.length - 1] = splitFileName.join("-");

  const copyPath = splitFilePath.join("\\");

  return copyPath;
}

function copyFile(filePath) {
  cultures.forEach((culture) => {
    const copyPath = getClonePath(filePath, culture);

    fs.copyFile(filePath, copyPath, (err) => {
      if (err) console.log(err);
    });
  });
}

const pathToModels = path.resolve(__dirname, "../screenshots/translation");

function cloneModelScreenshot() {
  getFiles(pathToModels, function (err, files) {
    if (err) console.log(err);

    files.forEach((file) => {
      copyFile(file);
    });
  });
}

cloneModelScreenshot();
