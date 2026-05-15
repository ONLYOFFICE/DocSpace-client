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

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { TGroup } from "@docspace/shared/api/groups/types";
import {
  MIN_LOADER_TIMER,
  SHOW_LOADER_TIMER,
} from "@docspace/ui-kit/selectors/utils/constants";
import { TUser } from "@docspace/shared/api/people/types";

import EditGroupStore from "SRC_DIR/store/contacts/EditGroupStore";

import styles from "./CreateEditGroupDialog.module.scss";
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
> & { currentUserId?: string };

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
    currentUserId,
  } = injectedProps!;

  const { t } = useTranslation(["PeopleTranslations", "Common"]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectGroupMangerPanelIsVisible, setSelectGroupMangerPanelIsVisible] =
    useState<boolean>(false);
  const [selectMembersPanelIsVisible, setSelectMembersPanelIsVisible] =
    useState<boolean>(false);
  const [showLoader, setShowLoader] = useState(false);

  const loaderTimeout = useRef<NodeJS.Timeout | null>(null);
  const startLoaderTime = useRef<Date | null>(null);

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

  useEffect(() => {
    if (!isInit) {
      loaderTimeout.current = setTimeout(() => {
        startLoaderTime.current = new Date();
        setShowLoader(true);
      }, SHOW_LOADER_TIMER);
    } else if (startLoaderTime.current) {
      const currentDate = new Date();

      const ms = Math.abs(
        startLoaderTime.current.getTime() - currentDate.getTime(),
      );

      if (ms >= MIN_LOADER_TIMER) {
        startLoaderTime.current = null;
        return setShowLoader(false);
      }

      setTimeout(() => {
        if (isInit) {
          startLoaderTime.current = null;
          setShowLoader(false);
        }
      }, MIN_LOADER_TIMER - ms);

      loaderTimeout.current = null;
    } else if (loaderTimeout.current) {
      clearTimeout(loaderTimeout.current);
      loaderTimeout.current = null;
    }
  }, [isInit]);

  const notEnoughParamsToEdit = !title || (!manager && !members?.length);

  return (
    <>
      <ModalDialog
        displayType={ModalDialogType.aside}
        withBodyScroll
        visible={visible}
        onClose={closeModal}
      >
        <ModalDialog.Header>
          {t("PeopleTranslations:EditGroup")}
        </ModalDialog.Header>

        <ModalDialog.Body>
          <div className={styles.bodyContent}>
            {showLoader ? (
              <BodyLoader />
            ) : (
              isInit && (
                <>
                  <GroupNameParam
                    groupName={title}
                    onChangeGroupName={onChangeGroupName}
                  />
                  <HeadOfGroup
                    groupManager={manager}
                    onShowSelectGroupManagerPanel={
                      onShowSelectGroupManagerPanel
                    }
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
                    hasNextPage={
                      members ? members.length < currentTotal : false
                    }
                  />
                </>
              )
            )}
          </div>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            id="edit-group-modal_submit"
            testId="edit_group_save_button"
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
            testId="edit_group_cancel_button"
            tabIndex={5}
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            scale
            isDisabled={isSubmitting}
            onClick={closeModal}
          />
        </ModalDialog.Footer>
      </ModalDialog>

      {selectGroupMangerPanelIsVisible ? (
        <SelectGroupManagerPanel
          onClose={onHideSelectGroupManagerPanel}
          onParentPanelClose={onClose}
          setGroupManager={(user) => {
            addManager(user);
            setSelectGroupMangerPanelIsVisible(false);
          }}
          currentUserId={currentUserId}
        />
      ) : null}

      {selectMembersPanelIsVisible ? (
        <SelectMembersPanel
          onClose={onHideSelectMembersPanel}
          onParentPanelClose={onClose}
          addMembers={(users) => {
            addMembers(users as unknown as TUser[]);
            setSelectMembersPanelIsVisible(false);
          }}
        />
      ) : null}
    </>
  );
};

export default inject<{
  editGroupStore: EditGroupStore;
  userStore: { user?: { id?: string } };
}>(({ editGroupStore, userStore }) => {
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
      currentUserId: userStore.user?.id,
    },
  };
})(observer(EditGroupDialog));
