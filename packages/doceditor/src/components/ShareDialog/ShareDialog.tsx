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

import { useTranslation } from "react-i18next";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import moment from "moment";
import "moment/min/locales.min";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import Share from "@docspace/shared/components/share";
import { getPortalPasswordSettings } from "@docspace/shared/api/settings";
import EditLinkPanel, {
  type EditLinkPanelRef,
} from "@docspace/shared/dialogs/EditLinkPanel";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import type { LinkParamsType, Nullable } from "@docspace/shared/types";
import { TPasswordSettings } from "@docspace/shared/api/settings/types";
import { ShareSelector } from "@docspace/shared/components/share/selector";
import type { TGroup } from "@docspace/shared/api/groups/types";
import { EditGroupMembers } from "@docspace/shared/dialogs/edit-group-members-dialog";

import ShareDialogHeader from "./ShareDialog.header";
import type { SharingDialogProps } from "./ShareDialog.types";

import styles from "./ShareDialog.module.scss";
import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";

const SharingDialog = ({
  fileInfo,
  onCancel,
  isVisible,
  selfId,
  onOpenPanel,
  filesSettings,
}: SharingDialogProps) => {
  const { t, i18n } = useTranslation(["Common"]);
  const ref = useRef<EditLinkPanelRef>(null);
  const [editLinkPanelVisible, setEditLinkPanelVisible] = useState(false);
  const [linkParams, setLinkParams] = useState<Nullable<LinkParamsType>>(null);
  const [passwordSettings, setPasswordSettings] = useState<TPasswordSettings>();
  const [isSharePanelVisible, setIsSharePanelVisible] = useState(false);
  const [isEditGroupPanelVisible, setIsEditGroupPanelVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TGroup | null>(null);

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  useLayoutEffect(() => {
    const fileSocketPart = `FILE-${fileInfo.id}`;

    if (!SocketHelper?.socketSubscribers.has(fileSocketPart))
      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts: [fileSocketPart],
        individual: true,
      });
  }, [fileInfo.id]);

  // Wrapper function to match the expected type for EditLinkPanel
  const handleGetPortalPasswordSettings = async (): Promise<void> => {
    try {
      const res = await getPortalPasswordSettings();
      setPasswordSettings(res);
    } catch (error) {
      console.error("Error fetching password settings:", error);
    }
  };

  const handleSetEditLinkPanelIsVisible = (value: boolean): void => {
    setEditLinkPanelVisible(value);
  };

  const closeEditLinkPanel = () => {
    setIsSharePanelVisible(false);
    setEditLinkPanelVisible(false);
    setLinkParams(null);
  };

  const closeEditGroupPanel = () => {
    setIsEditGroupPanelVisible(false);
    setSelectedGroup(null);
  };

  const onClosePanel = () => {
    if (ref.current?.hasChanges()) {
      ref.current?.openChangesDialog("close");
      return;
    }

    closeEditGroupPanel();
    closeEditLinkPanel();
    onCancel();
  };

  const onCloseSharePanel = () => setIsSharePanelVisible(false);

  const onClickAddUser = () => setIsSharePanelVisible(true);

  const onClickEditGroup = (group: TGroup) => {
    if (group.isSystem) return;

    setIsEditGroupPanelVisible(true);
    setSelectedGroup(group);
  };

  return (
    <ModalDialog
      withBorder
      withBodyScroll
      visible={isVisible}
      scrollbarCreateContext
      onClose={onClosePanel}
      displayType={ModalDialogType.aside}
      containerVisible={
        editLinkPanelVisible || isSharePanelVisible || isEditGroupPanelVisible
      }
    >
      <ModalDialog.Container>
        <>
          {linkParams ? (
            <EditLinkPanel
              ref={ref}
              withBackButton
              item={fileInfo}
              link={linkParams.link}
              language={i18n.language}
              visible={editLinkPanelVisible}
              setIsVisible={closeEditLinkPanel}
              updateLink={linkParams.updateLink}
              setLinkParams={setLinkParams}
              currentDeviceType={DeviceType.desktop}
              passwordSettings={passwordSettings}
              getPortalPasswordSettings={handleGetPortalPasswordSettings}
              onClose={onClosePanel}
            />
          ) : null}
          {isSharePanelVisible ? (
            <ShareSelector
              item={fileInfo}
              withAccessRights
              onClose={onClosePanel}
              onBackClick={onCloseSharePanel}
              onCloseClick={onClosePanel}
            />
          ) : null}
          {isEditGroupPanelVisible && selectedGroup ? (
            <EditGroupMembers
              group={selectedGroup}
              onClose={onClosePanel}
              infoPanelSelection={fileInfo}
              visible={isEditGroupPanelVisible}
              onBackClick={closeEditGroupPanel}
              setVisible={setIsEditGroupPanelVisible}
            />
          ) : null}
        </>
      </ModalDialog.Container>

      <ModalDialog.Header>{t("Common:Share")}</ModalDialog.Header>
      <ModalDialog.Body>
        <section className={styles.shareContainer}>
          <div className="share-file_body">
            <ShareDialogHeader
              file={fileInfo}
              filesSettings={filesSettings}
              onClickAddUser={onClickAddUser}
              // HACK: Hide share option for rooms — remove after implementation is ready
              disabledIcon={fileInfo.rootFolderType === FolderType.Rooms}
            />
            <Share
              isEditor
              infoPanelSelection={fileInfo}
              selfId={selfId ?? ""}
              onOpenPanel={onOpenPanel}
              onlyOneLink={fileInfo.isForm}
              setEditLinkPanelIsVisible={handleSetEditLinkPanelIsVisible}
              setLinkParams={setLinkParams}
              onClickGroup={onClickEditGroup}
            />
          </div>
        </section>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default SharingDialog;
