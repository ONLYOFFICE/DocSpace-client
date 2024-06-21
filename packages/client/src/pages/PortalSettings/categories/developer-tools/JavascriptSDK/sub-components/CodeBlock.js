// (c) Copyright Ascensio System SIA 2009-2024
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

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLightInit, githubDarkInit } from "@uiw/codemirror-theme-github";
import { Base } from "@docspace/shared/themes";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";

const StyledContainer = styled.div`
  border: 1px solid ${(props) => props.theme.plugins.borderColor};
  border-radius: 6px;
  width: 800px;
  overflow: hidden;
  background-color: ${(props) => props.theme.sdkPresets.previewBackgroundColor};
`;

StyledContainer.defaultProps = { theme: Base };

const CodeBlock = ({ config }) => {
  const codeString = `const config = ${JSON.stringify(config, null, "\t")}\n\nconst script = document.createElement("script");\n\nscript.setAttribute("src", "${SDK_SCRIPT_URL}");\nscript.onload = () => window.DocSpace.SDK.initFrame(config);\n\ndocument.body.appendChild(script);`;

  const extensions = [javascript({ jsx: true })];

  const baseTheme = githubLightInit({
    settings: {
      background: "#FFFFFF",
      caret: "#000000",
      lineHighlight: "#F3F4F4",
      gutterBorder: "#F8F9F9",
      gutterBackground: "#F8F9F9",
      gutterForeground: "#333333",
    },
  });

  const darkTheme = githubDarkInit({
    settings: {
      background: "#282828",
      caret: "#FFFFFF",
      lineHighlight: "#3D3D3D",
      gutterBorder: "#242424",
      gutterBackground: "#242424",
      gutterForeground: "#ADADAD",
    },
  });

  return (
    <StyledContainer>
      <CodeMirror
        value={codeString}
        maxWidth="800px"
        theme={theme.isBase ? baseTheme : darkTheme}
        extensions={extensions}
        editable={true}
        readOnly={true}
      />
    </StyledContainer>
  );
};

export default CodeBlock;
