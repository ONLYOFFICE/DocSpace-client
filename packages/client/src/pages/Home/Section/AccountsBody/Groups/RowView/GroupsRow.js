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

import { inject, observer } from "mobx-react";
import * as Styled from "./index.styled";
import { Link } from "@docspace/shared/components/link";
import { withTranslation } from "react-i18next";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import Badges from "../../Badges";

const GroupsRow = ({
  t,
  item,
  selection,
  bufferSelection,
  getGroupContextOptions,
  getModel,
  sectionWidth,
  theme,
  openGroupAction,
  changeGroupSelection,
  changeGroupContextSelection,
}) => {
  const isChecked = selection.some((el) => el.id === item.id);
  const isActive = bufferSelection?.id === item?.id;

  const onSelect = () => {
    changeGroupSelection(item, isChecked);
  };

  const onRowContextClick = (rightMouseButtonClick) => {
    changeGroupContextSelection(item, !rightMouseButtonClick);
  };

  const onOpenGroup = (e) => {
    openGroupAction(item.id, true, item.name, e);
  };

  const nameColor =
    item.statusType === "pending" || item.statusType === "disabled"
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.sideInfoColor;

  const titleWithoutSpaces = item.name.replace(/\s+/g, " ").trim();
  const indexAfterLastSpace = titleWithoutSpaces.lastIndexOf(" ");
  const secondCharacter =
    indexAfterLastSpace === -1
      ? ""
      : titleWithoutSpaces[indexAfterLastSpace + 1];

  const groupName = (item.name[0] + secondCharacter).toUpperCase();

  const getContextModel = () => getModel(t, item);

  return (
    <Styled.GroupsRowWrapper
      isChecked={isChecked}
      isActive={isActive}
      className={`group-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      } ${item.id}`}
      value={item.id}
    >
      <div className={"group-item"}>
        <Styled.GroupsRow
          key={item.id}
          data={item}
          onContextClick={onRowContextClick}
          onSelect={onSelect}
          onDoubleClick={onOpenGroup}
          onFilesClick={onOpenGroup}
          element={
            <Avatar
              size={AvatarSize.min}
              userName={item.name}
              isGroup={true}
              role={AvatarRole.none}
              source=""
            />
          }
          checked={isChecked}
          isActive={isActive}
          contextOptions={getGroupContextOptions(t, item)}
          getContextModel={getContextModel}
          sectionWidth={sectionWidth}
          mode={"modern"}
          className={"group-row"}
        >
          <Styled.GroupsRowContent
            sideColor={sideInfoColor}
            sectionWidth={sectionWidth}
            nameColor={nameColor}
            sideInfoColor={sideInfoColor}
          >
            <Link
              key={"group-title"}
              containerWidth="28%"
              target="_blank"
              title={item.name}
              fontWeight={600}
              fontSize="15px"
              lineHeight="20px"
              color={nameColor}
              isTextOverflow={true}
              onClick={onOpenGroup}
              dir="auto"
            >
              {item.name}
            </Link>

            <Badges isLDAP={item.isLDAP} />

            <Link
              key={"group-title"}
              containerWidth="28%"
              target="_blank"
              title={item.name}
              fontWeight={600}
              fontSize="15px"
              lineHeight="20px"
              color={nameColor}
              isTextOverflow={true}
              onClick={onOpenGroup}
            >
              {t("PeopleTranslations:PeopleCount", {
                count: item.membersCount,
              })}
            </Link>
          </Styled.GroupsRowContent>
        </Styled.GroupsRow>
      </div>
    </Styled.GroupsRowWrapper>
  );
};

export default inject(({ peopleStore, settingsStore }) => ({
  selection: peopleStore.groupsStore.selection,
  bufferSelection: peopleStore.groupsStore.bufferSelection,
  getGroupContextOptions: peopleStore.groupsStore.getGroupContextOptions,
  getModel: peopleStore.groupsStore.getModel,
  openGroupAction: peopleStore.groupsStore.openGroupAction,
  changeGroupSelection: peopleStore.groupsStore.changeGroupSelection,
  changeGroupContextSelection:
    peopleStore.groupsStore.changeGroupContextSelection,
  theme: settingsStore.theme,
}))(
  withTranslation(
    "People",
    "Common",
    "PeopleTranslations",
  )(observer(GroupsRow)),
);
