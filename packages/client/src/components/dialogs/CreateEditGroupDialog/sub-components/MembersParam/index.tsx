import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";
import * as Styled from "./index.styled";
import SelectGroupMembersPanel from "./SelectGroupMembersPanel";
import GroupMemberRow from "../GroupMemberRow";

interface MembersParamProps {
  groupManager: object | null;
  groupMembers: object[] | null;
  setGroupMembers: (groupMembers: object[]) => void;
  onShowSelectMembersPanel: () => void;
}

const MembersParam = ({
  groupManager,
  groupMembers,
  setGroupMembers,
  onShowSelectMembersPanel,
}: MembersParamProps) => {
  const { t } = useTranslation(["Common", "PeopleTranslation"]);

  const onRemoveUserById = (id: string) => {
    const newGroupMembers = groupMembers?.filter((gm) => gm.id !== id);
    setGroupMembers(newGroupMembers || []);
  };

  return (
    <div>
      <Styled.Header>{t("Common:Members")}</Styled.Header>

      <Styled.AddMembersButton onClick={onShowSelectMembersPanel}>
        <SelectorAddButton iconName={PlusSvgUrl} />
        <div className="label">{t("PeopleTranslations:AddMembers")}</div>
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
