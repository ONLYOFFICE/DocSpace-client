import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { observer, inject } from "mobx-react";
import { useState, useEffect, useTransition } from "react";
import { getGroupMembersInRoom } from "@docspace/shared/api/groups";
import { useTranslation } from "react-i18next";
import { InputSize } from "@docspace/shared/components/text-input";
import { SearchInput } from "@docspace/shared/components/search-input";
import GroupMember from "./GroupMember";
import EmptyContainer from "./EmptyContainer";

interface EditGroupMembersProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  group: any;
  infoPanelSelection: any;
}

const EditGroupMembers = ({
  infoPanelSelection,
  group,
  visible,
  setVisible,
}: EditGroupMembersProps) => {
  const { t } = useTranslation(["Common"]);

  const [searchValue, setSearchValue] = useState<string>("");
  const onChangeSearchValue = (newValue: string) => {
    setSearchValue(newValue);
  };
  const onClearSearch = () => onChangeSearchValue("");

  const [groupMembers, setGroupMembers] = useState<any[] | null>(null);
  const filteredGroupMembers = groupMembers?.filter((groupMember) =>
    groupMember.user.displayName.includes(searchValue),
  );
  const [, startTransition] = useTransition();

  const onClose = () => setVisible(false);

  const isSearchListEmpty =
    filteredGroupMembers && !filteredGroupMembers.length;
  const hasMembers = filteredGroupMembers && filteredGroupMembers.length !== 0;

  useEffect(() => {
    const fetchGroup = async () => {
      if (!group) return;

      getGroupMembersInRoom(infoPanelSelection.id, group.id)!
        .then((data: any) => startTransition(() => setGroupMembers(data.items)))
        .catch((err: any) => console.error(err));
    };
    fetchGroup();
  }, [group, infoPanelSelection.id]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
    >
      <ModalDialog.Header>{group.name}</ModalDialog.Header>

      <ModalDialog.Body>
        <SearchInput
          className="search-input"
          placeholder={t("Search by group members")}
          value={searchValue}
          onChange={onChangeSearchValue}
          onClearSearch={onClearSearch}
          size={InputSize.base}
        />

        <div style={{ height: "12px", width: "100%" }} />

        {isSearchListEmpty && <EmptyContainer />}

        {hasMembers &&
          filteredGroupMembers.map(({ user, ...rest }) => (
            <GroupMember t={t} key={user.id} user={{ ...user, ...rest }} />
          ))}
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ infoPanelStore, userStore, dialogsStore }) => ({
  infoPanelSelection: infoPanelStore.infoPanelSelection,
  selfId: userStore.user.id,
  group: dialogsStore.editMembersGroup,
  visible: dialogsStore.editGroupMembersDialogVisible,
  setVisible: dialogsStore.setEditGroupMembersDialogVisible,
}))(observer(EditGroupMembers));
