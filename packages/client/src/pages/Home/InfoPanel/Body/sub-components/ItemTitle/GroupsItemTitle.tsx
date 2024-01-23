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
  selection,
  getUserContextOptions,
}) => {
  if (isSeveralItems) return null;

  const itemTitleRef = useRef();

  const getData = () => {
    const newOptions = selection.options?.filter((o) => o !== "details");
    return getUserContextOptions(t, newOptions || [], selection);
  };
  const contextOptions = getData();

  const userAvatar = selection.hasAvatar ? selection.avatar : DefaultUserPhoto;
  const groupName = selection.name ? decode(selection.name).trim() : "";

  return (
    <StyledAccountsItemTitle ref={itemTitleRef}>
      <Avatar
        className="avatar"
        role={selection.role ? selection.role : "user"}
        size={"big"}
        source={userAvatar}
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
          <Text className={"info-text__email"} title={selection.email}>
            {`${selection.members?.length} ${
              selection.members?.length === 1 ? "person" : "people"
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
