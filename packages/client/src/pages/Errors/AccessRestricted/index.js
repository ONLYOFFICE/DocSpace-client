import React from "react";
import styled from "styled-components";
import ErrorContainer from "@docspace/common/components/ErrorContainer";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "./i18n";

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 64px;
`;

const AccessRestricted = () => {
  const { t, ready } = useTranslation("Errors");

  return ready ? (
    <StyledWrapper>
      <ErrorContainer
        headerText={t("AccessDenied")}
        bodyText={t("PortalRestriction")}
      />
    </StyledWrapper>
  ) : (
    <></>
  );
};

export default () => (
  <I18nextProvider i18n={i18n}>
    <AccessRestricted />
  </I18nextProvider>
);
