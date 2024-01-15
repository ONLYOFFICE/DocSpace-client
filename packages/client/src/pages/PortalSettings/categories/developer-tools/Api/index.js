import React from "react";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { mobile } from "@docspace/shared/utils";
import { Button } from "@docspace/shared/components/button";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import ConfirmWrapper from "../../../../Confirm/ConfirmWrapper";

import ApiSvgUrl from "PUBLIC_DIR/images/settings.api.svg?url";
import ApiDarkSvgUrl from "PUBLIC_DIR/images/settings.api.dark.svg?url";
import { DeviceType } from "@docspace/common/constants";

const EmptyContainer = styled(EmptyScreenContainer)`
  .ec-header {
    font-size: ${(props) => props.theme.getCorrectFontSize("23px")};
  }

  .ec-image {
    margin-right: 22px;
    margin-top: 22px;

    @media ${mobile} {
      margin-bottom: 22px;
    }
  }

  .ec-desc {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    margin-top: 12px;
    margin-bottom: 22px;
  }
`;

const Api = (props) => {
  const { t, setDocumentTitle, theme, apiBasicLink, currentDeviceType } = props;

  const imgSrc = theme.isBase ? ApiSvgUrl : ApiDarkSvgUrl;

  setDocumentTitle(t("Api"));

  return (
    <ConfirmWrapper height="100%">
      <EmptyContainer
        buttons={
          <Button
            label={t("Common:LearnMore")}
            primary
            size="normal"
            minWidth="135px"
            onClick={() => window.open(apiBasicLink, "_blank")}
            scale={currentDeviceType === DeviceType.mobile}
          />
        }
        descriptionText={t("ApiPageDescription")}
        headerText={t("ApiPageHeader")}
        imageAlt={t("ApiPageHeader")}
        imageSrc={imgSrc}
      />
    </ConfirmWrapper>
  );
};

export default inject(({ auth }) => {
  const { settingsStore, setDocumentTitle, currentDeviceType } = auth;
  const { theme, apiBasicLink } = settingsStore;

  return {
    theme,
    setDocumentTitle,
    apiBasicLink,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(Api)));
