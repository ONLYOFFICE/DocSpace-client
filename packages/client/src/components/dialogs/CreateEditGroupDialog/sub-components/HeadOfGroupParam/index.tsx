import { IconButton } from "@docspace/shared/components/icon-button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PlusSvgUrl from "PUBLIC_DIR/images/plus.svg?url";
import GroupMemberRow from "../GroupMemberRow";
import SelectGroupManagerPanel from "./SelectGroupManagerPanel";
import * as Styled from "./index.styled";

interface HeadOfGroupProps {
  groupManager: object | null;
  setGroupManager: (groupManager: object | null) => void;
  groupMembers: object[] | null;
  setGroupMembers: (groupMembers: object[]) => void;
  onClose: () => void;
}

const HeadOfGroup = ({
  groupManager,
  setGroupManager,
  groupMembers,
  setGroupMembers,
  onClose,
}: HeadOfGroupProps) => {
  const { t } = useTranslation(["Common"]);

  const [selectGroupMangerPanelIsVisible, setSelectGroupMangerPanelIsVisible] =
    useState<boolean>(false);

  const onShowSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(true);

  const onHideSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(false);

  const onRemoveGroupManager = () => {
    setGroupManager(null);
    setGroupMembers(
      groupMembers?.filter((gm) => gm.id !== groupManager!.id) || [],
    );
  };

  if (selectGroupMangerPanelIsVisible) {
    return (
      <SelectGroupManagerPanel
        isVisible={selectGroupMangerPanelIsVisible}
        onClose={onHideSelectGroupManagerPanel}
        onParentPanelClose={onClose}
        setGroupManager={setGroupManager}
      />
    );
  }

  return (
    <div>
      <Styled.Header>{t("Common:HeadOfGroup")}</Styled.Header>

      {!groupManager ? (
        <Styled.SelectGroupManager onClick={onShowSelectGroupManagerPanel}>
          <div className="add-button">
            <IconButton className="plus-icon" size="12" iconName={PlusSvgUrl} />
          </div>
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
