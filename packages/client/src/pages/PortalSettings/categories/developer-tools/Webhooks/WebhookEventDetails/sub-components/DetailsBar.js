// (c) Copyright Ascensio System SIA 2009-2025
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
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import {
  mobile,
  injectDefaultTheme,
  getCorrectDate,
} from "@docspace/shared/utils";

import StatusBadge from "../../sub-components/StatusBadge";
import { getTriggerTranslate } from "../../Webhooks.helpers";

const BarWrapper = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  margin-top: 25px;

  background: ${(props) => props.theme.client.settings.webhooks.barBackground};
  border-radius: 3px;

  .barItemHeader {
    margin-bottom: 10px;
    color: ${(props) => props.theme.client.settings.webhooks.color};
  }
`;

const BarItem = styled.div`
  box-sizing: border-box;
  min-height: 76px;
  padding: 16px;

  @media ${mobile} {
    flex-basis: 100%;
  }
`;

const BarItemHeader = ({ children }) => (
  <Text as="h3" fontSize="12px" fontWeight={600} className="barItemHeader">
    {children}
  </Text>
);

const FlexWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const DetailsBar = ({ eventDetails }) => {
  const { t, i18n } = useTranslation(["Webhooks", "People"]);

  const formattedDelivery = getCorrectDate(
    i18n.language,
    eventDetails.delivery,
  );
  const formattedCreationTime = getCorrectDate(
    i18n.language,
    eventDetails.creationTime,
  );

  const trigger = getTriggerTranslate(eventDetails.trigger, t);

  return (
    <BarWrapper>
      <BarItem>
        <BarItemHeader>{t("People:UserStatus")}</BarItemHeader>
        <FlexWrapper>
          <StatusBadge status={eventDetails.status} />
        </FlexWrapper>
      </BarItem>
      <BarItem>
        <BarItemHeader>{t("EventID")}</BarItemHeader>
        <Text isInline fontWeight={600}>
          {eventDetails.id}
        </Text>
      </BarItem>
      <BarItem>
        <BarItemHeader>{t("EventType")}</BarItemHeader>
        <Text isInline fontWeight={600}>
          {trigger}
        </Text>
      </BarItem>
      <BarItem>
        <BarItemHeader>{t("EventTime")}</BarItemHeader>
        <Text isInline fontWeight={600}>
          {formattedCreationTime}
        </Text>
      </BarItem>
      <BarItem>
        <BarItemHeader>{t("DeliveryTime")}</BarItemHeader>
        <Text isInline fontWeight={600}>
          {formattedDelivery}
        </Text>
      </BarItem>
    </BarWrapper>
  );
};

export default inject(({ webhooksStore }) => {
  const { eventDetails } = webhooksStore;

  return { eventDetails };
})(observer(DetailsBar));
