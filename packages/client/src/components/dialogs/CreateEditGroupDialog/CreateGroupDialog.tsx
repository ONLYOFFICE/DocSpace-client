// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { createGroup } from "@docspace/shared/api/groups";
import { TUser } from "@docspace/shared/api/people/types";
import { TOnSubmit } from "@docspace/shared/components/selector/Selector.types";

import { StyledBodyContent } from "./CreateEditGroupDialog.styled";
import { GroupParams } from "./types";
import GroupNameParam from "./sub-components/GroupNameParam";
import HeadOfGroup from "./sub-components/HeadOfGroupParam";
import MembersParam from "./sub-components/MembersParam";
import SelectGroupManagerPanel from "./sub-components/HeadOfGroupParam/SelectGroupManagerPanel";
import { SelectMembersPanel } from "./sub-components/create-components/SelectMembersPanel";

interface CreateGroupDialogProps {
  visible: boolean;
  onClose: () => void;
}

const CreateGroupDialog = ({ visible, onClose }: CreateGroupDialogProps) => {
  const { t } = useTranslation([
    "Common",
    "PeopleTranslations",
    "InviteDialog",
  ]);

  const [groupParams, setGroupParams] = useState<GroupParams>({
    groupName: "",
    groupManager: null,
    groupMembers: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectGroupMangerPanelIsVisible, setSelectGroupMangerPanelIsVisible] =
    useState<boolean>(false);

  const onChangeGroupName = (e: ChangeEvent<HTMLInputElement>) =>
    setGroupParams({ ...groupParams, groupName: e.target.value });

  const onHideSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(false);
  const setGroupManager = (groupManager: TUser | null) => {
    setGroupParams({ ...groupParams, groupManager });
    setSelectGroupMangerPanelIsVisible(false);
  };
  const setGroupMembers = (groupMembers: TUser[]) =>
    setGroupParams((prevState) => ({ ...prevState, groupMembers }));

  const onShowSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(true);

  const [selectMembersPanelIsVisible, setSelectMembersPanelIsVisible] =
    useState<boolean>(false);

  const onShowSelectMembersPanel = () => setSelectMembersPanelIsVisible(true);
  const onHideSelectMembersPanel = () => setSelectMembersPanelIsVisible(false);

  const removeManager = () => {
    setGroupManager(null);
    setGroupMembers(
      groupParams.groupMembers?.filter(
        (gm) => gm.id !== groupParams.groupManager!.id,
      ) || [],
    );
  };

  const addMembers = (newGroupMembers: TUser[]) => {
    const resultGroupMembers: TUser[] = [...groupParams.groupMembers];
    let showErrorWasSelected = false;

    newGroupMembers.forEach((groupMember) => {
      if (
        groupParams.groupMembers.findIndex((gm) => gm.id === groupMember.id) !==
        -1
      ) {
        showErrorWasSelected = true;
        return;
      }
      resultGroupMembers.push(groupMember);
    });

    if (showErrorWasSelected) {
      toastr.warning(t("InviteDialog:UsersAlreadyAdded"));
    }

    setGroupMembers(resultGroupMembers);
    onHideSelectMembersPanel();
  };

  const removeMember = (member: TUser) => {
    const newGroupMembers = groupParams.groupMembers?.filter(
      (gm) => gm.id !== member.id,
    );
    setGroupMembers(newGroupMembers || []);
  };

  const onCreateGroup = async () => {
    setIsLoading(true);

    const groupManagerId = groupParams.groupManager?.id || undefined;
    const groupMembersIds = groupParams.groupMembers.map((gm) => gm.id);

    try {
      await createGroup(groupParams.groupName, groupManagerId, groupMembersIds);
    } catch (err) {
      toastr.error((err as Error).message);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <>
      <ModalDialog
        displayType={ModalDialogType.aside}
        withBodyScroll
        visible={visible}
        onClose={onClose}
        //   isScrollLocked={isScrollLocked}
        //   isOauthWindowOpen={isOauthWindowOpen}
      >
        <ModalDialog.Header>
          {t("PeopleTranslations:CreateGroup")}
        </ModalDialog.Header>

        <ModalDialog.Body>
          <StyledBodyContent>
            <GroupNameParam
              groupName={groupParams.groupName}
              onChangeGroupName={onChangeGroupName}
            />
            <HeadOfGroup
              groupManager={groupParams.groupManager}
              removeManager={removeManager}
              onShowSelectGroupManagerPanel={onShowSelectGroupManagerPanel}
            />
            <MembersParam
              groupManager={groupParams.groupManager}
              groupMembers={groupParams.groupMembers}
              removeMember={removeMember}
              onShowSelectMembersPanel={onShowSelectMembersPanel}
            />
          </StyledBodyContent>
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

      {selectGroupMangerPanelIsVisible ? (
        <SelectGroupManagerPanel
          onClose={onHideSelectGroupManagerPanel}
          onParentPanelClose={onClose}
          setGroupManager={setGroupManager}
        />
      ) : null}

      {selectMembersPanelIsVisible ? (
        <SelectMembersPanel
          onClose={onHideSelectMembersPanel}
          onParentPanelClose={onClose}
          groupManager={groupParams.groupManager}
          groupMembers={groupParams.groupMembers}
          addMembers={addMembers as unknown as TOnSubmit}
        />
      ) : null}
    </>
  );
};

export default CreateGroupDialog;
