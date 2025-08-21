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
