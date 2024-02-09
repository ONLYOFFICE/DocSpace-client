import React from "react";
import { useTranslation } from "react-i18next";

import DocspaceLogo from "../docspace-logo/DocspaceLogo";
import ErrorContainer from "../error-container/ErrorContainer";

import { ErrorUnavailableWrapper } from "./Errors.styled";
import type { ErrorUnavailableProps } from "./Errors.types";

const ErrorUnavailable = ({ whiteLabelLogoUrls }: ErrorUnavailableProps) => {
  const { t, ready } = useTranslation("Errors");

  return (
    ready && (
      <ErrorUnavailableWrapper>
        <DocspaceLogo whiteLabelLogoUrls={whiteLabelLogoUrls} />
        <ErrorContainer headerText={t("ErrorDeactivatedText")} />
      </ErrorUnavailableWrapper>
    )
  );
};

export default ErrorUnavailable;
