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

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { decode } from "he";

import { Text } from "@docspace/shared/components/text";
import { Tooltip } from "@docspace/shared/components/tooltip";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";
import {
  ContextMenu,
  ContextMenuRefType,
} from "@docspace/shared/components/context-menu";
import { Avatar, AvatarSize } from "@docspace/shared/components/avatar";
import { Badge } from "@docspace/shared/components/badge";
import { getUserAvatarRoleByType } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

import Badges from "SRC_DIR/pages/Home/Section/ContactsBody/Badges";
import ContactsConextOptionsStore from "SRC_DIR/store/contacts/ContactsContextOptionsStore";
import { TPeopleListItem } from "SRC_DIR/helpers/contacts";

import styles from "./Users.module.scss";

type ItemTitleProps = {
  userSelection: TPeopleListItem;
  getUserContextOptions: ContactsConextOptionsStore["getUserContextOptions"];
};

const ItemTitle = ({
  userSelection,
  getUserContextOptions,
}: ItemTitleProps) => {
  const { t } = useTranslation([
    "People",
    "PeopleTranslations",
    "InfoPanel",
    "Common",
    "Translations",
    "DeleteProfileEverDialog",
  ]);

  const theme = useTheme();

  const itemTitleRef = useRef<HTMLDivElement | null>(null);
  const contextMenuRef = useRef<ContextMenuRefType>(null);

  const onClickContextMenu = (e: React.MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.menuRef.current) {
      itemTitleRef.current?.click();
    }
    if (contextMenuRef.current) contextMenuRef.current.show(e);
  };

  const isPending =
    userSelection.statusType === "pending" ||
    userSelection.statusType === "disabled";

  const getData = () => {
    const newOptions = userSelection.options?.filter(
      (option) => option !== "details",
    );
    return getUserContextOptions(
      t,
      newOptions || [],
      userSelection,
    ) as unknown as ContextMenuModel[];
  };

  const contextOptions = getData();

  const userAvatar = userSelection.hasAvatar
    ? userSelection.avatarMax
    : DefaultUserPhoto;
  const isSSO = userSelection.isSSO || false;
  const isLDAP = userSelection.isLDAP || false;
  const displayName = userSelection.displayName
    ? decode(userSelection.displayName).trim()
    : "";

  const role = getUserAvatarRoleByType(userSelection.role);

  return (
    <div className={styles.userTitle} ref={itemTitleRef}>
      <Avatar
        className={styles.avatar}
        role={role}
        size={AvatarSize.big}
        source={userAvatar}
        noClick
        dataTestId="info_panel_contacts_user_avatar"
      />
      <div className={styles.infoText}>
        <div className={styles.infoWrapper}>
          <Text
            className={styles.infoTextName}
            title={displayName}
            truncate
            fontSize="16px"
            fontWeight={700}
            lineHeight="22px"
          >
            {isPending || !displayName ? userSelection.email : displayName}
          </Text>
          {isPending ? (
            <Badges withoutPaid statusType={userSelection.statusType} />
          ) : null}
        </div>
        {!isPending && !!displayName ? (
          <Text
            className={styles.infoTextEmail}
            title={userSelection.email}
            fontSize="13px"
            fontWeight={600}
            lineHeight="20px"
          >
            {userSelection.email}
          </Text>
        ) : null}
        {isSSO ? (
          <>
            <Badge
              id="sso-badge-info-panel"
              className={styles.ssoBadge}
              label={t("Common:SSO")}
              color={globalColors.white}
              backgroundColor={
                theme.isBase
                  ? globalColors.secondGreen
                  : globalColors.secondGreenDark
              }
              fontSize="9px"
              fontWeight={800}
              noHover
            />
            <Tooltip anchorSelect={`div[id='sso-badge-info-panel'] div`}>
              {t("PeopleTranslations:SSOAccountTooltip")}
            </Tooltip>
          </>
        ) : null}

        {isLDAP ? (
          <>
            <Badge
              id="ldap-badge-info-panel"
              className={styles.ldapBadge}
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
            />
            <Tooltip anchorSelect={`div[id='ldap-badge-info-panel'] div`}>
              {t("PeopleTranslations:LDAPAccountTooltip")}
            </Tooltip>
          </>
        ) : null}
      </div>

      <ContextMenu
        ref={contextMenuRef}
        model={contextOptions || []}
        getContextModel={getData}
        withBackdrop
        baseZIndex={310}
      />
      {contextOptions.length ? (
        <ContextMenuButton
          id="info-accounts-options"
          className={styles.contextButton}
          onClick={onClickContextMenu}
          getData={getData}
          displayType={ContextMenuButtonDisplayType.toggle}
        />
      ) : null}
    </div>
  );
};

export default ItemTitle;
