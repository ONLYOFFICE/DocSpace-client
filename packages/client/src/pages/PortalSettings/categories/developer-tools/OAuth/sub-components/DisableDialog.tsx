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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ModalDialogType } from "@docspace/shared/components/modal-dialog/ModalDialog.enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { Text } from "@docspace/shared/components/text";

import OAuthStore from "SRC_DIR/store/OAuthStore";

interface DisableClientDialogProps {
  isVisible?: boolean;
  isGroup?: boolean;
  onClose?: () => void;
  onDisable?: () => Promise<void>;
}

const DisableClientDialog = (props: DisableClientDialogProps) => {
  const { t, ready } = useTranslation(["OAuth", "Common"]);
  const { isVisible, isGroup, onClose, onDisable } = props;

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onDisableClick = async () => {
    try {
      setIsRequestRunning(true);
      await onDisable?.();

      setIsRequestRunning(true);
      toastr.success(
        isGroup
          ? t("OAuth:ApplicationsDisabledSuccessfully")
          : t("OAuth:ApplicationDisabledSuccessfully"),
      );
      onClose?.();
    } catch (error: unknown) {
      const e = error as TData;
      toastr.error(e);
      onClose?.();
    }
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={isVisible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        {isGroup ? t("DisableApplications") : t("DisableApplication")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text style={{ marginBottom: "16px" }}>
          {isGroup ? (
            <Trans t={t} i18nKey="DisableApplicationsDescription" ns="OAuth" />
          ) : (
            <Trans t={t} i18nKey="DisableApplicationDescription" ns="OAuth" />
          )}
        </Text>

        <Trans t={t} i18nKey="DisableApplicationNote" ns="OAuth" />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="delete-button"
          key="DeletePortalBtn"
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          scale
          primary
          isLoading={isRequestRunning}
          onClick={onDisableClick}
          testId="disable_app_ok_button"
        />
        <Button
          className="cancel-button"
          key="CancelDeleteBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          isDisabled={isRequestRunning}
          onClick={onClose}
          testId="disable_app_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStore }) => {
  const {
    bufferSelection,
    selection,
    selectionToDisable,

    setDisableDialogVisible,
    setActiveClient,
    setSelection,
    changeClientStatus,
    disableDialogVisible,
  } = oauthStore;

  const isGroup = selectionToDisable.length > 1;

  const onClose = () => {
    setDisableDialogVisible(false);
  };

  const onDisable = async () => {
    if (selection.length) {
      const disable = async (item: string) => {
        await changeClientStatus(item, false);
      };

      const actions: Promise<void>[] = selectionToDisable.map((item) =>
        disable(item),
      );

      await Promise.all(actions);

      setActiveClient("");
      setSelection("");
    } else {
      if (!bufferSelection) return;

      await changeClientStatus(bufferSelection.clientId, false);

      setActiveClient("");
      setSelection("");
    }
  };

  return { isVisible: disableDialogVisible, isGroup, onClose, onDisable };
})(observer(DisableClientDialog));
