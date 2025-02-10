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

import { Events } from "@docspace/shared/enums";
import { EmptyView } from "@docspace/shared/components/empty-view";

import EmptyGroupLightIcon from "PUBLIC_DIR/images/emptyview/empty.groups.light.svg";
import EmptyGroupDarkIcon from "PUBLIC_DIR/images/emptyview/empty.groups.dark.svg";
import EmptyScreenPersonSvgLight from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.light.svg";
import EmptyScreenPersonSvgDark from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.dark.svg";
import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import GroupIcon from "PUBLIC_DIR/images/emptyview/group.svg";

import { resetContactsGroupsFilter } from "SRC_DIR/helpers/contacts";

type EmptyScreenGroupsProps = {
  isRoomAdmin?: boolean;
  isCollaborator?: boolean;
  groupsIsFiltered?: boolean;
  setIsLoading?: (value: boolean) => void;
};

const EmptyScreenGroups = ({
  isRoomAdmin,
  isCollaborator,
  groupsIsFiltered,
  setIsLoading,
}: EmptyScreenGroupsProps) => {
  const { t } = useTranslation([
    "People",
    "PeopleTranslations",
    "EmptyView",
    "Common",
  ]);

  const theme = useTheme();

  const onCreateGroup = () => {
    const event = new Event(Events.GROUP_CREATE);

    window.dispatchEvent(event);
  };

  const onResetFilter = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsLoading!(true);
    resetContactsGroupsFilter();
  };

  const title = groupsIsFiltered
    ? t("Common:NotFoundGroups")
    : t("Common:NoGroupsHere");

  const getIcon = () => {
    if (groupsIsFiltered) {
      return theme.isBase ? (
        <EmptyScreenPersonSvgLight />
      ) : (
        <EmptyScreenPersonSvgDark />
      );
    }

    return theme.isBase ? <EmptyGroupLightIcon /> : <EmptyGroupDarkIcon />;
  };

  const getDescription = () => {
    if (groupsIsFiltered) return t("Common:GroupsNotFoundDescription");

    return t("Common:ThisSectionIsEmpty");
  };

  const getOptions = () => {
    if (groupsIsFiltered) {
      return [
        {
          to: "",
          description: t("Common:ClearFilter"),
          icon: <ClearEmptyFilterSvg />,
          onClick: onResetFilter,
          key: "empty-view-groups-clear-filter",
        },
      ];
    }

    if (isRoomAdmin || isCollaborator) return [];

    return [
      {
        key: "create-group-option",
        title: t("PeopleTranslations:CreateGroup"),
        description: t("EmptyView:EmptyGroupsCreateGroupOptionDescription"),
        icon: <GroupIcon />,
        disabled: isRoomAdmin,
        onClick: onCreateGroup,
      },
    ];
  };

  return (
    <EmptyView
      title={title}
      description={getDescription()}
      icon={getIcon()}
      options={getOptions()}
    />
  );
};

export default inject(
  ({ peopleStore, clientLoadingStore, userStore }: TStore) => {
    const { isRoomAdmin, isCollaborator } = userStore.user!;
    const { groupsIsFiltered } = peopleStore.groupsStore!;

    const { setIsSectionBodyLoading } = clientLoadingStore;

    const setIsLoading = (param: boolean) => {
      setIsSectionBodyLoading(param);
    };

    return {
      isRoomAdmin,
      isCollaborator,
      groupsIsFiltered,
      setIsLoading,
    };
  },
)(observer(EmptyScreenGroups));
