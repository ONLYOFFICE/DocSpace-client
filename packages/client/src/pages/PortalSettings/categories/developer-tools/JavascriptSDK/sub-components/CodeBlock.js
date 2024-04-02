import React from "react";
import styled from "styled-components";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLightInit, githubDarkInit } from "@uiw/codemirror-theme-github";
import { Base } from "@docspace/shared/themes";

const StyledContainer = styled.div`
  border: 1px solid ${(props) => props.theme.plugins.borderColor};
  border-radius: 6px;
  width: 800px;
  overflow: hidden;
  background-color: ${(props) => props.theme.sdkPresets.previewBackgroundColor};
`;

StyledContainer.defaultProps = { theme: Base };

const CodeBlock = ({ config }) => {
  const codeString = `const config = ${JSON.stringify(config, null, "\t")}\n\nconst script = document.createElement("script");\n\nscript.setAttribute("src", "${new URL(window.location).origin}/static/scripts/api.js");\nscript.onload = () => window.DocSpace.SDK.initFrame(config);\n\ndocument.body.appendChild(script);`;

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
