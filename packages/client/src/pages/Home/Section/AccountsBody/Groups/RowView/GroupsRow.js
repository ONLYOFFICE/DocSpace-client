import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import * as Styled from "./index.styled";
import { Link } from "@docspace/shared/components/link";
import { withTranslation } from "react-i18next";

const GroupsRow = ({
  t,
  item,
  itemIndex,
  selection,
  setSelection,
  bufferSelection,
  setBufferSelection,
  setCurrentGroup,
  getGroupContextOptions,
  sectionWidth,
  theme,
}) => {
  const navigate = useNavigate();

  const isChecked = selection.some((el) => el.id === item.id);
  const isActive = bufferSelection?.id === item?.id;

  const onRowClick = (e) => {
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
    setCurrentGroup(item);
    navigate(`/accounts/groups/${item.id}/filter`);
  };

  const nameColor =
    item.statusType === "pending" || item.statusType === "disabled"
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.pendingSideInfoColor;

  const contextOptionsProps = {
    contextOptions: getGroupContextOptions(t, item),
  };

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
          element={<div className="group-row-element">{groupName}</div>}
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
            {[
              <Link
                containerWidth="28%"
                target="_blank"
                title={item.name}
                fontWeight={600}
                fontSize="15px"
                color={nameColor}
                isTextOverflow={true}
                onClick={onOpenGroup}
              >
                {item.name}
              </Link>,
            ]}
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
  setCurrentGroup: peopleStore.groupsStore.setCurrentGroup,
  getGroupContextOptions: peopleStore.groupsStore.getGroupContextOptions,
  theme: settingsStore.theme,
}))(
  withTranslation(
    "People",
    "Common",
    "PeopleTranslations",
  )(observer(GroupsRow)),
);
