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

import React from "react";

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLightInit, githubDarkInit } from "@uiw/codemirror-theme-github";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import styles from "./CodeBlock.module.scss";

const CodeBlock = ({ config, scriptUrl, theme }) => {
  const configWithoutEvents = { ...config };
  delete configWithoutEvents.events;

  const configString = JSON.stringify(configWithoutEvents, null, "\t");

  const codeString = `const config = ${configString}\n\nconst script = document.createElement("script");\n\nscript.setAttribute("src", "${scriptUrl}");\nscript.onload = () => window.DocSpace.SDK.init(config);\n\ndocument.body.appendChild(script);`;

  const extensions = [javascript({ jsx: true }), EditorView.lineWrapping];

  const baseTheme = githubLightInit({
    settings: {
      background: globalColors.white,
      caret: globalColors.darkBlack,
      lineHighlight: globalColors.lightGrayHover,
      gutterBorder: globalColors.grayLight,
      gutterBackground: globalColors.grayLight,
      gutterForeground: globalColors.black,
    },
  });

  const darkTheme = githubDarkInit({
    settings: {
      background: globalColors.darkGrayLight,
      caret: globalColors.white,
      lineHighlight: globalColors.lightDarkGrayHover,
      gutterBorder: globalColors.grayDarkMid,
      gutterBackground: globalColors.grayDarkMid,
      gutterForeground: globalColors.darkGrayDark,
    },
  });

  return (
    <div className={styles.container} dir="ltr">
      <CodeMirror
        value={codeString}
        theme={theme.isBase ? baseTheme : darkTheme}
        extensions={extensions}
        editable
        readOnly
      />
    </div>
  );
};

export default CodeBlock;
