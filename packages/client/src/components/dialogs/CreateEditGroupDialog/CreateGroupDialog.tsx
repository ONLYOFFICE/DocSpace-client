import { useState, ChangeEvent } from "react";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { observer, inject } from "mobx-react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GroupParams } from "./types";
import { createGroup } from "@docspace/shared/api/groups";
import GroupNameParam from "./sub-components/GroupNameParam";
import HeadOfGroup from "./sub-components/HeadOfGroupParam";
import MembersParam from "./sub-components/MembersParam";
import SelectGroupManagerPanel from "./sub-components/HeadOfGroupParam/SelectGroupManagerPanel";
import SelectGroupMembersPanel from "./sub-components/MembersParam/SelectGroupMembersPanel";

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
  const { t } = useTranslation(["Common", "PeopleTranslations"]);

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
    setGroupParams((prevState) => ({ ...prevState, groupMembers }));

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

  const onCreateGroup = async () => {
    setIsLoading(true);

    const groupManagerId = groupParams.groupManager?.id || undefined;
    const groupMembersIds = groupParams.groupMembers.map((gm) => gm.id);

    createGroup(groupParams.groupName, groupManagerId, groupMembersIds)
      .then(() => getGroups())
      .then(() => navigate("/accounts/groups/filter"))
      .catch((err) => toastr.error(err.message))
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

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
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={visible}
      onClose={onClose}
      withFooterBorder
      //   isScrollLocked={isScrollLocked}
      //   isOauthWindowOpen={isOauthWindowOpen}
    >
      <ModalDialog.Header>
        {t("PeopleTranslations:CreateGroup")}
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
        <MembersParam
          groupManager={groupParams.groupManager}
          groupMembers={groupParams.groupMembers}
          setGroupMembers={setGroupMembers}
          onShowSelectMembersPanel={onShowSelectMembersPanel}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="create-group-modal_submit"
          tabIndex={5}
          label={t("Common:Create")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onCreateGroup}
          isDisabled={
            !groupParams.groupName ||
            (!groupParams.groupManager && !groupParams.groupMembers.length)
          }
          isLoading={isLoading}
        />
        <Button
          id="create-group-modal_cancel"
          tabIndex={5}
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
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
