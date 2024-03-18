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
