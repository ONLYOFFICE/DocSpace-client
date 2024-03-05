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
