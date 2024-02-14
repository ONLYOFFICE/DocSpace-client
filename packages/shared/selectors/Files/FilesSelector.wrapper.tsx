import React from "react";
import { ThemeProvider } from "styled-components";
import { i18n } from "i18next";
import { I18nextProvider } from "react-i18next";

import { TTheme } from "../../themes";

import FilesSelector from ".";
import { FilesSelectorProps } from "./FilesSelector.types";

const FilesSelectorWrapper = ({
  i18nProp,
  theme,
  ...rest
}: FilesSelectorProps & { i18nProp: i18n; theme: TTheme }) => {
  return (
    <I18nextProvider i18n={i18nProp}>
      <ThemeProvider theme={theme}>
        <FilesSelector {...rest} />
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default FilesSelectorWrapper;
