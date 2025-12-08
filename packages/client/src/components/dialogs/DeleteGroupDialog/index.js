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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

const DeleteGroupDialog = (props) => {
  const {
    t,
    visible,
    onClose,
    selection,
    bufferSelection,
    groupName,
    onDeleteGroup,
    onDeleteAllGroups,
    isLoading,
  } = props;

  const hasMoreGroups = selection.length > 1;

  const onDeleteAction = () => {
    try {
      if (hasMoreGroups) {
        onDeleteAllGroups(t);
      } else {
        onDeleteGroup(t, bufferSelection?.id || selection[0]?.id);
      }
    } catch (err) {
      toastr.error(err.message);
      console.error(err);
    }
  };

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDeleteAction();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  return (
    <ModalDialog visible={visible} onClose={onClose} displayType="modal">
      <ModalDialog.Header>
        {hasMoreGroups
          ? t("DeleteDialog:DeleteAllGroupsTitle")
          : t("DeleteDialog:DeleteGroupTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          {hasMoreGroups
            ? t("DeleteDialog:DeleteAllGroupDescription", {
                productName: t("Common:ProductName"),
              })
            : t("DeleteDialog:DeleteGroupDescription", {
                productName: t("Common:ProductName"),
                groupName,
              })}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="group-modal_delete"
          key="Delete"
          label={t("Common:Delete")}
          size="normal"
          primary
          scale
          onClick={onDeleteAction}
          isLoading={isLoading}
          testId="delete_group_dialog_confirm"
        />
        <Button
          id="group-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          testId="delete_group_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ peopleStore }) => {
  const {
    selection,
    bufferSelection,
    groupName,
    onDeleteGroup,
    onDeleteAllGroups,
    isLoading,
  } = peopleStore.groupsStore;

  return {
    selection,
    bufferSelection,
    groupName,
    onDeleteGroup,
    onDeleteAllGroups,
    isLoading,
  };
})(withTranslation(["Common", "DeleteDialog"])(observer(DeleteGroupDialog)));
