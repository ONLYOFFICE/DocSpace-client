import { useState, ChangeEvent } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import toastr from "@docspace/components/toast/toastr";
import { observer, inject } from "mobx-react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GroupParams } from "./types";
import { createGroup } from "@docspace/common/api/groups";
import GroupNameParam from "./sub-components/GroupNameParam";
import HeadOfGroup from "./sub-components/HeadOfGroupParam";
import MembersParam from "./sub-components/MembersParam";

interface CreateGroupDialogProps {
  visible: boolean;
  onClose: () => void;
  getGroups: () => void;
}

const CreateGroupDialog = ({
  visible,
  onClose,
  getGroups,
}: CreateGroupDialogProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [groupParams, setGroupParams] = useState<GroupParams>({
    groupName: "",
    groupManager: null,
    groupMembers: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onChangeGroupName = (e: ChangeEvent<HTMLInputElement>) =>
    setGroupParams({ ...groupParams, groupName: e.target.value });

  const setGroupManager = (groupManager: object | null) =>
    setGroupParams({ ...groupParams, groupManager });

  const setGroupMembers = (groupMembers: object[]) =>
    setGroupParams({ ...groupParams, groupMembers });

  const onCreateGroup = async () => {
    setIsLoading(true);

    const groupManagerId = groupParams.groupManager.id;
    const groupMemebersIds = groupParams.groupMembers.map((gm) => gm.id);

    createGroup(groupParams.groupName, groupManagerId, groupMemebersIds)
      .then(() => {
        navigate("/accounts/groups/filter");
        getGroups();
      })
      .catch((err) => toastr.error(err.message))
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  return (
    <ModalDialog
      displayType="aside"
      withBodyScroll
      visible={visible}
      onClose={onClose}
      withFooterBorder
      //   isScrollLocked={isScrollLocked}
      //   isOauthWindowOpen={isOauthWindowOpen}
    >
      <ModalDialog.Header>Create department</ModalDialog.Header>

      <ModalDialog.Body>
        <GroupNameParam
          groupName={groupParams.groupName}
          onChangeGroupName={onChangeGroupName}
        />
        <HeadOfGroup
          groupManager={groupParams.groupManager}
          setGroupManager={setGroupManager}
          onClose={onClose}
        />
        <MembersParam
          groupManager={groupParams.groupManager}
          groupMembers={groupParams.groupMembers}
          setGroupMembers={setGroupMembers}
          onClose={onClose}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="create-group-modal_submit"
          tabIndex={5}
          label={t("Common:Create")}
          size="normal"
          primary
          scale
          onClick={onCreateGroup}
          isDisabled={!groupParams.groupManager || !groupParams.groupName}
          isLoading={isLoading}
        />
        <Button
          id="create-group-modal_cancel"
          tabIndex={5}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          isDisabled={isLoading}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ peopleStore }) => ({
  getGroups: peopleStore.groupsStore.getGroups,
}))(observer(CreateGroupDialog));
