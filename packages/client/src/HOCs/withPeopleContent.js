/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@docspace/ui-kit/components/avatar";
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
