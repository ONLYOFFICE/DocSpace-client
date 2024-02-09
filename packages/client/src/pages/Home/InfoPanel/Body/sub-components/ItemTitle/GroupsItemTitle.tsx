import { useRef } from "react";
import { withTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { Avatar } from "@docspace/shared/components/avatar";
import { StyledAccountsItemTitle } from "../../styles/accounts";

import { decode } from "he";

const GroupsItemTitle = ({
  t,
  isSeveralItems,
  infoPanelSelection,
  getUserContextOptions,
}) => {
  if (isSeveralItems) return null;

  const itemTitleRef = useRef();

  const getData = () => {
    const newOptions = infoPanelSelection.options?.filter(
      (o) => o !== "details"
    );
    return getUserContextOptions(t, newOptions || [], infoPanelSelection);
  };
  const contextOptions = getData();

  const userAvatar = infoPanelSelection.hasAvatar
    ? infoPanelSelection.avatar
    : DefaultUserPhoto;
  const groupName = infoPanelSelection.name
    ? decode(infoPanelSelection.name).trim()
    : "";

  return (
    <StyledAccountsItemTitle ref={itemTitleRef}>
      <Avatar
        className="avatar"
        size={"big"}
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
            {`${infoPanelSelection.members?.length} ${
              infoPanelSelection.members?.length === 1 ? "person" : "people"
            }`}
          </Text>
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
])(GroupsItemTitle);
