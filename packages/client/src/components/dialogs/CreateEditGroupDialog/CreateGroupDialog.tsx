/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, ChangeEvent } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { createGroup } from "@docspace/shared/api/groups";
import { TUser } from "@docspace/shared/api/people/types";
import { TOnSubmit } from "@docspace/ui-kit/components/selector";

import styles from "./CreateEditGroupDialog.module.scss";
import { GroupParams } from "./types";
import GroupNameParam from "./sub-components/GroupNameParam";
import HeadOfGroup from "./sub-components/HeadOfGroupParam";
import MembersParam from "./sub-components/MembersParam";
import SelectGroupManagerPanel from "./sub-components/HeadOfGroupParam/SelectGroupManagerPanel";
import { SelectMembersPanel } from "./sub-components/create-components/SelectMembersPanel";

interface CreateGroupDialogProps {
  visible: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const CreateGroupDialog = ({
  visible,
  onClose,
  currentUserId,
}: CreateGroupDialogProps) => {
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
        <ModalDialog.Header>{t("Common:CreateGroup")}</ModalDialog.Header>

        <ModalDialog.Body>
          <div className={styles.bodyContent}>
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
          </div>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            id="create-group-modal_submit"
            testId="create_edit_group_create_button"
            tabIndex={5}
            label={t("Common:Create")}
            size={ButtonSize.normal}
            primary
            scale
            onClick={onCreateGroup}
            isDisabled={!groupParams.groupName || !groupParams.groupManager}
            isLoading={isLoading}
          />
          <Button
            id="create-group-modal_cancel"
            testId="create_edit_group_cancel_button"
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
          currentUserId={currentUserId}
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

export default inject(
  ({ userStore }: { userStore: { user?: { id?: string } } }) => ({
    currentUserId: userStore.user?.id,
  }),
)(observer(CreateGroupDialog));

