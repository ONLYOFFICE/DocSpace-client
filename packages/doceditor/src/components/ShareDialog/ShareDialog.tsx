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

import { useTranslation } from "react-i18next";
import React, { useLayoutEffect, useRef, useState } from "react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
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
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";

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

  const isInRoom = fileInfo.rootFolderType === FolderType.Rooms;
  const isExternalShareRestricted =
    !filesSettings.externalShare &&
    (isInRoom
      ? filesSettings.externalShareApplyToRooms
      : filesSettings.externalShareApplyToDocuments);

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
              onAddUser={onClickAddUser}
              isExternalShareRestricted={isExternalShareRestricted}
              blockExistingLinksOnRestrict={
                filesSettings.blockExistingLinksOnRestrict
              }
              defaultShareLinkInternal={filesSettings.defaultShareLinkInternal}
            />
          </div>
        </section>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default SharingDialog;
