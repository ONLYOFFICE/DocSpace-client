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

import { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@docspace/shared/components/avatar";
import { getUserAvatarRoleByType } from "@docspace/shared/utils/common";

export default function withContent(WrappedContent) {
  const WithContent = (props) => {
    const {
      checked,
      deselectUser,
      getModel,
      item,
      itemIndex,
      multipleContextMenuAction,
      openGroupAction,
      resetSelections,
      selectRow,
      selectUser,
      setBufferSelection,
      singleContextMenuAction,
    } = props;

    const { mobilePhone, email, role, displayName, avatar } = item;

    const onContentRowSelect = useCallback(
      (isChecked, user) => {
        setBufferSelection(null);
        isChecked ? selectUser(user) : deselectUser(user);
      },
      [setBufferSelection, selectUser, deselectUser],
    );

    const onContextClick = useCallback(
      (elm, isSingleMenu) => {
        isSingleMenu
          ? singleContextMenuAction(elm)
          : multipleContextMenuAction(elm);
      },
      [singleContextMenuAction, multipleContextMenuAction],
    );

    const onContentRowClick = useCallback(
      (e, user) => {
        if (e.detail === 0 || e.target?.tagName === "A") return;

        const selectors = [
          ".checkbox",
          ".table-container_row-checkbox",
          ".type-combobox",
          ".groups-combobox",
          ".paid-badge",
          ".pending-badge",
          ".disabled-badge",
          ".dropdown-container",
        ];

        if (selectors.some((selector) => e.target.closest(selector))) return;

        selectRow(user);
      },
      [selectRow],
    );

    const onOpenGroup = useCallback(
      (groupId, withBackURL, tempTitle) => {
        resetSelections();
        openGroupAction(groupId, withBackURL, tempTitle);
      },
      [resetSelections, openGroupAction],
    );

    const checkedProps = { checked };

    const element = useMemo(
      () => (
        <Avatar
          size="min"
          role={getUserAvatarRoleByType(role)}
          userName={displayName}
          source={avatar}
        />
      ),
      [role, displayName, avatar],
    );

    const onPhoneClick = useCallback(
      () => mobilePhone && window.open(`sms:${mobilePhone}`),
      [mobilePhone],
    );

    const onEmailClick = useCallback(
      () => email && window.open(`mailto:${email}`),
      [email],
    );

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

    const getContextModel = useCallback(
      () => getModel(item, t),
      [getModel, item, t],
    );

    let value = `folder_${item.id}`;
    value += "_false";
    value += `_index_${itemIndex}`;

    return (
      <WrappedContent
        onContentRowSelect={onContentRowSelect}
        onContentRowClick={onContentRowClick}
        onUserContextClick={onContextClick}
        onPhoneClick={onPhoneClick}
        onEmailClick={onEmailClick}
        checkedProps={checkedProps}
        element={element}
        getContextModel={getContextModel}
        value={value}
        onOpenGroup={onOpenGroup}
        {...props}
      />
    );
  };

  return inject(({ settingsStore, peopleStore, userStore }, { item }) => {
    const { theme, standalone } = settingsStore;
    const { getTargetUser } = peopleStore.targetUserStore;
    const { getModel } = peopleStore.contextOptionsStore;
    const { openGroupAction } = peopleStore.groupsStore;
    const {
      selection,
      bufferSelection,
      setBufferSelection,
      selectUser,
      deselectUser,
      selectRow,
      singleContextMenuAction,
      multipleContextMenuAction,
      resetSelections,
      activeUsers,
    } = peopleStore.usersStore;

    const itemId = item.id;
    const checked = selection.some((el) => el.id === itemId);
    const isActive = bufferSelection?.id === itemId;
    const inProgress = activeUsers.some((user) => user.id === itemId);

    return {
      theme,
      standalone,
      currentUserId: userStore.user.id,
      fetchProfile: getTargetUser,
      checked,
      isSeveralSelection: selection.length > 1,
      isActive,
      setBufferSelection,
      selectUser,
      deselectUser,
      getModel,
      selectRow,
      singleContextMenuAction,
      multipleContextMenuAction,
      resetSelections,
      openGroupAction,
      inProgress,
    };
  })(observer(WithContent));
}
