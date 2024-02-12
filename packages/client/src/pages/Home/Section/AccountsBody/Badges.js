import React from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import { PaymentsType, AccountLoginType } from "@docspace/shared/enums";

import { Badge } from "@docspace/shared/components/badge";
import { commonIconsStyles } from "@docspace/shared/utils";

import SendClockIcon from "PUBLIC_DIR/images/send.clock.react.svg";
import CatalogSpamIcon from "PUBLIC_DIR/images/catalog.spam.react.svg";

import { SSO_LABEL } from "SRC_DIR/helpers/constants";

const StyledBadgesContainer = styled.div`
  height: 100%;

  display: flex;

  align-items: center;

  ${(props) =>
    props.infoPanelVisible &&
    css`
      .accounts-badge:last-child {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: 12px;
              `
            : css`
                margin-right: 12px;
              `}
      }
    `}
`;

const StyledPaidBadge = styled(Badge)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: 8px;
        `
      : css`
          margin-right: 8px;
        `}
`;

const StyledSendClockIcon = styled(SendClockIcon)`
  ${commonIconsStyles}
  path {
    fill: #a3a9ae;
  }
`;
const StyledCatalogSpamIcon = styled(CatalogSpamIcon)`
  ${commonIconsStyles}
  path {
    fill: #f21c0e;
  }
`;

const Badges = ({
  t,
  statusType,
  withoutPaid,
  isPaid = false,
  filter,
  infoPanelVisible,
  isSSO = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onClickPaid = () => {
    if (filter.payments === PaymentsType.Paid) return;
    const newFilter = filter.clone();
    newFilter.payments = PaymentsType.Paid;

    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  const onClickSSO = () => {
    if (filter.accountLoginType === AccountLoginType.SSO) return;
    const newFilter = filter.clone();
    newFilter.accountLoginType = AccountLoginType.SSO;
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  return (
    <StyledBadgesContainer
      className="badges additional-badges"
      infoPanelVisible={infoPanelVisible}
    >
      {isSSO && (
        <Badge
          className="accounts-badge"
          label={SSO_LABEL}
          color={"#FFFFFF"}
          backgroundColor="#22C386"
          fontSize={"9px"}
          fontWeight={800}
          noHover
          lineHeight={"13px"}
          onClick={onClickSSO}
        />
      )}
      {!withoutPaid && isPaid && (
        <StyledPaidBadge
          className="paid-badge accounts-badge"
          label={t("Paid")}
          backgroundColor={"#EDC409"}
          fontSize={"9px"}
          fontWeight={800}
          lineHeight={"13px"}
          noHover
          onClick={onClickPaid}
          isPaidBadge
        />
      )}
      {statusType === "pending" && (
        <StyledSendClockIcon
          className="pending-badge accounts-badge"
          size="small"
        />
      )}
      {statusType === "disabled" && (
        <StyledCatalogSpamIcon
          className="disabled-badge accounts-badge"
          size="small"
        />
      )}
    </StyledBadgesContainer>
  );
};

export default inject(({ peopleStore }) => {
  const { filterStore } = peopleStore;

  const { filter } = filterStore;

  return { filter };
})(withTranslation(["Common"])(observer(Badges)));
