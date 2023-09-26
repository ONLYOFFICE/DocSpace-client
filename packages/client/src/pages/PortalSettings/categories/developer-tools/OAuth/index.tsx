import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import OAuthEmptyScreen from "./sub-components/EmptyScreen";

import { OAuthContainer } from "./StyledOAuth";

const OAuth = ({}) => {
  const { t } = useTranslation(["OAuth"]);

  return (
    <OAuthContainer>
      <OAuthEmptyScreen t={t} />
    </OAuthContainer>
  );
};

export default inject(({}) => {
  return {};
})(observer(OAuth));
