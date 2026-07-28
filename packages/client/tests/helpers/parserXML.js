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

let fs = require("fs");
let path = require("path");

const deviceType = ["mobile", "smallTablet", "tablet", "desktop"];
const browser = ["chromium", "firefox", "webkit"];

function parse() {
  const currentStrings = [];
  const final = [];

  for (let i = 0; i < browser.length; i++) {
    for (let j = 0; j < deviceType.length; j++) {
      const filePath = path.join(
        __dirname,
        `../reports/${browser[i]}/${deviceType[j]}/report.xml`
      );
      let currentString = "";
      const testName = `${browser[i]} ${deviceType[j]}`;
      const fn = new Promise((resolve) => {
        fs.stat(filePath, (err) => {
          if (err) {
            resolve();
          } else {
            fs.readFile(filePath, "utf-8", (err, data) => {
              currentString = data.match(
                /<testsuites .*>\n(.*\n)*<\/testsuites>/g
              );
              currentString = currentString
                .toString()
                .replace("Mocha Tests", testName);
              currentStrings.splice(i * 4 + j, 0, currentString);
              resolve();
            });
          }
        });
      });
      final.push(fn);
    }
  }

  Promise.all(final).then(() => {
    let tests = 0;
    let failures = 0;
    let time = 0;
    let xmlString = "";

    currentStrings.forEach((currentString) => {
      const currentTestData = currentString
        .match(/<testsuites .*>\n/g)[0]
        .match(/"\d*.?\d*"/g);
      const currentTestDataNumber = currentTestData.map((testData) =>
        testData.replace(/[^0-9,.]/g, "")
      );
      time += Math.round(Number(currentTestDataNumber[0]) * 100) / 100;
      tests += Number(currentTestDataNumber[1]);
      failures += Number(currentTestDataNumber[2]);
      xmlString += currentString + "\n";
    });

    const moduleInfo = `<moduleinfo name="Login" time="${time}" tests="${tests}" failures="${failures}">\n</moduleinfo>\n`;
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>\n`;

    xmlString = xmlData + moduleInfo + xmlString;

    const filePath = path.join(__dirname, `../reports/report.xml`);

    fs.writeFile(filePath, xmlString, "utf-8", (err) => {
      if (err) throw err;
      console.log("Data has been replaced!");
    });
  });
}

parse();
