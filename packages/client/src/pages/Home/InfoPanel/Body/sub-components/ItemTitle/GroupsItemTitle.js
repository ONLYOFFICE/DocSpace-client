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

import { useRef } from "react";
import { withTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { matchPath } from "react-router";
import { Text } from "@docspace/shared/components/text";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { Avatar, AvatarSize } from "@docspace/shared/components/avatar";
import { StyledAccountsItemTitle } from "../../styles/accounts";
import { inject, observer } from "mobx-react";
import { decode } from "he";
import { Badge } from "@docspace/shared/components/badge";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { globalColors } from "@docspace/shared/themes";

const GroupsItemTitle = ({
  t,
  isRoomAdmin,
  isSeveralItems,
  infoPanelSelection,
  getGroupContextOptions,
}) => {
  const itemTitleRef = useRef();
  const theme = useTheme();

  const isInsideGroup = matchPath(
    "/accounts/groups/:groupId/filter",
    location.pathname,
  );

  const getContextOptions = () =>
    getGroupContextOptions(t, infoPanelSelection, true, isInsideGroup);

  const groupName = infoPanelSelection.name
    ? decode(infoPanelSelection.name).trim()
    : "";

  if (isSeveralItems) return null;

  return (
    <StyledAccountsItemTitle ref={itemTitleRef}>
      <Avatar
        className="avatar"
        size={AvatarSize.big}
        userName={infoPanelSelection.name}
        isGroup={true}
      />

      <div className="info-panel__info-text">
        <div className="info-panel__info-wrapper">
          <Text
            className={"info-text__name"}
            noSelect
            title={groupName}
            truncate
          >
            {groupName}
          </Text>
        </div>
        {!!groupName && (
          <Text className={"info-text__email"} title={infoPanelSelection.email}>
            {t("PeopleTranslations:PeopleCount", {
              count: infoPanelSelection.membersCount,
            })}
          </Text>
        )}

        {infoPanelSelection?.isLDAP && (
          <>
            <Badge
              id="ldap-badge-info-panel"
              className="ldap-badge"
              label={t("Common:LDAP")}
              color={globalColors.white}
              backgroundColor={globalColors.secondPurple}
              fontSize={"9px"}
              fontWeight={800}
              noHover
              lineHeight={"13px"}
            />
            <Tooltip anchorSelect={`div[id='ldap-badge-info-panel'] div`}>
              {t("PeopleTranslations:LDAPGroupTooltip")}
            </Tooltip>
          </>
        )}
      </div>

      {!isRoomAdmin && !infoPanelSelection.isLDAP && (
        <ContextMenuButton
          id="info-accounts-options"
          className="context-button"
          getData={getContextOptions}
        />
      )}
    </StyledAccountsItemTitle>
  );
};

export default inject(({ peopleStore }) => ({
  isRoomAdmin: peopleStore.userStore.user.isRoomAdmin,
}))(
  withTranslation([
    "People",
    "PeopleTranslations",
    "InfoPanel",
    "Common",
    "Translations",
    "DeleteProfileEverDialog",
  ])(observer(GroupsItemTitle)),
);
