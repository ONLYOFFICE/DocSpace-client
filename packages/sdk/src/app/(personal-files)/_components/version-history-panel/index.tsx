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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import RestoreAuthReactSvgUrl from "PUBLIC_DIR/images/restore.auth.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";

import type { TFile } from "@docspace/shared/api/files/types";
import { MAX_FILE_COMMENT_LENGTH } from "@docspace/shared/constants";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { Row } from "@docspace/ui-kit/components/rows";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useResolvedFileTitle } from "@docspace/shared/hooks/useResolvedFileTitle";

import { useVersionHistoryStore } from "../../_store/VersionHistoryStore";

import VersionBadge from "./VersionBadge";
import styles from "./VersionHistoryPanel.module.scss";

type DeleteVersionDialogProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteVersionDialog = ({
  visible,
  onClose,
  onConfirm,
}: DeleteVersionDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const onKeyUp = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    },
    [onClose, onConfirm],
  );

  React.useEffect(() => {
    document.addEventListener("keyup", onKeyUp);
    return () => document.removeEventListener("keyup", onKeyUp);
  }, [onKeyUp]);

  return (
    <ModalDialog visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Common:DeleteVersion")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text lineHeight="20px">{t("Common:DeleteVersionDescription")}</Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-version-modal_submit"
          label={t("Common:Delete")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onConfirm}
          testId="delete_version_dialog_submit"
        />
        <Button
          id="delete-version-modal_cancel"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          testId="delete_version_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

type VersionRowProps = {
  version: TFile;
  isVersion: boolean;
  index: number;
  culture: string;
  anonymousLabel: string;
  openLabel: string;
  downloadLabel: string;
  actionsLabel: string;
  editCommentLabel: string;
  restoreLabel: string;
  canChangeVersionFileHistory: boolean;
  canDeleteVersion: boolean;
  onRestore: (fileId: number, version: number) => Promise<void>;
  onSaveComment: (
    fileId: number,
    comment: string,
    version: number,
  ) => Promise<void>;
  onDeleteRequest: (versionGroup: number) => void;
};

const VersionRow = ({
  version,
  isVersion,
  index,
  culture,
  anonymousLabel,
  openLabel,
  downloadLabel,
  actionsLabel,
  editCommentLabel,
  restoreLabel,
  canChangeVersionFileHistory,
  canDeleteVersion,
  onRestore,
  onSaveComment,
  onDeleteRequest,
}: VersionRowProps) => {
  const { t } = useTranslation(["Common"]);
  const [showEditPanel, setShowEditPanel] = React.useState(false);
  const [commentValue, setCommentValue] = React.useState(version.comment ?? "");
  const [isSavingComment, setIsSavingComment] = React.useState(false);

  React.useEffect(() => {
    setCommentValue(version.comment ?? "");
  }, [version.comment]);

  const versionDate = getCorrectDate(culture, version.updated, "L", "LTS");
  const author = version.updatedBy?.isAnonim
    ? anonymousLabel
    : Encoder.htmlDecode(version.updatedBy?.displayName ?? "");

  const downloadUrl = `${version.viewUrl}&version=${version.version}`;

  const onOpen = React.useCallback(() => {
    window.open(version.webUrl, "_blank");
  }, [version.webUrl]);

  const onDownload = React.useCallback(() => {
    window.open(downloadUrl, "_blank");
  }, [downloadUrl]);

  const onEditComment = React.useCallback(() => {
    setShowEditPanel((prev) => !prev);
  }, []);

  const onCommentChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setCommentValue(
        value.length > MAX_FILE_COMMENT_LENGTH
          ? value.slice(0, MAX_FILE_COMMENT_LENGTH)
          : value,
      );
    },
    [],
  );

  const onSaveClick = React.useCallback(() => {
    setIsSavingComment(true);
    onSaveComment(version.id, commentValue, version.version)
      .catch((err) => toastr.error(err))
      .finally(() => {
        setShowEditPanel(false);
        setIsSavingComment(false);
      });
  }, [version.id, version.version, commentValue, onSaveComment]);

  const onCancelClick = React.useCallback(() => {
    setCommentValue(version.comment ?? "");
    setShowEditPanel(false);
  }, [version.comment]);

  const onRestoreClick = React.useCallback(() => {
    onRestore(version.id, version.version).catch((err) => toastr.error(err));
  }, [version.id, version.version, onRestore]);

  const onDeleteClick = React.useCallback(() => {
    onDeleteRequest(version.versionGroup);
  }, [version.versionGroup, onDeleteRequest]);

  const contextOptions = React.useMemo<ContextMenuModel[]>(() => {
    const items: ContextMenuModel[] = [
      {
        id: `version-row_open_${version.id}_${version.version}`,
        key: "open",
        label: openLabel,
        icon: ExternalLinkIcon,
        onClick: onOpen,
      },
    ];

    if (canChangeVersionFileHistory) {
      items.push({
        id: `version-row_edit_${version.id}_${version.version}`,
        key: "edit-comment",
        label: editCommentLabel,
        icon: AccessCommentReactSvgUrl,
        onClick: onEditComment,
      });
    }

    if (index !== 0 && canChangeVersionFileHistory) {
      items.push({
        id: `version-row_restore_${version.id}_${version.version}`,
        key: "restore",
        label: restoreLabel,
        icon: RestoreAuthReactSvgUrl,
        onClick: onRestoreClick,
      });
    }

    items.push({
      id: `version-row_download_${version.id}_${version.version}`,
      key: "download",
      label: `${downloadLabel} (${version.contentLength})`,
      icon: DownloadReactSvgUrl,
      onClick: onDownload,
      disabled: !version.security?.Download,
    });

    if (canDeleteVersion && index !== 0) {
      items.push({ key: "separator", isSeparator: true });
      items.push({
        id: `version-row_delete_${version.id}_${version.version}`,
        key: "delete",
        label: t("Common:Delete"),
        icon: DeleteIcon,
        onClick: onDeleteClick,
      });
    }

    return items;
  }, [
    version.id,
    version.version,
    version.security?.Download,
    version.contentLength,
    openLabel,
    downloadLabel,
    editCommentLabel,
    restoreLabel,
    canChangeVersionFileHistory,
    canDeleteVersion,
    index,
    onOpen,
    onDownload,
    onEditComment,
    onRestoreClick,
    onDeleteClick,
    t,
  ]);

  return (
    <div className={styles.row}>
      <Row
        mode="modern"
        withoutBorder
        contextOptions={contextOptions}
        contextTitle={actionsLabel}
      >
        <div className={styles.rowContent}>
          <div className={styles.rowHeader}>
            <VersionBadge
              className={styles.badge}
              isVersion={isVersion}
              index={index}
              versionGroup={version.versionGroup}
            />
            <div className={styles.versionLinkBox}>
              <Link
                type={LinkType.action}
                fontWeight={600}
                fontSize="14px"
                title={versionDate}
                isTextOverflow
                onClick={onOpen}
                className={styles.versionDate}
              >
                {versionDate}
              </Link>
              {version.updatedBy?.isAnonim ? (
                <Text fontWeight={600} fontSize="14px" title={author}>
                  {author}
                </Text>
              ) : (
                <Link
                  type={LinkType.action}
                  fontWeight={600}
                  fontSize="14px"
                  title={author}
                  isTextOverflow
                >
                  {author}
                </Link>
              )}
            </div>
          </div>
          <div className={styles.commentWrapper}>
            {showEditPanel ? (
              <Textarea
                className={styles.editCommentTextarea}
                wrapperClassName={styles.editCommentTextareaWrapper}
                onChange={onCommentChange}
                fontSize={12}
                heightTextArea="54px"
                value={commentValue}
                isDisabled={isSavingComment}
                autoFocus
                areaSelect
              />
            ) : null}
            {!showEditPanel && version.comment ? (
              <Text className={styles.commentText} truncate>
                {version.comment}
              </Text>
            ) : null}
          </div>
          {showEditPanel ? (
            <div className={styles.editCommentButtons}>
              <div className={styles.editCommentButtonPrimary}>
                <Button
                  isDisabled={isSavingComment}
                  size={ButtonSize.extraSmall}
                  scale
                  primary
                  onClick={onSaveClick}
                  label={t("Common:SaveButton")}
                />
              </div>
              <div className={styles.editCommentButtonSecond}>
                <Button
                  isDisabled={isSavingComment}
                  size={ButtonSize.extraSmall}
                  scale
                  onClick={onCancelClick}
                  label={t("Common:CancelButton")}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Row>
    </div>
  );
};

const VersionHistoryPanel = observer(() => {
  const store = useVersionHistoryStore();
  const { t, i18n } = useTranslation(["Common"]);

  const {
    isVisible,
    file,
    versions,
    isLoading,
    close,
    fileSecurity,
    restoreVersion,
    updateCommentVersion,
    deleteVersion,
    deleteVersionDialogVisible,
    versionSelectedForDeletion,
    setDeleteVersionDialogVisible,
    setVersionSelectedForDeletion,
  } = store;

  const culture = i18n.language || "en";
  const canChangeVersionFileHistory = !!fileSecurity?.EditHistory;
  const canDeleteVersion = !!fileSecurity?.Delete;

  const anonymousLabel = t("Common:Anonymous");
  const openLabel = t("Common:Open");
  const downloadLabel = t("Common:Download");
  const actionsLabel = t("Common:Actions");
  const editCommentLabel = t("Common:EditComment");
  const restoreLabel = t("Common:Restore");
  const title = useResolvedFileTitle(
    versions && versions.length > 0 ? versions[0] : file,
  );

  const onDeleteRequest = React.useCallback(
    (versionGroup: number) => {
      setVersionSelectedForDeletion(versionGroup);
      setDeleteVersionDialogVisible(true);
    },
    [setVersionSelectedForDeletion, setDeleteVersionDialogVisible],
  );

  const onDeleteConfirm = React.useCallback(() => {
    setDeleteVersionDialogVisible(false);
    if (file && versionSelectedForDeletion !== null) {
      deleteVersion(file.id, versionSelectedForDeletion).catch((err) =>
        toastr.error(err),
      );
    }
  }, [
    file,
    versionSelectedForDeletion,
    deleteVersion,
    setDeleteVersionDialogVisible,
  ]);

  const onDeleteDialogClose = React.useCallback(() => {
    setDeleteVersionDialogVisible(false);
    setVersionSelectedForDeletion(null);
  }, [setDeleteVersionDialogVisible, setVersionSelectedForDeletion]);

  return (
    <>
      <ModalDialog
        visible={isVisible}
        onClose={close}
        displayType={ModalDialogType.aside}
        dataTestId="version_history_panel"
      >
        <ModalDialog.Header>{title}</ModalDialog.Header>
        <ModalDialog.Body>
          {isLoading || !versions ? (
            <div className={styles.loader}>
              <Loader type={LoaderTypes.dualRing} size="32px" />
            </div>
          ) : versions.length === 0 ? (
            <Text className={styles.empty}>—</Text>
          ) : (
            <div className={styles.list}>
              {versions.map((v, i) => {
                const prevGroup =
                  i > 0 ? versions[i - 1].versionGroup : undefined;
                const isVersion =
                  prevGroup === undefined || prevGroup !== v.versionGroup;
                return (
                  <VersionRow
                    key={`${v.id}-${v.version}`}
                    version={v}
                    isVersion={isVersion}
                    index={i}
                    culture={culture}
                    anonymousLabel={anonymousLabel}
                    openLabel={openLabel}
                    downloadLabel={downloadLabel}
                    actionsLabel={actionsLabel}
                    editCommentLabel={editCommentLabel}
                    restoreLabel={restoreLabel}
                    canChangeVersionFileHistory={canChangeVersionFileHistory}
                    canDeleteVersion={canDeleteVersion}
                    onRestore={restoreVersion}
                    onSaveComment={updateCommentVersion}
                    onDeleteRequest={onDeleteRequest}
                  />
                );
              })}
            </div>
          )}
        </ModalDialog.Body>
      </ModalDialog>
      {deleteVersionDialogVisible ? (
        <DeleteVersionDialog
          visible={deleteVersionDialogVisible}
          onClose={onDeleteDialogClose}
          onConfirm={onDeleteConfirm}
        />
      ) : null}
    </>
  );
});

export default VersionHistoryPanel;

