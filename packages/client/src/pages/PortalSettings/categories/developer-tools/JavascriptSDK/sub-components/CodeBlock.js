// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";
import styled from "styled-components";

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLightInit, githubDarkInit } from "@uiw/codemirror-theme-github";
import { globalColors } from "@docspace/shared/themes";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledContainer = styled.div.attrs(injectDefaultTheme)`
  border: 1px solid ${(props) => props.theme.plugins.borderColor};
  border-radius: 6px;
  max-width: 800px;
  width: 100%;
  overflow: hidden;
  background-color: ${(props) => props.theme.sdkPresets.previewBackgroundColor};

  .cm-scroller {
    overflow-x: hidden;
  }
`;

const CodeBlock = ({ config, theme }) => {
  const codeString = `const config = ${JSON.stringify(config, null, "\t")}\n\nconst script = document.createElement("script");\n\nscript.setAttribute("src", "${SDK_SCRIPT_URL}");\nscript.onload = () => window.DocSpace.SDK.init(config);\n\ndocument.body.appendChild(script);`;

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
    <StyledContainer dir="ltr">
      <CodeMirror
        value={codeString}
        theme={theme.isBase ? baseTheme : darkTheme}
        extensions={extensions}
        editable
        readOnly
      />
    </StyledContainer>
  );
};

export default CodeBlock;
