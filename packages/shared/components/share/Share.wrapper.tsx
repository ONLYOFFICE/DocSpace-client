import React from "react";
import { i18n } from "i18next";
import { I18nextProvider } from "react-i18next";

import { ShareProps } from "./Share.types";
import Share from ".";

const FilesSelectorWrapper = ({
  i18nProp,

  ...rest
}: ShareProps & { i18nProp: i18n }) => {
  return (
    <I18nextProvider i18n={i18nProp}>
      <Share {...rest} />
    </I18nextProvider>
  );
};

export default FilesSelectorWrapper;
