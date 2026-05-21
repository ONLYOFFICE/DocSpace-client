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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

import { withTranslation } from "react-i18next";

interface DeleteVersionDialogProps {
  t: (key: string) => string;
  visible: boolean;
  setIsVisible: (visible: boolean) => void;
  tReady: boolean;
  fileId: string;
  versionSelectedForDeletion: number;
  onDeleteVersionFile: (
    fileId: number,
    versionSelectedForDeletion: number[],
  ) => void;
}

const DeleteVersionDialogComponent: React.FC<DeleteVersionDialogProps> = (
  props,
) => {
  const {
    t,
    visible,
    setIsVisible,
    tReady,
    fileId,
    versionSelectedForDeletion,
    onDeleteVersionFile,
  } = props;

  const onClose = () => {
    setIsVisible(false);
  };

  const onDelete = () => {
    onDeleteVersionFile(+fileId, [versionSelectedForDeletion]);
    onClose();
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") onClose();
    if (e.key === "Enter") onDelete();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  return (
    <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>
        {t("VersionHistory:DeleteVersion")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text lineHeight="20px">
            {t("VersionHistory:DeleteVersionDescription")}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-version-modal_submit"
          key="OKButton"
          label={t("Common:Delete")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onDelete}
          testId="delete_version_dialog_submit"
        />
        <Button
          id="delete-version-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          testId="delete_version_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const DeleteVersionDialog = withTranslation(["Common", "VersionHistory"])(
  DeleteVersionDialogComponent,
);

export default inject(({ versionHistoryStore, filesActionsStore }: TStore) => {
  const {
    deleteVersionDialogVisible: visible,
    onSetDeleteVersionDialogVisible: setIsVisible,
    versionSelectedForDeletion,
    fileId,
  } = versionHistoryStore;
  const { onDeleteVersionFile } = filesActionsStore;

  return {
    visible,
    setIsVisible,
    onDeleteVersionFile,
    versionSelectedForDeletion,
    fileId,
  };
})(observer(DeleteVersionDialog));
