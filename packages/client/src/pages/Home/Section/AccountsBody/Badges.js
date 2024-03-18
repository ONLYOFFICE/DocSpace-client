// (c) Copyright Ascensio System SIA 2010-2024
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
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import { PaymentsType, AccountLoginType } from "@docspace/shared/enums";

import { Badge } from "@docspace/shared/components/badge";
import { commonIconsStyles } from "@docspace/shared/utils";

import SendClockIcon from "PUBLIC_DIR/images/send.clock.react.svg";
import CatalogSpamIcon from "PUBLIC_DIR/images/catalog.spam.react.svg";

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
          label={t("SSO")}
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
          maxWidth="65px"
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
