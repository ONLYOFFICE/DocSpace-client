/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React from "react";
import { useTranslation } from "react-i18next";

import { ToolsPermission } from "../../../../../../../api/ai/enums";
import type { TToolCallContent } from "../../../../../../../api/ai/types";
import { updateToolsPermission } from "../../../../../../../api/ai";

import { Text } from "../../../../../../text";
import { Button, ButtonSize } from "../../../../../../button";
import { Checkbox } from "../../../../../../checkbox";

import styles from "../../../ChatMessageBody.module.scss";
import { ToolCall } from "./ToolCall";
import { ModalDialog, ModalDialogType } from "../../../../../../modal-dialog";
import { isMobile } from "../../../../../../../utils";
import { ToolCallPlacement, ToolCallStatus } from "./ToolCall.enum";

type ToolCallConfirmDialogProps = {
  content: TToolCallContent;
  onClose: () => void;
};

export const ToolCallConfirmDialog = ({
  content,
  onClose,
}: ToolCallConfirmDialogProps) => {
  const [alwaysAllow, setAlwaysAllow] = React.useState(false);
  const { t } = useTranslation(["Common"]);

  const onClickAction = (decision: ToolsPermission) => {
    if (content.callId) {
      updateToolsPermission(
        content.callId,
        alwaysAllow && decision === ToolsPermission.Allow
          ? ToolsPermission.AlwaysAllow
          : decision,
      );
    }

    onClose();
  };

  const onCloseAction = () => {
    if (content.callId) {
      updateToolsPermission(content.callId, ToolsPermission.Deny);
    }

    onClose();
  };

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.modal}
      onClose={onCloseAction}
      isLarge
      autoMaxHeight
      closeOnBackdropClick={false}
    >
      <ModalDialog.Header>{t("Common:Confirmation")}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.toolCallManage}>
          <Text>{t("Common:AIWouldLikeToUseThisTool")}</Text>
          <ToolCall
            content={content}
            status={ToolCallStatus.Confirmation}
            placement={ToolCallPlacement.ConfirmDialog}
          />
          <div>
            <Text>{t("Common:ReviewAction")}</Text>
            <Text>{t("Common:CannotGuaranteeSecurity")}</Text>
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <div className={styles.toolCallFooter}>
          <Checkbox
            isChecked={alwaysAllow}
            onChange={(e) => setAlwaysAllow(e.target.checked)}
            label={t("Common:AlwaysAllowToolCall")}
          />
          <div className={styles.buttonsBlockContainer}>
            <Button
              primary
              label={t("Common:Allow")}
              onClick={() => onClickAction(ToolsPermission.Allow)}
              scale={isMobile()}
              size={ButtonSize.normal}
            />
            <Button
              className={styles.denyButton}
              label={t("Common:Deny")}
              onClick={() => onClickAction(ToolsPermission.Deny)}
              size={ButtonSize.normal}
              scale={isMobile()}
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
