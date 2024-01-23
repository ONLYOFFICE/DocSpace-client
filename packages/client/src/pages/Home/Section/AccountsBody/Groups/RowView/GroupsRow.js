import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import * as Styled from "./index.styled";
import { Link } from "@docspace/shared/components/link";
import { Events } from "@docspace/common/constants";

const GroupsRow = ({
  item,
  itemIndex,
  selection,
  bufferSelection,
  setBufferSelection,
  sectionWidth,
  theme,
}) => {
  const navigate = useNavigate();

  const isChecked = selection.some((el) => el.id === item.id);
  const isActive = bufferSelection?.id === item?.id;

  const onRowClick = () =>
    !isChecked ? setBufferSelection(item, true) : setBufferSelection(null);

  const onRowContextClick = () =>
    !isChecked ? setBufferSelection(item, false) : setBufferSelection(null);

  const onOpenGroup = () => navigate(`/accounts/groups/${item.id}/filter`);

  const nameColor =
    item.statusType === "pending" || item.statusType === "disabled"
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.pendingSideInfoColor;

  const contextOptionsProps = {
    contextOptions: [
      {
        id: "option_profile",
        key: "profile",
        icon: "http://192.168.0.104/static/images/check-box.react.svg",
        label: "Select",
      },
      {
        key: "separator-1",
        isSeparator: true,
      },
      {
        id: "option_change-name",
        key: "change-name",
        icon: "http://192.168.0.104/static/images/pencil.react.svg",
        label: "Edit department",
        onClick: () => {
          const event = new Event(Events.GROUP_EDIT);
          event.item = item;
          window.dispatchEvent(event);
        },
      },
      {
        icon: "http://192.168.0.104/static/images/info.outline.react.svg",
        id: "option_details",
        key: "details",
        onClick: () => {},
      },
      {
        key: "separator-2",
        isSeparator: true,
      },
      {
        id: "option_change-owner",
        key: "change-owner",
        icon: "http://192.168.0.104/static/images/catalog.trash.react.svg",
        label: "Delete",
      },
    ],
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
      value={`folder_${item.id}_false_index_${itemIndex}`}
      isChecked={isChecked}
      isActive={isActive}
      className={`group-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      }`}
    >
      <Styled.GroupsRow
        key={item.id}
        data={item}
        onRowClick={onRowClick}
        onContextClick={onRowContextClick}
        onSelect={onRowClick}
        onDoubleClick={onOpenGroup}
        onFilesClick={onOpenGroup}
        element={
          <div
            style={{
              display: "flex",
              width: "32px",
              height: "32px",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              lineHeight: "16px",
              background: "#ECEEF1",
              color: "#333",
              borderRadius: "50%",
            }}
          >
            {groupName}
          </div>
        }
        checked={isChecked}
        isActive={isActive}
        {...contextOptionsProps}
        sectionWidth={sectionWidth}
        mode={"modern"}
        className={"user-row"}
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
    </Styled.GroupsRowWrapper>
  );
};

export default inject(({ peopleStore, auth }) => ({
  selection: peopleStore.selectionStore.selection,
  bufferSelection: peopleStore.selectionStore.bufferSelection,
  setBufferSelection: peopleStore.selectionStore.setBufferSelection,
  theme: auth.settingsStore.theme,
}))(observer(GroupsRow));
