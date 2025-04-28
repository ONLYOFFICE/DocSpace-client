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

import { inject, observer } from "mobx-react";
import styled, { css, useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";

import Filter from "@docspace/shared/api/people/filter";
import { PaymentsType, AccountLoginType } from "@docspace/shared/enums";
import { globalColors } from "@docspace/shared/themes";
import { Badge } from "@docspace/shared/components/badge";
import { commonIconsStyles, IconSizeType } from "@docspace/shared/utils";

import CatalogSpamIcon from "PUBLIC_DIR/images/icons/16/catalog.spam.react.svg";

import { StyledSendClockIcon } from "SRC_DIR/components/Icons";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";

const StyledBadgesContainer = styled.div<{ infoPanelVisible?: boolean }>`
  height: 100%;

  display: flex;

  align-items: center;

  ${(props) =>
    props.infoPanelVisible &&
    css`
      .accounts-badge:last-child {
        margin-inline-end: 12px;
      }
    `}
`;

const StyledPaidBadge = styled(Badge)`
  margin-inline-end: 8px;
`;

const StyledCatalogSpamIcon = styled(CatalogSpamIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.accountsBadges.disabledColor};
  }
`;

type BadgeProps = {
  statusType?: string;
  withoutPaid?: boolean;
  isPaid?: boolean;
  filter?: Filter;
  infoPanelVisible?: boolean;
  isSSO?: boolean;
  isLDAP?: boolean;
};

const Badges = ({
  statusType,
  withoutPaid,
  isPaid = false,
  filter,
  infoPanelVisible,
  isSSO = false,
  isLDAP = false,
}: BadgeProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { t } = useTranslation(["Common"]);

  const onClickPaid = () => {
    if (filter!.payments === PaymentsType.Paid) return;
    const newFilter = filter!.clone();
    newFilter.payments = PaymentsType.Paid;

    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  const onSSOClick = () => {
    if (filter!.accountLoginType === AccountLoginType.SSO) return;
    const newFilter = filter!.clone();
    newFilter.accountLoginType = AccountLoginType.SSO;
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  const onLDAPClick = () => {
    if (filter!.accountLoginType === AccountLoginType.LDAP) return;
    const newFilter = filter!.clone();
    newFilter.accountLoginType = AccountLoginType.LDAP;
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  return (
    <StyledBadgesContainer
      className="badges additional-badges"
      infoPanelVisible={infoPanelVisible}
    >
      {isLDAP ? (
        <Badge
          className="accounts-badge"
          label={t("Common:LDAP")}
          color={globalColors.white}
          backgroundColor={
            theme.isBase
              ? globalColors.secondPurple
              : globalColors.secondPurpleDark
          }
          fontSize="9px"
          fontWeight={800}
          noHover
          onClick={onLDAPClick}
        />
      ) : null}
      {isSSO ? (
        <Badge
          className="accounts-badge"
          label={t("SSO")}
          color={globalColors.white}
          backgroundColor={
            theme.isBase
              ? globalColors.secondGreen
              : globalColors.secondGreenDark
          }
          fontSize="9px"
          fontWeight={800}
          noHover
          onClick={onSSOClick}
        />
      ) : null}
      {!withoutPaid && isPaid ? (
        <StyledPaidBadge
          className="paid-badge accounts-badge"
          label={t("Paid")}
          backgroundColor={
            theme.isBase
              ? globalColors.favoritesStatus
              : globalColors.favoriteStatusDark
          }
          fontSize="9px"
          fontWeight={800}
          noHover
          onClick={onClickPaid}
          isPaidBadge
          maxWidth="65px"
        />
      ) : null}
      {statusType === "pending" ? (
        <StyledSendClockIcon
          className="pending-badge accounts-badge"
          size={IconSizeType.small}
        />
      ) : null}
      {statusType === "disabled" ? (
        <StyledCatalogSpamIcon
          className="disabled-badge accounts-badge"
          size={IconSizeType.small}
        />
      ) : null}
    </StyledBadgesContainer>
  );
};

export default inject(({ peopleStore }: { peopleStore: PeopleStore }) => {
  const { usersStore } = peopleStore;

  const { filter } = usersStore!;

  return { filter };
})(observer(Badges));
