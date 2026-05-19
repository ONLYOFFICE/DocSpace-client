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

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { useLocalStorage } from "@docspace/shared/hooks/useLocalStorage";

import type { AskAIConnectDialogProps } from "./AskAIConnectDialog.types";
import styles from "./AskAIConnectDialog.module.scss";

export const SKIP_AI_MODAL_KEY = "formRoom.skipAIConnectModal";

const AskAIConnectDialog = ({
  visible,
  callback,
  setAskAIConnectDialogVisible,
}: AskAIConnectDialogProps) => {
  const { t, ready } = useTranslation(["InfoPanel", "Common"]);
  const [skipModal, setSkipModal] = useLocalStorage(SKIP_AI_MODAL_KEY, false);

  const onClose = (message = "close") => {
    setAskAIConnectDialogVisible(false);
    callback?.(message);
  };

  const handleClose = () => {
    onClose("close");
  };

  const onConnect = () => {
    onClose("connect");
  };
  const onContinue = () => {
    onClose("continue");
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      onClose={handleClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        {t("InfoPanel:FormRoomAIModalTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" fontWeight={400}>
          {t("InfoPanel:FormRoomAIModalDescription")}
        </Text>
        <Checkbox
          className={styles.checkbox}
          label={t("Common:DontShowAgain")}
          isChecked={skipModal}
          onChange={() => setSkipModal((prev) => !prev)}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          scale
          primary
          key="ConnectButton"
          onClick={onConnect}
          size={ButtonSize.normal}
          id="ask-ai-connect-dialog_connect"
          label={t("InfoPanel:FormRoomAIModalConnect")}
        />
        <Button
          scale
          key="ContinueButton"
          onClick={onContinue}
          size={ButtonSize.normal}
          id="ask-ai-connect-dialog_continue"
          label={t("Common:ContinueButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(({ dialogsStore }) => {
  const {
    askAIConnectDialogVisible: visible,
    askAIConnectDialogCallback: callback,
    setAskAIConnectDialogVisible,
  } = dialogsStore;

  return {
    visible,
    callback,
    setAskAIConnectDialogVisible,
  };
})(observer(AskAIConnectDialog as FC));

