import { IconButton } from "@docspace/shared/components/icon-button";
import * as Styled from "./index.styled";
import PlusSvgUrl from "PUBLIC_DIR/images/plus.svg?url";
import { useState } from "react";
import SelectGroupMembersPanel from "./SelectGroupMembersPanel";
import GroupMemberRow from "../GroupMemberRow";

interface MembersParamProps {
  groupManager: object | null;
  groupMembers: object[];
  setGroupMembers: (groupMembers: object[]) => void;
  onClose: () => void;
}

const MembersParam = ({
  groupManager,
  groupMembers,
  setGroupMembers,
  onClose,
}: MembersParamProps) => {
  const [selectMembersPanelIsVisible, setSelectMembersPanelIsVisible] =
    useState<boolean>(false);

  const onShowSelectMembersPanel = () => setSelectMembersPanelIsVisible(true);
  const onHideSelectMembersPanel = () => setSelectMembersPanelIsVisible(false);

  const onRemoveUserById = (id: string) => {
    const newGroupMembers = groupMembers.filter((gm) => gm.id !== id);
    setGroupMembers(newGroupMembers);
  };

  if (selectMembersPanelIsVisible) {
    return (
      <SelectGroupMembersPanel
        isVisible={selectMembersPanelIsVisible}
        onClose={onHideSelectMembersPanel}
        onParentPanelClose={onClose}
        groupManager={groupManager}
        groupMembers={groupMembers}
        setGroupMembers={setGroupMembers}
      />
    );
  }

  return (
    <div>
      <Styled.Header>Members</Styled.Header>

      <Styled.AddMembersButton onClick={onShowSelectMembersPanel}>
        <div className="add-button">
          <IconButton className="plus-icon" size={12} iconName={PlusSvgUrl} />
        </div>
        <div className="label">Add members</div>
      </Styled.AddMembersButton>

      {groupMembers.map(
        (member) =>
          member.id !== groupManager?.id && (
            <GroupMemberRow
              key={member.id}
              groupMember={member}
              onClickRemove={() => onRemoveUserById(member.id)}
            />
          ),
      )}
    </div>
  );
};

export default MembersParam;
