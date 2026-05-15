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

  const { isBase } = useTheme();

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
      return isBase ? (
        <EmptyScreenPersonSvgLight />
      ) : (
        <EmptyScreenPersonSvgDark />
      );
    }

    return isBase ? <EmptyGroupLightIcon /> : <EmptyGroupDarkIcon />;
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
        title: t("Common:CreateGroup"),
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
