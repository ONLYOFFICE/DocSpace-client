import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Link } from "@docspace/shared/components/link";
import { LinkWithDropdown } from "@docspace/shared/components/link-with-dropdown";
import { Avatar } from "@docspace/shared/components/avatar";

export default function withContent(WrappedContent) {
  const WithContent = (props) => {
    const {
      item,
      checked,
      selectUser,
      deselectUser,
      setBufferSelection,

      theme,
      getModel,
      itemIndex,
    } = props;

    const { mobilePhone, email, role, displayName, avatar } = item;

    const onContentRowSelect = (checked, user) => {
      checked ? selectUser(user) : deselectUser(user);
    };

    const onContentRowClick = (checked, user, addToSelection = true) => {
      checked
        ? setBufferSelection(user, addToSelection)
        : setBufferSelection(null);
    };

    const checkedProps = { checked };

    const element = (
      <Avatar size="min" role={role} userName={displayName} source={avatar} />
    );

    const onPhoneClick = () => window.open(`sms:${mobilePhone}`);
    const onEmailClick = () => window.open(`mailto:${email}`);

    const { t } = useTranslation([
      "People",
      "Common",
      "PeopleTranslations",
      "DeleteProfileEverDialog",
      "Translations",
      "Files",
      "ChangeUserTypeDialog",
      "DataReassignmentDialog",
    ]);

    const contextOptionsProps = {
      contextOptions: getModel(item, t),
    };

    let value = `folder_${item.id}`;
    value += "_false";
    value += `_index_${itemIndex}`;

    return (
      <WrappedContent
        onContentRowSelect={onContentRowSelect}
        onContentRowClick={onContentRowClick}
        onPhoneClick={onPhoneClick}
        onEmailClick={onEmailClick}
        groups={[]}
        checkedProps={checkedProps}
        element={element}
        contextOptionsProps={contextOptionsProps}
        value={value}
        {...props}
      />
    );
  };

  return inject(({ settingsStore, peopleStore, userStore }, { item }) => {
    const { theme, standalone } = settingsStore;

    const { getTargetUser } = peopleStore.targetUserStore;
    const { selectionStore, contextOptionsStore } = peopleStore;

    const { getModel } = contextOptionsStore;

    const {
      selection,
      bufferSelection,
      setBufferSelection,
      selectUser,
      deselectUser,
    } = selectionStore;

    return {
      theme,
      standalone,
      currentUserId: userStore.user.id,
      fetchProfile: getTargetUser,
      checked: selection.some((el) => el.id === item.id),
      isSeveralSelection: selection.length > 1,
      isActive: bufferSelection?.id === item?.id,
      setBufferSelection,
      selectUser,
      deselectUser,
      getModel,
    };
  })(observer(WithContent));
}
