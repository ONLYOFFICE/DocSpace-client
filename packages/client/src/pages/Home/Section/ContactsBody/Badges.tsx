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
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import classNames from "classnames";
import { ReactSVG } from "react-svg";

import Filter from "@docspace/shared/api/people/filter";
import { PaymentsType, AccountLoginType } from "@docspace/shared/enums";
import { globalColors } from "@docspace/shared/themes";
import { Badge } from "@docspace/shared/components/badge";
import { IconSizeType } from "@docspace/shared/utils";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import CatalogSpamIconUrl from "PUBLIC_DIR/images/icons/16/catalog.spam.react.svg?url";

import styles from "./badges.module.scss";

import { StyledSendClockIcon } from "SRC_DIR/components/Icons";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";

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

  return (
    <div
      className={classNames(
        "badges additional-badges",
        styles.badgesContainer,
        { [styles.infoPanelVisible]: infoPanelVisible },
      )}
    >
      {isLDAP ? (
        <Badge
          className="accounts-badge"
          label={t("Common:LDAP")}
          color={globalColors.white}
          backgroundColor={
            isBase ? globalColors.secondPurple : globalColors.secondPurpleDark
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
            isBase ? globalColors.secondGreen : globalColors.secondGreenDark
          }
          fontSize="9px"
          fontWeight={800}
          noHover
          onClick={onSSOClick}
        />
      ) : null}
      {!withoutPaid && isPaid ? (
        <Badge
          className={classNames("paid-badge accounts-badge", styles.paidBadge)}
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
        />
      ) : null}
      {statusType === "pending" ? (
        <StyledSendClockIcon
          className="pending-badge accounts-badge"
          size={IconSizeType.small}
        />
      ) : null}
      {statusType === "disabled" ? (
        <ReactSVG
          src={CatalogSpamIconUrl}
          className={classNames(
            "disabled-badge accounts-badge",
            styles.catalogSpamIcon,
          )}
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
