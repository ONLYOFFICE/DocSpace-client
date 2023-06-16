import styled from "styled-components";

import Base from "@docspace/components/themes/base";

const StyledSelectFolder = styled.div`
  .editor-select-folder_text-input {
    margin-top: 8px;
  }
  .editor-select-folder_checkbox {
    background-color: ${(props) => props.theme.editor.background};
    word-break: break-word;
    margin-bottom: 16px;
  }
`;

StyledSelectFolder.defaultProps = { theme: Base };

const StyledSelectFile = styled.div`
  .editor-select-file_text {
    word-break: break-word;
  }
`;

const StyledButton = styled.button`
  position: relative;
  color: #fff;
  height: 32px;
  background-color: #333333;
  border: 1px solid #474747;
  font-family: ${(props) => props.theme.fontFamily};
  padding: 0 28px;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  border-radius: 3px;
`;

StyledButton.defaultProps = { theme: Base };

const EditorWrapper = styled.div`
  height: 100vh;

  .dynamic-sharing-dialog {
    ${(props) => !props.isVisibleSharingDialog && "display: none"}
  }
`;

export { StyledSelectFolder, StyledSelectFile, EditorWrapper, StyledButton };
