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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

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
  const theme = useTheme();

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

  const icon = theme.isBase ? (
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
