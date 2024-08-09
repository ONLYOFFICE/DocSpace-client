// (c) Copyright Ascensio System SIA 2009-2024
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

import { ChangeEvent, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { TGroup } from "@docspace/shared/api/groups/types";
import EditGroupStore from "SRC_DIR/store/EditGroupStore";

import { StyledModal } from "./CreateEditGroupDialog.styled";
import GroupNameParam from "./sub-components/GroupNameParam";
import HeadOfGroup from "./sub-components/HeadOfGroupParam";
import MembersParam from "./sub-components/MembersParam";
import SelectGroupManagerPanel from "./sub-components/HeadOfGroupParam/SelectGroupManagerPanel";
import { SelectMembersPanel } from "./sub-components/edit-components/SelectMembersPanel";
import { BodyLoader } from "./sub-components/BodyLoader/BodyLoader";

type InjectedProps = Pick<
  EditGroupStore,
  | "initGroupData"
  | "resetGroupData"
  | "isInit"
  | "loadMembers"
  | "manager"
  | "addManager"
  | "removeManager"
  | "members"
  | "addMembers"
  | "removeMember"
  | "currentTotal"
  | "submitChanges"
  | "title"
  | "setTitle"
  | "hasChanges"
>;

type EditGroupDialogProps = {
  group: TGroup;
  visible: boolean;
  onClose: () => void;
  injectedProps?: InjectedProps;
};

const EditGroupDialog = ({
  group,
  visible,
  onClose,

  injectedProps,
}: EditGroupDialogProps) => {
  const {
    initGroupData,
    resetGroupData,
    isInit,
    loadMembers,
    manager,
    addManager,
    removeManager,
    members,
    addMembers,
    removeMember,
    currentTotal,
    submitChanges,
    title,
    setTitle,
    hasChanges,
  } = injectedProps!;

  const { t } = useTranslation(["PeopleTranslations", "Common"]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectGroupMangerPanelIsVisible, setSelectGroupMangerPanelIsVisible] =
    useState<boolean>(false);
  const [selectMembersPanelIsVisible, setSelectMembersPanelIsVisible] =
    useState<boolean>(false);

  const onChangeGroupName = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const closeModal = () => {
    resetGroupData();
    onClose();
  };

  const onShowSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(true);
  const onHideSelectGroupManagerPanel = () =>
    setSelectGroupMangerPanelIsVisible(false);

  const onShowSelectMembersPanel = () => setSelectMembersPanelIsVisible(true);
  const onHideSelectMembersPanel = () => setSelectMembersPanelIsVisible(false);

  const onEditGroup = async () => {
    setIsSubmitting(true);

    await submitChanges();

    setIsSubmitting(false);
    closeModal();
  };

  useEffect(() => {
    initGroupData(group);

    return () => {
      resetGroupData();
    };
  }, []);

  const notEnoughParamsToEdit = !title || (!manager && !members?.length);

  return (
    <>
      <StyledModal
        displayType={ModalDialogType.aside}
        withBodyScroll
        visible={visible}
        onClose={closeModal}
        withFooterBorder
      >
        <ModalDialog.Header>
          {t("PeopleTranslations:EditGroup")}
        </ModalDialog.Header>

        <ModalDialog.Body>
          {isInit ? (
            <>
              <GroupNameParam
                groupName={title}
                onChangeGroupName={onChangeGroupName}
              />
              <HeadOfGroup
                groupManager={manager}
                onShowSelectGroupManagerPanel={onShowSelectGroupManagerPanel}
                removeManager={removeManager}
              />

              <MembersParam
                groupManager={manager}
                groupMembers={members}
                removeMember={removeMember}
                onShowSelectMembersPanel={onShowSelectMembersPanel}
                withInfiniteLoader
                total={currentTotal}
                loadNextPage={loadMembers}
                hasNextPage={!!members && members.length < currentTotal}
              />
            </>
          ) : (
            <BodyLoader />
          )}
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            id="edit-group-modal_submit"
            tabIndex={5}
            label={t("Common:SaveButton")}
            size={ButtonSize.normal}
            primary
            scale
            onClick={onEditGroup}
            isDisabled={!hasChanges || notEnoughParamsToEdit}
            isLoading={isSubmitting}
          />
          <Button
            id="edit-group-modal_cancel"
            tabIndex={5}
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            scale
            isDisabled={isSubmitting}
            onClick={closeModal}
          />
        </ModalDialog.Footer>
      </StyledModal>

      {selectGroupMangerPanelIsVisible && (
        <SelectGroupManagerPanel
          isVisible={selectGroupMangerPanelIsVisible}
          onClose={onHideSelectGroupManagerPanel}
          onParentPanelClose={onClose}
          setGroupManager={addManager}
        />
      )}

      {selectMembersPanelIsVisible && (
        <SelectMembersPanel
          isVisible={selectMembersPanelIsVisible}
          onClose={onHideSelectMembersPanel}
          onParentPanelClose={onClose}
          addMembers={addMembers}
        />
      )}
    </>
  );
};

export default inject<{ editGroupStore: EditGroupStore }>(
  ({ editGroupStore }) => {
    const {
      initGroupData,
      resetGroupData,
      isInit,
      loadMembers,
      manager,
      addManager,
      removeManager,
      members,
      addMembers,
      removeMember,
      currentTotal,
      submitChanges,
      title,
      setTitle,
      hasChanges,
    } = editGroupStore;

    return {
      injectedProps: {
        initGroupData,
        resetGroupData,
        isInit,
        loadMembers,
        manager,
        addManager,
        removeManager,
        members,
        addMembers,
        removeMember,
        currentTotal,
        submitChanges,
        title,
        setTitle,
        hasChanges,
      },
    };
  },
)(observer(EditGroupDialog));
