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

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";

import { Link, LinkTarget } from "@docspace/shared/components/link";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { TGroup } from "@docspace/shared/api/groups/types";

import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

import Badges from "../../Badges";

import {
  GroupsRowWrapper,
  GroupsRow,
  GroupsRowContent,
} from "./RowView.styled";

type GroupsRowProps = {
  item: TGroup;
  sectionWidth: number;
  itemIndex: number;
  selection?: GroupsStore["selection"];
  bufferSelection?: GroupsStore["bufferSelection"];
  getGroupContextOptions?: GroupsStore["getGroupContextOptions"];
  getModel?: GroupsStore["getModel"];
  openGroupAction?: GroupsStore["openGroupAction"];
  changeGroupSelection?: GroupsStore["changeGroupSelection"];
  changeGroupContextSelection?: GroupsStore["changeGroupContextSelection"];
};

const GroupsRowComponent = ({
  item,
  itemIndex,
  selection,
  bufferSelection,
  getGroupContextOptions,
  getModel,
  sectionWidth,
  openGroupAction,
  changeGroupSelection,
  changeGroupContextSelection,
}: GroupsRowProps) => {
  const { t } = useTranslation(["People", "Common", "PeopleTranslations"]);
  const theme = useTheme();

  const isChecked = selection?.some((el) => el.id === item.id);
  const isActive = bufferSelection?.id === item?.id;

  const onSelect = () => {
    changeGroupSelection!(item, isChecked ?? false);
  };

  const onRowContextClick = (rightMouseButtonClick?: boolean) => {
    changeGroupContextSelection!(item, !rightMouseButtonClick);
  };

  const onOpenGroup = (e: React.MouseEvent) => {
    console.log("open", item.id, true, item.name, e);
    openGroupAction!(item.id, true, item.name, e);
  };

  const getContextModel = () => getModel!(t, item);

  // used for selection-area
  const value = `group_${item.id}_false_index_${itemIndex}`;

  return (
    <GroupsRowWrapper
      isChecked={isChecked}
      isActive={isActive}
      className={`group-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      } ${item.id}`}
      value={value}
    >
      <div className="group-item">
        <GroupsRow
          key={item.id}
          onContextClick={onRowContextClick}
          onSelect={onSelect}
          isIndexEditingMode={false}
          element={
            <Avatar
              size={AvatarSize.min}
              userName={item.name}
              isGroup
              role={AvatarRole.none}
              source=""
            />
          }
          checked={isChecked ?? false}
          isActive={isActive}
          contextOptions={getGroupContextOptions!(t, item)}
          getContextModel={getContextModel}
          mode="modern"
          className="group-row"
        >
          <GroupsRowContent
            className="group-row-content"
            sectionWidth={sectionWidth}
            sideColor={theme.peopleTableRow.sideInfoColor}
          >
            <Link
              key="group-title"
              target={LinkTarget.blank}
              title={item.name}
              fontWeight={600}
              fontSize="15px"
              lineHeight="20px"
              isTextOverflow
              onClick={onOpenGroup}
              truncate
            >
              {item.name}
            </Link>

            <Badges isLDAP={item.isLDAP} />

            <Link
              target={LinkTarget.blank}
              title={item.name}
              fontWeight={600}
              fontSize="15px"
              lineHeight="20px"
              isTextOverflow
              onClick={onOpenGroup}
            >
              {t("PeopleTranslations:MembersCount", {
                count: item.membersCount,
              })}
            </Link>
          </GroupsRowContent>
        </GroupsRow>
      </div>
    </GroupsRowWrapper>
  );
};

export default inject(({ peopleStore }: TStore) => ({
  selection: peopleStore.groupsStore!.selection,
  bufferSelection: peopleStore.groupsStore!.bufferSelection,
  getGroupContextOptions: peopleStore.groupsStore!.getGroupContextOptions,
  getModel: peopleStore.groupsStore!.getModel,
  openGroupAction: peopleStore.groupsStore!.openGroupAction,
  changeGroupSelection: peopleStore.groupsStore!.changeGroupSelection,
  changeGroupContextSelection:
    peopleStore.groupsStore!.changeGroupContextSelection,
}))(observer(GroupsRowComponent));
