import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { observer, inject } from "mobx-react";
import { useState, useEffect, useTransition } from "react";
import { getGroupMembersInRoom } from "@docspace/shared/api/groups";
import User from "SRC_DIR/pages/Home/InfoPanel/Body/views/Members/User";
import MembersHelper from "SRC_DIR/pages/Home/InfoPanel/Body/helpers/MembersHelper";
import { useTranslation } from "react-i18next";
import { InputSize } from "@docspace/shared/components/text-input";
import { SearchInput } from "@docspace/shared/components/search-input";

interface EditGroupMembersProps {
  selfId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const EditGroupMembers = ({
  infoPanelSelection,
  selfId,
  groupId,
  visible,
  setVisible,
}: EditGroupMembersProps) => {
  const { t } = useTranslation(["Common"]);
  const membersHelper = new MembersHelper({ t });

  const [searchValue, setSearchValue] = useState<string>("");
  const onChangeSearchValue = (newValue: string) => {
    setSearchValue(newValue);
  };
  const onClearSearch = () => onChangeSearchValue("");

  const [groupMembers, setGroupMembers] = useState<any[] | null>(null);
  const filteredGroupMembers = groupMembers?.filter((groupMember) =>
    groupMember.user.displayName.includes(searchValue),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const onClose = () => setVisible(false);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      setIsLoading(true);

      console.log("infoPanelSelection", infoPanelSelection);
      getGroupMembersInRoom(infoPanelSelection.id, groupId)!
        .then((data: any) => {
          startTransition(() => setGroupMembers(data.items));
          console.log(data);
        })
        .catch((err: any) => console.error(err))
        .finally(() => setIsLoading(false));
    };
    fetchGroup();
  }, [groupId]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
    >
      <ModalDialog.Header>EditGroupMembers</ModalDialog.Header>

      <ModalDialog.Body>
        <SearchInput
          className="search-input"
          placeholder={"Search by group members"}
          value={""}
          onChange={onChangeSearchValue}
          onClearSearch={onClearSearch}
          size={InputSize.base}
        />

        <div style={{ height: "12px", width: "100%" }} />

        {filteredGroupMembers &&
          filteredGroupMembers.map(({ user, groupAccess, canEditAccess }) => (
            <div key={user.id} style={{ paddingRight: "12px" }}>
              <User
                t={t}
                key={user.id}
                user={{ ...user, access: groupAccess, canEditAccess }}
                membersHelper={membersHelper}
                currentMember={{ id: selfId }}
              />
            </div>
          ))}
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ infoPanelStore, userStore, dialogsStore }) => ({
  infoPanelSelection: infoPanelStore.infoPanelSelection,
  selfId: userStore.user.id,
  groupId: dialogsStore.editMembersGroupId,
  visible: dialogsStore.editGroupMembersDialogVisible,
  setVisible: dialogsStore.setEditGroupMembersDialogVisible,
}))(observer(EditGroupMembers));
