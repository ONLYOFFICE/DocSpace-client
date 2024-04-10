// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { Base } from "@docspace/shared/themes";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";

import { useTranslation } from "react-i18next";

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
  const { webhooksGuideUrl } = props;

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
      >
        {t("WebhooksGuide")}
      </StyledGuideLink>
    </InfoWrapper>
  );
};

export default inject(({ settingsStore }) => {
  const { webhooksGuideUrl } = settingsStore;

  return {
    webhooksGuideUrl,
  };
})(observer(WebhookInfo));
