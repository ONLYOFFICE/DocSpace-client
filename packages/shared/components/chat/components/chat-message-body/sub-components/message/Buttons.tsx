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
import RefreshIconUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import SaveToFileIconUrl from "PUBLIC_DIR/images/message.save.svg?url";

import { DeviceType, FolderType } from "../../../../../../enums";
import { exportChatMessage } from "../../../../../../api/ai";
import { isDesktop, isTablet } from "../../../../../../utils";

import FilesSelector from "../../../../../../selectors/Files";
import { TBreadCrumb } from "../../../../../selector/Selector.types";

import { toastr } from "../../../../../toast";
import { Link, LinkType, LinkTarget } from "../../../../../link";

import { useMessageStore } from "../../../../store/messageStore";

import styles from "../../ChatMessageBody.module.scss";

import { MessageButtonsProps } from "../../../../Chat.types";

const Buttons = ({
  text,
  chatName,
  messageId,
  isLast,
  getIcon,
}: MessageButtonsProps) => {
  const { t } = useTranslation(["Common"]);
  const { roomId } = useMessageStore();

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
        {isLast ? (
          <div
            className={styles.buttonsBlockItem}
            title={t("RefreshMessage")}
            onClick={() => {
              toastr.info(t("Common:WorkInProgress"));
            }}
          >
            <ReactSVG src={RefreshIconUrl} />
          </div>
        ) : null}
        <div
          className={styles.buttonsBlockItem}
          onClick={() => setShowFolderSelector(true)}
          title={t("SaveToFile")}
        >
          <ReactSVG src={SaveToFileIconUrl} />
        </div>
      </div>
      {showFolderSelector ? (
        <FilesSelector
          isPanelVisible={showFolderSelector}
          onCancel={onCloseFolderSelector}
          getIcon={getIcon}
          getIsDisabled={(
            isFirstLoad,
            isSelectedParentFolder,
            selectedItemId,
            selectedItemType,
            isRoot,
            selectedItemSecurity,
          ) => {
            if (selectedItemType === "rooms") return true;

            if (
              selectedItemSecurity &&
              "Create" in selectedItemSecurity &&
              selectedItemSecurity.Create
            )
              return false;

            return true;
          }}
          onSubmit={onExportMessage}
          withHeader
          headerProps={{
            headerLabel: t("Common:SaveButton"),
            isCloseable: true,
            onCloseClick: onCloseFolderSelector,
          }}
          withSearch
          withBreadCrumbs
          withoutBackButton
          withCancelButton
          withCreate={false}
          initAiRoom
          // TODO: restore when api will be ready
          withFooterCheckbox={false}
          withFooterInput
          cancelButtonLabel={t("Common:CancelButton")}
          submitButtonLabel={t("Common:SaveButton")}
          disabledItems={[]}
          isRoomsOnly={false}
          isThirdParty={false}
          currentFolderId={roomId}
          rootFolderType={FolderType.Rooms}
          footerCheckboxLabel={t("Common:OpenSavedDocument")}
          footerInputHeader={t("Common:FileName")}
          currentFooterInputValue={`${chatName}_${messageId}`}
          descriptionText=""
          getFilesArchiveError={() => ""}
          currentDeviceType={
            isDesktop()
              ? DeviceType.desktop
              : isTablet()
                ? DeviceType.tablet
                : DeviceType.mobile
          }
        />
      ) : null}
    </>
  );
};

export default observer(Buttons);
