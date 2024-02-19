import { useEffect, useState, ChangeEvent } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { observer, inject } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { EditGroupParams } from "./types";
import {
  createGroup,
  getGroupById,
  updateGroup,
} from "@docspace/shared/api/groups";

import GroupNameParam from "./sub-components/GroupNameParam";
import HeadOfGroup from "./sub-components/HeadOfGroupParam";
import MembersParam from "./sub-components/MembersParam";

interface EditGroupDialogProps {
  group: {
    members: object[];
    [key: string]: any;
  };
  visible: boolean;
  onClose: () => void;
  getGroups: () => void;
}

const EditGroupDialog = ({
  group,
  visible,
  onClose,
  getGroups,
}: EditGroupDialogProps) => {
  const { t } = useTranslation(["PeopleTranslations", "Common"]);
  const navigate = useNavigate();

  const [isCreateGroupLoading, setCreateGroupIsLoading] =
    useState<boolean>(false);

  const [isFetchMembersLoading, setFetchMembersIsLoading] =
    useState<boolean>(false);

  const [groupParams, setGroupParams] = useState<EditGroupParams>({
    groupName: group.name,
    groupManager: group.manager,
    groupMembers: null,
  });

  const onChangeGroupName = (e: ChangeEvent<HTMLInputElement>) =>
    setGroupParams({ ...groupParams, groupName: e.target.value });

  const setGroupManager = (groupManager: object | null) =>
    setGroupParams({ ...groupParams, groupManager });

  const setGroupMembers = (groupMembers: object[]) =>
    setGroupParams({ ...groupParams, groupMembers });

  const onEditGroup = async () => {
    setCreateGroupIsLoading(true);

    const groupManagerId = groupParams.groupManager?.id;
    const groupMembersIds = groupParams.groupMembers?.map((gm) => gm.id) || [];

    updateGroup(
      group.id,
      groupParams.groupName,
      groupManagerId,
      groupMembersIds
    )!
      .then(() => {
        navigate("/accounts/groups/filter");
        getGroups();
      })
      .catch((err) => toastr.error(err.message))
      .finally(() => {
        setCreateGroupIsLoading(false);
        onClose();
      });
  };

  useEffect(() => {
    if (groupParams.groupMembers) return;
    setFetchMembersIsLoading(true);

    getGroupById(group.id)!
      .then((data: any) => setGroupMembers(data.members))
      .catch((err) => console.error(err))
      .finally(() => setFetchMembersIsLoading(false));
  }, [group.id]);

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
      <ModalDialog.Header>
        {t("PeopleTranslations:EditGroup")}
      </ModalDialog.Header>

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
        {isFetchMembersLoading ? (
          <div>LOADING</div>
        ) : (
          <MembersParam
            groupManager={groupParams.groupManager}
            groupMembers={groupParams.groupMembers}
            setGroupMembers={setGroupMembers}
            onClose={onClose}
          />
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="edit-group-modal_submit"
          tabIndex={5}
          label={t("Common:SaveButton")}
          size="normal"
          primary
          scale
          onClick={onEditGroup}
          isDisabled={!groupParams.groupManager || !groupParams.groupName}
          isLoading={isCreateGroupLoading}
        />
        <Button
          id="edit-group-modal_cancel"
          tabIndex={5}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          isDisabled={isCreateGroupLoading}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ peopleStore }) => ({
  getGroups: peopleStore.groupsStore.getGroups,
}))(observer(EditGroupDialog));
