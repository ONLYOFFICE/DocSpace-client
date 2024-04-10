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
import moment from "moment-timezone";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import StatusBadge from "../../sub-components/StatusBadge";

import { inject, observer } from "mobx-react";

import { Base } from "@docspace/shared/themes";
import { useTranslation } from "react-i18next";

import { tablet, mobile } from "@docspace/shared/utils";

const BarWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;

  margin-top: 25px;

  background: ${(props) => (props.theme.isBase ? "#f8f9f9" : "#3D3D3D")};
  border-radius: 3px;
  flex-wrap: wrap;

  .barItemHeader {
    margin-bottom: 10px;
  }
`;

BarWrapper.defaultProps = { theme: Base };

const BarItem = styled.div`
  box-sizing: border-box;
  min-height: 76px;
  padding: 16px;
  flex-basis: 25%;

  @media ${tablet} {
    flex-basis: 50%;
  }
  @media ${mobile} {
    flex-basis: 100%;
  }
`;

const BarItemHeader = ({ children }) => (
  <Text
    as="h3"
    color="#A3A9AE"
    fontSize="12px"
    fontWeight={600}
    className="barItemHeader"
  >
    {children}
  </Text>
);

const FlexWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const DetailsBar = ({ eventDetails }) => {
  const { t, i18n } = useTranslation("Webhooks");

  const formatDate = (date) => {
    return (
      moment(date)
        .locale(i18n.language)
        .tz(window.timezone)
        .format("MMM D, YYYY, h:mm:ss A") +
      " " +
      t("Common:UTC")
    );
  };

  const formattedDelivery = formatDate(eventDetails.delivery);
  const formattedCreationTime = formatDate(eventDetails.creationTime);

  return (
    <BarWrapper>
      <BarItem>
        <BarItemHeader>Status</BarItemHeader>
        <FlexWrapper>
          <StatusBadge status={eventDetails.status} />
        </FlexWrapper>
      </BarItem>
      <BarItem>
        <BarItemHeader>Event ID</BarItemHeader>
        <Text isInline fontWeight={600}>
          {eventDetails.id}
        </Text>
      </BarItem>
      <BarItem>
        <BarItemHeader>Event time</BarItemHeader>
        <Text isInline fontWeight={600}>
          {formattedCreationTime}
        </Text>
      </BarItem>
      <BarItem>
        <BarItemHeader>Delivery time</BarItemHeader>
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
