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

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { useEventListener } from "@docspace/ui-kit/hooks/useEventListener";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";

import type { PauseSubmissionsDialogProps } from "./PauseSubmissions.types";

const PauseSubmissionsDialog = ({
  visible,
  onClose,
  onEdit,
}: PauseSubmissionsDialogProps) => {
  const { t, ready } = useTranslation(["PauseSubmissionsDialog", "Common"]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    try {
      setIsLoading(true);
      onEdit();
      onClose();
    } catch (error) {
      console.error("Error editing submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (!visible) return;

    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Enter") {
      handleEdit();
    }
  };

  useEventListener("keydown", onKeyPress);

  return (
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        {t("PauseSubmissionsDialog:Title")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" fontWeight={400}>
          {t("PauseSubmissionsDialog:Description1")}
        </Text>
        <Text fontSize="13px" fontWeight={400} style={{ marginTop: "8px" }}>
          {t("PauseSubmissionsDialog:Description2")}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="pause-submissions-dialog_edit"
          key="EditButton"
          label={t("Common:EditButton")}
          size={ButtonSize.normal}
          primary
          onClick={handleEdit}
          isLoading={isLoading}
          isDisabled={isLoading}
          scale
        />
        <Button
          id="pause-submissions-dialog_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          isDisabled={isLoading}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(({ dialogsStore }) => {
  const {
    pauseSubmissionsDialogVisible: visible,
    pauseSubmissionsDialogCallback: callback,
    setPauseSubmissionsDialogVisible,
  } = dialogsStore;

  return {
    visible,
    setPauseSubmissionsDialogVisible,
    onClose: () => {
      setPauseSubmissionsDialogVisible(false);
      callback?.(false);
    },
    onEdit: () => callback?.(true),
  };
})(observer(PauseSubmissionsDialog as FC));
