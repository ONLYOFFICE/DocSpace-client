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

export function generateReport(hexColorsFound) {
  let htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colors report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h3 { margin-top: 8px; }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 4px; }
        .color-box { display: inline-block; width: 16px; height: 16px; margin-right: 8px; vertical-align: middle; }
    </style>
</head>
<body>
    <h1>Colors Report</h1>
    <p>Found colors in the following files:</p>
`;

  Object.keys(hexColorsFound).forEach((file) => {
    htmlReport += `<h3>File: ${file}</h3><ul>`;
    hexColorsFound[file].forEach((color) => {
      htmlReport += `
            <li>
                <div class="color-box" style="background-color: ${color};"></div>
                ${color}
            </li>`;
    });
    htmlReport += "</ul>";
  });

  htmlReport += `
    <p>Total files with colors: ${Object.keys(hexColorsFound).length}</p>
</body>
</html>`;

  return htmlReport;
}
