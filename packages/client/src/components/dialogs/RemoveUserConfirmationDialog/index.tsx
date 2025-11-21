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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { useState } from "react";
import { toastr } from "@docspace/shared/components/toast";

type Props = {
  setRemoveUserConfirmation: (
    visible: boolean,
    callback?: () => Promise<void>,
  ) => void;
  removeUserConfirmation: {
    visible: boolean;
    callback: () => Promise<void> | null;
  };
};

const RemoveUserConfirmationDialog = ({
  removeUserConfirmation,
  setRemoveUserConfirmation,
}: Props) => {
  const { t, ready } = useTranslation(["People", "Common"]);

  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => {
    if (isLoading) return;
    setRemoveUserConfirmation(false);
  };

  const onDelete = async () => {
    if (removeUserConfirmation.callback) {
      try {
        setIsLoading(true);
        await removeUserConfirmation.callback();
      } catch (error) {
        toastr.error(error as Error);
        console.error(error);
      } finally {
        setIsLoading(false);
        onClose();
      }
    }
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={removeUserConfirmation.visible}
      onClose={onClose}
    >
      <ModalDialog.Header>{t("People:RemoveUser")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("People:RemoveUserConfirmationText")}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OKButton"
          label={t("Common:Remove")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onDelete}
          isLoading={isLoading}
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isLoading={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(({ dialogsStore }) => {
  const { setRemoveUserConfirmation, removeUserConfirmation } = dialogsStore;

  return {
    setRemoveUserConfirmation,
    removeUserConfirmation,
  };
})(observer(RemoveUserConfirmationDialog as React.FC));
