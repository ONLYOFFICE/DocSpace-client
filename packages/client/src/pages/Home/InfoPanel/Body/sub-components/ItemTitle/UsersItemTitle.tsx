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
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import ContactsConextOptionsStore from "SRC_DIR/store/contacts/ContactsContextOptionsStore";

import { StyledUsersTitle } from "../../styles/Users";

type UsersItemTitleProps = {
  isSeveralItems: boolean;
  infoPanelSelection: ReturnType<UsersStore["getPeopleListItem"]>;
  getUserContextOptions: ContactsConextOptionsStore["getUserContextOptions"];
};

const UsersItemTitle = ({
  isSeveralItems,
  infoPanelSelection,
  getUserContextOptions,
}: UsersItemTitleProps) => {
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

  if (isSeveralItems) {
    return null;
  }

  const isPending =
    infoPanelSelection.statusType === "pending" ||
    infoPanelSelection.statusType === "disabled";

  const getData = () => {
    const newOptions = infoPanelSelection.options?.filter(
      (option) => option !== "details",
    );
    return getUserContextOptions(
      t,
      newOptions || [],
      infoPanelSelection,
    ) as unknown as ContextMenuModel[];
  };

  const contextOptions = getData();

  const userAvatar = infoPanelSelection.hasAvatar
    ? infoPanelSelection.avatarMax
    : DefaultUserPhoto;
  const isSSO = infoPanelSelection.isSSO || false;
  const isLDAP = infoPanelSelection.isLDAP || false;
  const displayName = infoPanelSelection.displayName
    ? decode(infoPanelSelection.displayName).trim()
    : "";

  const role = getUserAvatarRoleByType(infoPanelSelection.role);

  return (
    <StyledUsersTitle ref={itemTitleRef}>
      <Avatar
        className="avatar"
        role={role}
        size={AvatarSize.big}
        source={userAvatar}
        noClick
      />
      <div className="info-panel__info-text">
        <div className="info-panel__info-wrapper">
          <Text className="info-text__name" title={displayName} truncate>
            {isPending || !displayName ? infoPanelSelection.email : displayName}
          </Text>
          {isPending ? (
            <Badges withoutPaid statusType={infoPanelSelection.statusType} />
          ) : null}
        </div>
        {!isPending && !!displayName ? (
          <Text className="info-text__email" title={infoPanelSelection.email}>
            {infoPanelSelection.email}
          </Text>
        ) : null}
        {isSSO ? (
          <>
            <Badge
              id="sso-badge-info-panel"
              className="sso-badge"
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
              className="ldap-badge"
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
      <>
        <ContextMenu
          ref={contextMenuRef}
          model={contextOptions || []}
          getContextModel={getData}
          withBackdrop
        />
        {contextOptions.length ? (
          <ContextMenuButton
            id="info-accounts-options"
            className="context-button"
            onClick={onClickContextMenu}
            getData={getData}
            displayType={ContextMenuButtonDisplayType.toggle}
          />
        ) : null}
      </>
    </StyledUsersTitle>
  );
};

export default UsersItemTitle;
