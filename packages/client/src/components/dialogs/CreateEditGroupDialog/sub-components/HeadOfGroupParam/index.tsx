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
  onClose: () => void;
}

const HeadOfGroup = ({
  groupManager,
  setGroupManager,
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
