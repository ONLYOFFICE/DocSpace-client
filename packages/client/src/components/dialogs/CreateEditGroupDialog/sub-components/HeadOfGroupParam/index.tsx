import IconButton from "@docspace/components/icon-button";
import * as Styled from "./index.styled";
import PlusSvgUrl from "PUBLIC_DIR/images/plus.svg?url";
import { useState } from "react";
import SelectGroupManagerPanel from "./SelectGroupManagerPanel";
import GroupMemberRow from "../GroupMemberRow";

interface HeadOfGroupProps {
  groupManager: object | null;
  setGroupManager: (groupManager: object | null) => void;
  onClose: () => void;
}

const HeadOfGroup = ({
  groupManager,
  setGroupManager,
  onClose,
}: HeadOfGroupProps) => {
  const [selectGroupMangerPanelIsVisible, setSelectGroupMangerPanelIsVisible] =
    useState<boolean>(false);

  const onShowSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(true);

  const onHideSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(false);

  const onRemoveGroupManager = () => {
    setGroupManager(null);
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
      <Styled.Header>Head of department</Styled.Header>

      {!groupManager ? (
        <Styled.SelectGroupManager onClick={onShowSelectGroupManagerPanel}>
          <div className="add-button">
            <IconButton className="plus-icon" size="12" iconName={PlusSvgUrl} />
          </div>
          <div className="label">Select</div>
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
