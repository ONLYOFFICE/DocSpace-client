// (c) Copyright Ascensio System SIA 2010-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { getGroupById } from "@docspace/shared/api/groups";
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
  updateGroup: (
    groupId: string,
    groupName: string,
    groupManager: string,
    membersToAdd: string[],
    membersToRemove: string[],
  ) => Promise<void>;
}

const EditGroupDialog = ({
  group,
  visible,
  onClose,
  updateGroup,
  setInfoPanelSelectedGroup,
}: EditGroupDialogProps) => {
  const { t } = useTranslation(["PeopleTranslations", "Common"]);

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

    await updateGroup(
      group.id,
      groupParams.groupName,
      groupManagerId,
      membersToAdd,
      membersToDelete,
    );

    setCreateGroupIsLoading(false);
    onClose();
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
      .then((data) => {
        setInfoPanelSelectedGroup(data);
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

export default inject(({ peopleStore, infoPanelStore }) => ({
  updateGroup: peopleStore.groupsStore.updateGroup,
  setInfoPanelSelectedGroup: infoPanelStore.setInfoPanelSelectedGroup,
}))(observer(EditGroupDialog));
