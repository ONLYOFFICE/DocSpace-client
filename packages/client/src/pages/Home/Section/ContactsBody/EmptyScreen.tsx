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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@docspace/ui-kit/context";

import {
  EmptyView,
  EmptyViewOptionsType,
} from "@docspace/shared/components/empty-view";
import { UserStore } from "@docspace/shared/store/UserStore";
import type { TUser } from "@docspace/shared/api/people/types";
import type { Nullable } from "@docspace/shared/types";

import InviteUserIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";
import TrashIcon from "PUBLIC_DIR/images/emptyview/trash.svg";
import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import EmptyScreenPersonSvgLight from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.light.svg";
import EmptyScreenPersonSvgDark from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.dark.svg";

import { editGroup, resetFilter } from "SRC_DIR/helpers/contacts";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import { classNames } from "@docspace/shared/utils";

type EmptyScreenProps = {
  isRoomAdmin?: TUser["isRoomAdmin"];
  contactsTab?: UsersStore["contactsTab"];
  isFiltered?: UsersStore["isFiltered"];
  currentGroup?: GroupsStore["currentGroup"];
  setIsSectionBodyLoading?: ClientLoadingStore["setIsSectionBodyLoading"];
  deleteGroup?: GroupsStore["deleteGroup"];
  getContactsModel?: PeopleStore["contextOptionsStore"]["getContactsModel"];
};

const EmptyScreen = ({
  isRoomAdmin,
  contactsTab,
  currentGroup,
  isFiltered,
  setIsSectionBodyLoading,
  deleteGroup,
  getContactsModel,
}: EmptyScreenProps) => {
  const { t } = useTranslation([
    "People",
    "PeopleTranslations",
    "Common",
    "EmptyView",
    "DeleteDialog",
  ]);
  const { isBase } = useTheme();

  const isEmptyGroup = contactsTab === "inside_group";
  const isEmptyGuests = contactsTab === "guests";

  const title = isEmptyGuests
    ? isFiltered
      ? t("Common:NotFoundGuestsFilter")
      : t("Common:NotFoundGuests")
    : t("Common:NotFoundMembers");

  const description = isEmptyGuests
    ? isFiltered
      ? t("Common:NotFoundFilterGuestsDescription")
      : t("Common:NotFoundGuestsDescription")
    : isEmptyGroup
      ? t("Common:EmptyGroupDescription")
      : t("Common:NotFoundUsersDescription");

  const setIsLoading = (param: boolean) => {
    setIsSectionBodyLoading?.(param);
  };

  const onResetFilter = (event: React.MouseEvent) => {
    event.preventDefault();

    setIsLoading(true);

    resetFilter(contactsTab!, currentGroup?.id);
  };

  const icon = isBase ? (
    <EmptyScreenPersonSvgLight />
  ) : (
    <EmptyScreenPersonSvgDark />
  );

  const getOptions = (): Nullable<EmptyViewOptionsType> => {
    if (isEmptyGroup && currentGroup) {
      return [
        {
          key: "group-add-user",
          title: t("PeopleTranslations:AddMembers"),
          description: t("EmptyView:EmptyGroupAddedUserOptionDescription"),
          disabled: isRoomAdmin || currentGroup?.isLDAP,
          icon: <InviteUserIcon />,
          onClick: () => editGroup(currentGroup),
        },
        {
          key: "delete-group",
          title: t("DeleteDialog:DeleteGroupTitle"),
          description: t("EmptyView:EmptyGroupDeleteOptionDescription"),
          disabled: isRoomAdmin || currentGroup?.isLDAP,
          icon: <TrashIcon />,
          onClick: () => deleteGroup!(currentGroup, true),
        },
      ];
    }

    if (isFiltered)
      return [
        {
          key: "empty-view-invite-new-users",
          title: t("EmptyView:InviteNewUsers"),
          description: t("EmptyView:SendInvitationLetter"),
          disabled: isRoomAdmin || currentGroup?.isLDAP || isEmptyGuests,
          icon: <InviteUserIcon />,
          model: (getContactsModel?.(t, false) ?? []).filter(
            (m) => typeof m !== "boolean",
          ) as ContextMenuModel[],
        },
        {
          to: "",
          className: classNames({
            "empty-view--margin": !isEmptyGuests,
          }),
          description: t("Common:ClearFilter"),
          icon: <ClearEmptyFilterSvg />,
          onClick: onResetFilter,
          key: "empty-view-contacts-clear-filter",
        },
      ];

    return null;
  };

  return (
    <EmptyView
      icon={icon}
      title={title}
      options={getOptions()}
      description={description}
    />
  );
};

export default inject(
  ({
    peopleStore,
    clientLoadingStore,
    userStore,
  }: {
    peopleStore: PeopleStore;
    clientLoadingStore: ClientLoadingStore;
    userStore: UserStore;
  }) => {
    const { groupsStore, usersStore } = peopleStore;

    const { deleteGroup, currentGroup } = groupsStore!;
    const { contactsTab, isFiltered } = usersStore!;

    const { setIsSectionBodyLoading } = clientLoadingStore;

    const isRoomAdmin = userStore.user!.isRoomAdmin;

    return {
      isRoomAdmin,

      isFiltered,

      currentGroup,
      contactsTab,

      setIsSectionBodyLoading,

      deleteGroup,
      getContactsModel: peopleStore.contextOptionsStore.getContactsModel,
    };
  },
)(observer(EmptyScreen));
