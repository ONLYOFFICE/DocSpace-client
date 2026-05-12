// (c) Copyright Ascensio System SIA 2009-2026
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

import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Link, LinkType } from "@docspace/ui-kit/components/link";

import { TChangeUserTypeDialogData } from "SRC_DIR/helpers/contacts";
import { getChangeTypeKey } from "./getChangeTypeKey";
import styles from "./ChangeUserType.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type ChangeUserTypeDialogProps = {
  visible: boolean;
  isGuestsDialog: boolean;
  isRequestRunning: boolean;
  firstType: string;
  secondType: string;
  onClose: VoidFunction;
  onChangeUserType: VoidFunction;

  setDataReassignmentDialogVisible?: (visible: boolean) => void;
  setDialogData?: (data: unknown) => void;
  dialogData?: TChangeUserTypeDialogData;
  isDowngradeType: boolean;
  isDowngradeToUser: boolean;
  isCurrentUserOwner?: boolean;
};

const ChangeUserTypeDialog = ({
  visible,
  isGuestsDialog,
  isRequestRunning,
  firstType,
  secondType,
  onClose,
  onChangeUserType,

  setDataReassignmentDialogVisible,
  setDialogData,
  dialogData,
  isDowngradeType,
  isDowngradeToUser,
  isCurrentUserOwner,
}: ChangeUserTypeDialogProps) => {
  const {
    toType,
    userNames,
    user,
    getReassignmentProgress,
    reassignUserData,
    cancelReassignment,
    needReassignData,
  } = dialogData!;

  const { t } = useTranslation(["ChangeUserTypeDialog", "People", "Common"]);

  const isSingleUser = userNames.length === 1;
  const translationValues = {
    userName: isSingleUser ? userNames[0] : undefined,
    membersSection: t("Common:Members"),
    documentsSection: t("Common:MyDocuments"),
    productName: getBrandName("ProductName"),
    secondType,
  };
  const translationKey = getChangeTypeKey(
    toType,
    isSingleUser,
    t,
    translationValues,
  );

  const onClickReassignData = (currentUserAsDefault?: boolean) => {
    setDialogData?.({
      user,
      getReassignmentProgress,
      reassignUserData,
      cancelReassignment,
      toType,
      currentUserAsDefault,
      noRoomFilesToMove: true,
    });

    setDataReassignmentDialogVisible?.(true);

    onClose();
  };

  const onChangeType = () => {
    if (!needReassignData) {
      onChangeUserType();
      return;
    }

    onClickReassignData(true);
  };
  const getDowngradeContent = () => {
    if (!isDowngradeType) return;

    return (
      <>
        {!isDowngradeToUser ? (
          <Text className={styles.warningText} fontSize="16px" fontWeight={700}>
            {t("Common:Warning")}
          </Text>
        ) : null}

        <Text className={styles.bodyText}>
          {isDowngradeToUser ? (
            <Trans
              i18nKey="DataReassignmentInfo"
              ns="ChangeUserTypeDialog"
              t={t}
            />
          ) : (
            <>
              <Trans
                i18nKey="PersonalDataDeletion"
                ns="ChangeUserTypeDialog"
                t={t}
                values={{ sectionName: t("Common:MyDocuments") }}
                components={{
                  1: <span style={{ fontWeight: 600 }} />,
                }}
              />
              &nbsp;
              {needReassignData ? (
                <Trans
                  i18nKey="DataReassignmentWithFilesDeletion"
                  ns="ChangeUserTypeDialog"
                  t={t}
                  values={{ sectionName: t("Common:MyDocuments") }}
                  components={{
                    1: <span style={{ fontWeight: 600 }} />,
                  }}
                />
              ) : null}
            </>
          )}
        </Text>

        {needReassignData ? (
          <Link
            className={styles.bodyLink}
            type={LinkType.action}
            fontSize="13px"
            fontWeight={600}
            isHovered
            onClick={() => onClickReassignData()}
          >
            {t("DeleteProfileEverDialog:ReassignDataToAnotherUser")}
          </Link>
        ) : null}
      </>
    );
  };

  const getBody = () => {
    if (isGuestsDialog)
      return (
        <Trans
          i18nKey={translationKey}
          ns="ChangeUserTypeDialog"
          t={t}
          values={translationValues}
        />
      );

    return (
      <div>
        <Text>
          <Trans
            i18nKey="ChangeUserTypeMessage"
            ns="ChangeUserTypeDialog"
            t={t}
            values={{ firstType, secondType }}
          />
        </Text>
        {!isCurrentUserOwner ? (
          <Text className={styles.noteText}>
            <Trans
              i18nKey="ChangeUserTypeNote"
              ns="ChangeUserTypeDialog"
              t={t}
              values={{ productName: getBrandName("ProductName") }}
              components={{
                1: <span style={{ fontWeight: 600 }} />,
              }}
            />
          </Text>
        ) : null}
        {isDowngradeType ? getDowngradeContent() : null}
      </div>
    );
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
      isLarge={needReassignData}
    >
      <ModalDialog.Header>{t("ChangeContactType")}</ModalDialog.Header>
      <ModalDialog.Body>{getBody()}</ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="change-user-type-modal_submit"
          label={t("Common:ChangeButton")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={onChangeType}
          isLoading={isRequestRunning}
          testId="change_user_type_dialog_confirm"
        />
        <Button
          id="change-user-type-modal_cancel"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isRequestRunning}
          testId="change_user_type_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ peopleStore, userStore }: TStore) => {
  const {
    setDataReassignmentDialogVisible,
    setDialogData,
    data: dialogData,
  } = peopleStore.dialogStore!;
  const { user } = userStore;

  return {
    setDataReassignmentDialogVisible,
    setDialogData,
    dialogData,
    isCurrentUserOwner: user!.isOwner,
  };
})(observer(ChangeUserTypeDialog));
