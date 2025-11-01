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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";

import { withTranslation } from "react-i18next";

interface DeleteVersionDialogProps {
  t: (key: string) => string;
  visible: boolean;
  setIsVisible: (visible: boolean) => void;
  tReady: boolean;
  fileId: string;
  versionSelectedForDeletion: any;
  onDeleteVersionFile: (
    fileId: number,
    versionSelectedForDeletion: any,
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
        />
        <Button
          id="delete-version-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
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
