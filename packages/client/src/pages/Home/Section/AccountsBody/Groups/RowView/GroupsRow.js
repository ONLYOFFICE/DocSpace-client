import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import * as Styled from "./index.styled";
import { Link } from "@docspace/shared/components/link";
import { withTranslation } from "react-i18next";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import React from "react";

const GroupsRow = ({
  t,
  item,
  itemIndex,
  selection,
  setSelection,
  bufferSelection,
  setBufferSelection,
  getGroupContextOptions,
  sectionWidth,
  theme,
  openGroupAction,
}) => {
  const isChecked = selection.some((el) => el.id === item.id);
  const isActive = bufferSelection?.id === item?.id;

  const onRowClick = (e) => {
    if (e.target?.tagName === "SPAN" || e.target?.tagName === "A") return;

    setBufferSelection(item);

    if (selection.length === 1 && selection[0].id === item.id) {
      setSelection([]);
      return;
    }

    setSelection([item]);
  };

  const onSelect = (e) => {
    if (!isChecked) setSelection([...selection, item]);
    else setSelection(selection.filter((g) => g.id !== item.id));
  };

  const onRowContextClick = () => {
    setBufferSelection(item);
  };

  const onOpenGroup = () => {
    setSelection([]);
    setBufferSelection(null);
    openGroupAction(item.id, true, item.name);
  };

  const nameColor =
    item.statusType === "pending" || item.statusType === "disabled"
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.pendingSideInfoColor;

  const titleWithoutSpaces = item.name.replace(/\s+/g, " ").trim();
  const indexAfterLastSpace = titleWithoutSpaces.lastIndexOf(" ");
  const secondCharacter =
    indexAfterLastSpace === -1
      ? ""
      : titleWithoutSpaces[indexAfterLastSpace + 1];

  const groupName = (item.name[0] + secondCharacter).toUpperCase();

  return (
    <Styled.GroupsRowWrapper
      isChecked={isChecked}
      isActive={isActive}
      className={`group-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      }`}
      value={item.id}
    >
      <div className={"group-item"}>
        <Styled.GroupsRow
          key={item.id}
          data={item}
          onRowClick={onRowClick}
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
            >
              {item.name}
            </Link>

            <div></div>

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
  setSelection: peopleStore.groupsStore.setSelection,
  bufferSelection: peopleStore.groupsStore.bufferSelection,
  setBufferSelection: peopleStore.groupsStore.setBufferSelection,
  getGroupContextOptions: peopleStore.groupsStore.getGroupContextOptions,
  openGroupAction: peopleStore.groupsStore.openGroupAction,
  theme: settingsStore.theme,
}))(
  withTranslation(
    "People",
    "Common",
    "PeopleTranslations",
  )(observer(GroupsRow)),
);
