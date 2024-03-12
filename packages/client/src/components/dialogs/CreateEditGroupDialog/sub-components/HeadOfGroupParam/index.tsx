import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import * as Styled from "./index.styled";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";
import SelectGroupManagerPanel from "./SelectGroupManagerPanel";
import GroupMemberRow from "../GroupMemberRow";

interface HeadOfGroupProps {
  groupManager: object | null;
  setGroupManager: (groupManager: object | null) => void;
  groupMembers: object[] | null;
  setGroupMembers: (groupMembers: object[]) => void;
}

const HeadOfGroup = ({
  groupManager,
  setGroupManager,
  groupMembers,
  setGroupMembers,
  onShowSelectGroupManagerPanel,
}: HeadOfGroupProps) => {
  const { t } = useTranslation(["Common"]);

  const onRemoveGroupManager = () => {
    setGroupManager(null);
    setGroupMembers(
      groupMembers?.filter((gm) => gm.id !== groupManager!.id) || [],
    );
  };

  return (
    <div>
      <Styled.Header>{t("Common:HeadOfGroup")}</Styled.Header>

      {!groupManager ? (
        <Styled.SelectGroupManager onClick={onShowSelectGroupManagerPanel}>
          <SelectorAddButton iconName={PlusSvgUrl} />
          <div className="label">{t("Common:SelectAction")}</div>
        </Styled.SelectGroupManager>
      ) : (
        <GroupMemberRow
          groupMember={groupManager}
          onClickRemove={onRemoveGroupManager}
        />
      )}
    </div>
  );
};

export default HeadOfGroup;
