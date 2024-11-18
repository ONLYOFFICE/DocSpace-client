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

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import type { TData } from "@docspace/shared/components/toast/Toast.type";

import type { DisableUserDialogProps } from "./DisableUserDialog.types";

export const DisableUserDialog = ({
  t,
  visible,
  onClose,
  onClosePanel,
  userIds,
  isLoading,
  onDisable,
  clearSelection,
}: DisableUserDialogProps) => {
  const onlyOneUser = userIds.length === 1;

  let headerText = "";
  let bodyText = "";

  headerText = onlyOneUser
    ? t("ChangeUserStatusDialog:DisableUser")
    : t("ChangeUserStatusDialog:DisableUsers");

  bodyText = onlyOneUser
    ? t("ChangeUserStatusDialog:DisableUserDescription")
    : t("ChangeUserStatusDialog:DisableUsersDescription");

  bodyText += t("ChangeUserStatusDialog:DisableGeneralDescription");

  const onClickDisableUser = async () => {
    try {
      await onDisable(userIds);
      toastr.success(t("PeopleTranslations:SuccessChangeUserStatus"));
    } catch (error) {
      toastr.error(error as TData);
    } finally {
      clearSelection();
      onClose();
      onClosePanel();
    }
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{headerText}</ModalDialog.Header>
      <ModalDialog.Body>{bodyText}</ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="DisableBtn"
          label={t("Common:DisableUserButton")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={onClickDisableUser}
          isLoading={isLoading}
        />
        <Button
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
