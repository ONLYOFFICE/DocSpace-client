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

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { githubDarkInit, githubLightInit } from "@uiw/codemirror-theme-github";

import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme/themes";

import styles from "./GenerateSkillDialog.module.scss";

type SkillEditorProps = {
  value: string;
  isDisabled: boolean;
  onChange: (value: string) => void;
};

const extensions = [EditorView.lineWrapping];

// The colours of the JavaScript SDK code block, so the two editors match.
const lightTheme = githubLightInit({
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

/** The generated skill as Markdown text, editable before it is saved. */
const SkillEditor = ({ value, isDisabled, onChange }: SkillEditorProps) => {
  const { isBase } = useTheme();

  return (
    <div className={styles.editor} dir="ltr" data-testid="generate-skill-editor">
      <CodeMirror
        value={value}
        theme={isBase ? lightTheme : darkTheme}
        extensions={extensions}
        editable={!isDisabled}
        readOnly={isDisabled}
        onChange={onChange}
        // The preview is the panel's whole body: a short skill still gets
        // the room of a long one, and a long one scrolls with the panel.
        minHeight="calc(100vh - 220px)"
        basicSetup={{ foldGutter: false }}
      />
    </div>
  );
};

export default SkillEditor;
