import React from "react";
import moment from "moment";
import styled from "styled-components";

import Text from "@docspace/components/text";
import StatusBadge from "../../sub-components/StatusBadge";

import { inject, observer } from "mobx-react";

import { Base } from "@docspace/components/themes";
import { useTranslation } from "react-i18next";

import { tablet, mobile } from "@docspace/components/utils/device";

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
  <Text as="h3" color="#A3A9AE" fontSize="12px" fontWeight={600} className="barItemHeader">
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
      moment(date).locale(i18n.language).format("MMM D, YYYY, h:mm:ss A") + " " + t("Common:UTC")
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
