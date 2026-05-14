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

