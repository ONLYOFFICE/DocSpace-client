import React from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { Text } from "@docspace/shared/components/text";

const StyledContactContainer = styled.div`
  display: flex;
  width: 100%;
  a {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 4px;
          `
        : css`
            margin-left: 4px;
          `}
  }
`;

const ContactContainer = ({ t, salesEmail }) => {
  return (
    <StyledContactContainer>
      {salesEmail && (
        <Text as="span" noSelect fontWeight={600}>
          {t("ContactUs")}
          <ColorTheme
            className="sales-email-link"
            tag="a"
            themeId={ThemeId.Link}
            fontWeight="600"
            href={`mailto:${salesEmail}`}
          >
            {salesEmail}
          </ColorTheme>
        </Text>
      )}
    </StyledContactContainer>
  );
};

export default inject(({ paymentStore, settingsStore }) => {
  const { salesEmail } = paymentStore;
  return {
    salesEmail,
    theme: settingsStore.theme,
  };
})(observer(ContactContainer));
