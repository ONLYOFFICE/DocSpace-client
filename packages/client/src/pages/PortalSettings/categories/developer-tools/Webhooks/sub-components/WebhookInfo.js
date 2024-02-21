import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { Base } from "@docspace/components/themes";

import Link from "@docspace/components/link";
import Text from "@docspace/components/text";

import { useTranslation } from "react-i18next";
import { UrlActionType } from "@docspace/common/constants";

const InfoWrapper = styled.div`
  margin-bottom: 25px;
`;

const InfoText = styled(Text)`
  max-width: 660px;
  white-space: break-spaces;
  margin: 0 0 8px 0;
  line-height: 20px;
  color: ${(props) => props.theme.client.settings.common.descriptionColor};
`;

InfoText.defaultProps = { theme: Base };

const StyledGuideLink = styled(Link)`
  color: ${(props) => (props.theme.isBase ? "#316DAA" : "#4781D1")};
  &:hover {
    color: ${(props) => (props.theme.isBase ? "#316DAA" : "#4781D1")};
  }
`;

StyledGuideLink.defaultProps = { theme: Base };

const WebhookInfo = (props) => {
  const { t } = useTranslation(["Webhooks"]);
  const { webhooksGuideUrl, openUrl } = props;

  return (
    <InfoWrapper>
      <InfoText as="p">{t("WebhooksInfo")}</InfoText>
      <StyledGuideLink
        id="webhooks-info-link"
        fontWeight={600}
        isHovered
        type="page"
        href={webhooksGuideUrl}
        target="_blank"
        onClick={() => openUrl(webhooksGuideUrl, UrlActionType.Link)}
      >
        {t("WebhooksGuide")}
      </StyledGuideLink>
    </InfoWrapper>
  );
};

export default inject(({ auth }) => {
  const { webhooksGuideUrl, openUrl } = auth.settingsStore;

  return {
    webhooksGuideUrl,
    openUrl,
  };
})(observer(WebhookInfo));
