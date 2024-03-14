import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGroupById, updateGroup } from "@docspace/shared/api/groups";
import { compareGroupParams } from "./utils";
import { EditGroupParams } from "./types";

import GroupNameParam from "./sub-components/GroupNameParam";
import HeadOfGroup from "./sub-components/HeadOfGroupParam";
import MembersParam from "./sub-components/MembersParam";
import SelectGroupManagerPanel from "./sub-components/HeadOfGroupParam/SelectGroupManagerPanel";
import SelectGroupMembersPanel from "./sub-components/MembersParam/SelectGroupMembersPanel";

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

  const [initialMembersIds, setInitialMembersIds] = useState<string[]>([]);

  const [isCreateGroupLoading, setCreateGroupIsLoading] =
    useState<boolean>(false);

  const [isFetchMembersLoading, setFetchMembersIsLoading] =
    useState<boolean>(false);

  const [groupParams, setGroupParams] = useState<EditGroupParams>({
    groupName: group.name,
    groupManager: group.manager,
    groupMembers: null,
  });

  const prevGroupParams = useRef({ ...groupParams });

  const onChangeGroupName = (e: ChangeEvent<HTMLInputElement>) =>
    setGroupParams((prev) => ({ ...prev, groupName: e.target.value }));

  const setGroupManager = (groupManager: object | null) =>
    setGroupParams((prev) => ({ ...prev, groupManager }));

  const setGroupMembers = (groupMembers: object[]) =>
    setGroupParams((prev) => ({ ...prev, groupMembers }));

  const [selectGroupMangerPanelIsVisible, setSelectGroupMangerPanelIsVisible] =
    useState<boolean>(false);

  const onShowSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(true);
  const onHideSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(false);

  const [selectMembersPanelIsVisible, setSelectMembersPanelIsVisible] =
    useState<boolean>(false);

  const onShowSelectMembersPanel = () => setSelectMembersPanelIsVisible(true);
  const onHideSelectMembersPanel = () => setSelectMembersPanelIsVisible(false);

  const onEditGroup = async () => {
    setCreateGroupIsLoading(true);

    const groupManagerId = groupParams.groupManager?.id || undefined;

    const newMembersIds =
      groupParams.groupMembers?.map((gm: any) => gm.id) || [];
    const membersToAdd = newMembersIds.filter(
      (gm) => !initialMembersIds.includes(gm),
    );
    const membersToDelete = initialMembersIds.filter(
      (gm) => !newMembersIds.includes(gm),
    );

    updateGroup(
      group.id,
      groupParams.groupName,
      groupManagerId,
      membersToAdd,
      membersToDelete,
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

  const notEnoughGroupParamsToEdit =
    !groupParams.groupName ||
    (!groupParams.groupManager && !groupParams.groupMembers?.length);

  const groupParamsNotChanged = compareGroupParams(
    groupParams,
    prevGroupParams.current,
  );

  useEffect(() => {
    if (groupParams.groupMembers) return;
    setFetchMembersIsLoading(true);

    getGroupById(group.id)!
      .then((data: any) => {
        prevGroupParams.current.groupMembers = data.members;
        setInitialMembersIds(data.members.map((gm) => gm.id));
        setGroupMembers(data.members);
      })
      .catch((err) => console.error(err))
      .finally(() => setFetchMembersIsLoading(false));
  }, [group.id]);

  if (selectGroupMangerPanelIsVisible)
    return (
      <SelectGroupManagerPanel
        isVisible={selectGroupMangerPanelIsVisible}
        onClose={onHideSelectGroupManagerPanel}
        onParentPanelClose={onClose}
        setGroupManager={setGroupManager}
      />
    );

  if (selectMembersPanelIsVisible)
    return (
      <SelectGroupMembersPanel
        isVisible={selectMembersPanelIsVisible}
        onClose={onHideSelectMembersPanel}
        onParentPanelClose={onClose}
        groupManager={groupParams.groupManager}
        groupMembers={groupParams.groupMembers}
        setGroupMembers={setGroupMembers}
      />
    );

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
          groupMembers={groupParams.groupMembers}
          setGroupMembers={setGroupMembers}
          onShowSelectGroupManagerPanel={onShowSelectGroupManagerPanel}
        />
        {!isFetchMembersLoading && (
          <MembersParam
            groupManager={groupParams.groupManager}
            groupMembers={groupParams.groupMembers}
            setGroupMembers={setGroupMembers}
            onShowSelectMembersPanel={onShowSelectMembersPanel}
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
          isDisabled={notEnoughGroupParamsToEdit || groupParamsNotChanged}
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
