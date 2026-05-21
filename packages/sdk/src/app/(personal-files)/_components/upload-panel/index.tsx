/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { LoadingButton } from "@docspace/ui-kit/components/loading-button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import ClearSvgUrl from "PUBLIC_DIR/images/icons/17/clear.react.svg?url";

import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";

import FileRow from "./file-row";
import styles from "./upload-panel.module.scss";

const UploadPanel = observer(() => {
  const { t } = useTranslation(["Common"]);
  const uploadStore = useUploadStore();

  const onClose = () => {
    uploadStore.setPanelVisible(false);
  };

  const onClear = () => {
    uploadStore.clearFinished();
    uploadStore.setPanelVisible(false);
  };

  const onCancelBatch = () => {
    uploadStore.cancelBatch();
  };

  const onCancelItem = (uniqueId: string) => {
    uploadStore.cancelItem(uniqueId);
  };

  const title = t("Common:Uploading");

  return (
    <ModalDialog
      visible={uploadStore.panelVisible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
    >
      <ModalDialog.Header>
        <span className={styles.headerActions}>
          <span>{title}</span>
          {uploadStore.isUploading ? (
            <LoadingButton
              percent={uploadStore.percent}
              onClick={onCancelBatch}
              isDefaultMode
            />
          ) : uploadStore.hasItems ? (
            <IconButton
              iconName={ClearSvgUrl}
              size={17}
              onClick={onClear}
              className={styles.clearButton}
            />
          ) : null}
        </span>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.uploadBody}>
          {uploadStore.items.map((item) => (
            <FileRow key={item.uniqueId} item={item} onCancel={onCancelItem} />
          ))}
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
});

export default UploadPanel;

