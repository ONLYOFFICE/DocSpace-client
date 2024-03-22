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
