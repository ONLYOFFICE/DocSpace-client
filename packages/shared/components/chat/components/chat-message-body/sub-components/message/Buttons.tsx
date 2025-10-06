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
import { ReactSVG } from "react-svg";
import copy from "copy-to-clipboard";
import { Trans, useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import CopyIconUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
// import RefreshIconUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import SaveToFileIconUrl from "PUBLIC_DIR/images/message.save.svg?url";

import { exportChatMessage } from "../../../../../../api/ai";

import { TBreadCrumb } from "../../../../../selector/Selector.types";

import { toastr } from "../../../../../toast";
import { Link, LinkTarget, LinkType } from "../../../../../link";

import { useMessageStore } from "../../../../store/messageStore";

import ExportSelector from "../../../../components/export-selector";

import styles from "../../ChatMessageBody.module.scss";

import { MessageButtonsProps } from "../../../../Chat.types";
import { FOLDER_FORM_VALIDATION } from "../../../../../../constants";
import { ContentType } from "../../../../../../api/ai/enums";

const Buttons = ({
  text,
  chatName,
  messageId,
  // isLast,
  getIcon,
  messageIndex,
}: MessageButtonsProps) => {
  const { t } = useTranslation(["Common"]);
  const { roomId, findPreviousUserMessage } = useMessageStore();

  const [showFolderSelector, setShowFolderSelector] = React.useState(false);

  const onCloseFolderSelector = () => setShowFolderSelector(false);

  const onCopyAction = () => {
    copy(text);
    toastr.success(t("MessageCopiedSuccess"));
  };

  const onExportMessage = async (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
  ) => {
    if (!messageId || !selectedItemId) return;

    const exportResult = await exportChatMessage(
      messageId,
      selectedItemId,
      fileName,
    );

    if (isChecked) {
      window.open(exportResult?.webUrl, "_blank");
    } else {
      const toastMsg = (
        <Trans
          ns="Common"
          i18nKey="MessageExported"
          values={{ fileName }}
          t={t}
          components={{
            1: (
              <Link
                type={LinkType.page}
                target={LinkTarget.blank}
                href={exportResult?.webUrl}
              />
            ),
          }}
        />
      );

      toastr.success(toastMsg);
    }

    setShowFolderSelector(false);
  };

  const getExportedFileName = () => {
    const userMessage = findPreviousUserMessage(messageIndex);
    let text = "";

    if (userMessage && userMessage.contents?.length > 0) {
      for (const content of userMessage.contents) {
        if (content.type === ContentType.Text) {
          text = content.text;
        }
      }
    }

    if (!text) {
      text = chatName || "";
    }

    const sanitizedStr = text
      .slice(0, 49) // only first 50 chars
      .replace(/[\r\n]+/g, " ") // multiline to single line
      .replace(FOLDER_FORM_VALIDATION, "_") // unacceptable symbols to "_"
      .replace(/_+/g, "_") // remove "_" duplicates
      .trim();

    return sanitizedStr;
  };

  return (
    <>
      <div className={styles.buttonsBlock}>
        <div
          className={styles.buttonsBlockItem}
          onClick={onCopyAction}
          title={t("CopyMessage")}
        >
          <ReactSVG src={CopyIconUrl} />
        </div>

        {/*{isLast ? (*/}
        {/*  <div*/}
        {/*    className={styles.buttonsBlockItem}*/}
        {/*    title={t("RefreshMessage")}*/}
        {/*    onClick={() => {*/}
        {/*      toastr.info(t("Common:WorkInProgress"));*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <ReactSVG src={RefreshIconUrl} />*/}
        {/*  </div>*/}
        {/*) : null}*/}

        <div
          className={styles.buttonsBlockItem}
          onClick={() => setShowFolderSelector(true)}
          title={t("SaveToFile")}
        >
          <ReactSVG src={SaveToFileIconUrl} />
        </div>
      </div>
      {showFolderSelector ? (
        <ExportSelector
          onCloseFolderSelector={onCloseFolderSelector}
          onSubmit={onExportMessage}
          roomId={roomId}
          getFileName={getExportedFileName}
          getIcon={getIcon}
          showFolderSelector={showFolderSelector}
        />
      ) : null}
    </>
  );
};

export default observer(Buttons);
