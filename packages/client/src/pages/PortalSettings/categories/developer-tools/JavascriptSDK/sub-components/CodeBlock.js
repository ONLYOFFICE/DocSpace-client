import React from "react";
import styled from "styled-components";

import CodeMirror from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { javascript } from "@codemirror/lang-javascript";
import { tags as t } from "@lezer/highlight";

import { Base } from "@docspace/shared/themes";

const StyledContainer = styled.div`
  border: 1px solid ${(props) => props.theme.plugins.borderColor};
  border-radius: 6px;
  width: 800px;
  margin-top: 16px;

  overflow: hidden;

  background-color: ${(props) => props.theme.sdkPresets.previewBackgroundColor};
`;

StyledContainer.defaultProps = { theme: Base };

const baseTheme = createTheme({
  theme: "light",
  settings: {
    background: "#ffffff",
    foreground: "#333333",
    caret: "#333333",
    selection: "#036dd626",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBackground: "#ffffff",
    gutterForeground: "#A3A9AE",
    gutterBorder: "#ffffff",
  },
  styles: [
    { tag: t.variableName, color: "#EA7F3B" },
    { tag: [t.string, t.special(t.brace)], color: "#EA7F3B" },
    { tag: [t.null, t.bool], color: "#456FA0" },
  ],
});

const extensions = [javascript({ jsx: true })];

const CodeBlock = ({ config }) => {
  const codeString = `const config = ${JSON.stringify(config, null, "\t")}\n\nconst script = document.createElement("script");\n\nscript.setAttribute("src", "${new URL(window.location).origin}/static/scripts/api.js");\nscript.onload = () => window.DocSpace.SDK.initFrame(config);\n\ndocument.body.appendChild(script);`;

  return (
    <StyledContainer>
      <CodeMirror
        value={codeString}
        width="800px"
        theme={baseTheme}
        extensions={extensions}
        editable={true}
        readOnly={true}
      />
    </StyledContainer>
  );
};

export default CodeBlock;
