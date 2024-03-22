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

import React, { useRef } from "react";
import { withTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { Avatar } from "@docspace/shared/components/avatar";
import { Badge } from "@docspace/shared/components/badge";
import Badges from "@docspace/client/src/pages/Home/Section/AccountsBody/Badges";
import { StyledAccountsItemTitle } from "../../styles/accounts";
import { StyledTitle } from "../../styles/common";

import { decode } from "he";

const AccountsItemTitle = ({
  t,
  isSeveralItems,
  infoPanelSelection,
  getUserContextOptions,
}) => {
  if (isSeveralItems) {
    return <></>;
  }

  const itemTitleRef = useRef();

  const isPending =
    infoPanelSelection.statusType === "pending" ||
    infoPanelSelection.statusType === "disabled";

  const getData = () => {
    const newOptions = infoPanelSelection.options?.filter(
      (option) => option !== "details",
    );
    return getUserContextOptions(t, newOptions || [], infoPanelSelection);
  };
  const contextOptions = getData();

  const userAvatar = infoPanelSelection.hasAvatar
    ? infoPanelSelection.avatar
    : DefaultUserPhoto;
  const isSSO = infoPanelSelection.isSSO || false;
  const displayName = infoPanelSelection.displayName
    ? decode(infoPanelSelection.displayName).trim()
    : "";

  return (
    <StyledAccountsItemTitle
      isPending={isPending}
      isSSO={isSSO}
      ref={itemTitleRef}
    >
      <Avatar
        className="avatar"
        role={infoPanelSelection.role ? infoPanelSelection.role : "user"}
        size={"big"}
        source={userAvatar}
      />
      <div className="info-panel__info-text">
        <div className="info-panel__info-wrapper">
          <Text
            className={"info-text__name"}
            noSelect
            title={displayName}
            truncate
          >
            {isPending || !displayName ? infoPanelSelection.email : displayName}
          </Text>
          {isPending && (
            <Badges
              withoutPaid={true}
              statusType={infoPanelSelection.statusType}
            />
          )}
        </div>
        {!isPending && !!displayName && (
          <Text className={"info-text__email"} title={infoPanelSelection.email}>
            {infoPanelSelection.email}
          </Text>
        )}
        {isSSO && (
          <Badge
            className="sso-badge"
            label={t("Common:SSO")}
            color={"#FFFFFF"}
            backgroundColor="#22C386"
            fontSize={"9px"}
            fontWeight={800}
            noHover
            lineHeight={"13px"}
          />
        )}
      </div>
      {!!contextOptions.length && (
        <ContextMenuButton
          id="info-accounts-options"
          className="context-button"
          getData={getData}
        />
      )}
    </StyledAccountsItemTitle>
  );
};

export default withTranslation([
  "People",
  "PeopleTranslations",
  "InfoPanel",
  "Common",
  "Translations",
  "DeleteProfileEverDialog",
])(AccountsItemTitle);
