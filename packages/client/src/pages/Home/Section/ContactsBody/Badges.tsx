/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { useTheme } from "@docspace/ui-kit/context";

import Filter from "@docspace/shared/api/people/filter";
import { PaymentsType, AccountLoginType } from "@docspace/shared/enums";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Badge } from "@docspace/ui-kit/components/badge";

import CatalogSpamIcon from "PUBLIC_DIR/images/icons/16/catalog.spam.react.svg";

import { StyledSendClockIcon } from "SRC_DIR/components/Icons";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import { getConstName } from "@docspace/shared/constants/consts";

import styles from "./Badges.module.scss";

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
  const { isBase } = useTheme();
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

  const containerClass = [
    "badges additional-badges",
    styles.badgesContainer,
    infoPanelVisible && styles.infoPanelVisible,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      {isLDAP ? (
        <Badge
          className="accounts-badge"
          label={getConstName("LDAP")}
          color={globalColors.white}
          backgroundColor={
            isBase ? globalColors.secondPurple : globalColors.secondPurpleDark
          }
          fontSize="9px"
          fontWeight={800}
          onClick={onLDAPClick}
        />
      ) : null}
      {isSSO ? (
        <Badge
          className="accounts-badge"
          label={getConstName("SSO")}
          color={globalColors.white}
          backgroundColor={
            isBase ? globalColors.secondGreen : globalColors.secondGreenDark
          }
          fontSize="9px"
          fontWeight={800}
          onClick={onSSOClick}
        />
      ) : null}
      {!withoutPaid && isPaid ? (
        <Badge
          className="paid-badge accounts-badge"
          label={t("Paid")}
          backgroundColor={
            isBase
              ? globalColors.favoritesStatus
              : globalColors.favoriteStatusDark
          }
          fontSize="9px"
          fontWeight={800}
          noHover
          onClick={onClickPaid}
          isPaidBadge
          maxWidth="65px"
          style={{ marginInlineEnd: "8px" }}
        />
      ) : null}
      {statusType === "pending" ? (
        <StyledSendClockIcon className="pending-badge accounts-badge" />
      ) : null}
      {statusType === "disabled" ? (
        <CatalogSpamIcon
          className={`${styles.catalogSpamIcon} disabled-badge accounts-badge`}
        />
      ) : null}
    </div>
  );
};

export default inject(({ peopleStore }: { peopleStore: PeopleStore }) => {
  const { usersStore } = peopleStore;

  const { filter } = usersStore!;

  return { filter };
})(observer(Badges));
