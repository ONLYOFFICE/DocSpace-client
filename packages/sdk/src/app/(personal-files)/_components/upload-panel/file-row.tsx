/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";

import CrossSvgUrl from "PUBLIC_DIR/images/icons/16/cross.react.svg?url";
import CheckReactSvg from "PUBLIC_DIR/images/check.edit.react.svg";

import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import type { TUploadItem } from "@/app/(docspace)/_store/UploadStore";

import styles from "./upload-panel.module.scss";

type FileRowProps = {
  item: TUploadItem;
  onCancel: (uniqueId: string) => void;
};

const splitName = (fileName: string): { name: string; ext: string } => {
  const idx = fileName.lastIndexOf(".");
  if (idx <= 0) return { name: fileName, ext: "" };
  return {
    name: fileName.slice(0, idx),
    ext: fileName.slice(idx),
  };
};

const FileRow = observer(({ item, onCancel }: FileRowProps) => {
  const { t } = useTranslation(["Common"]);
  const { filesSettings } = useFilesSettingsStore();
  const { getIcon } = useItemIcon({
    filesSettings: filesSettings ?? undefined,
  });

  const { name, ext } = splitName(item.fileName);
  const fileIcon = getIcon(ext, 32);

  const isDone = item.status === "uploaded";
  const isError = item.status === "error";
  const showProgress = item.status === "uploading";

  return (
    <div
      className={`${styles.fileRow}${isError ? ` ${styles.fileRowError}` : ""}`}
    >
      <div className={styles.fileIconWrap}>
        {/* biome-ignore lint/performance/noImgElement: bundled static asset; next/image is not applicable */}
        <img
          className={`${styles.fileIcon}${isError ? ` ${styles.iconError}` : ""}`}
          src={fileIcon}
          alt=""
        />
      </div>

      <div className={styles.fileName}>
        <Text
          as="span"
          fontWeight={600}
          truncate
          className={styles.fileNameText}
          title={item.fileName}
        >
          {name}
          {ext ? (
            <Text as="span" fontWeight={600} className={styles.fileExt}>
              {ext}
            </Text>
          ) : null}
        </Text>
      </div>

      <div className={styles.actionsWrapper}>
        {isDone ? (
          <CheckReactSvg className={styles.checkButton} />
        ) : isError ? (
          <Link
            fontSize="12px"
            fontWeight={600}
            type={LinkType.action}
            className={styles.errorText}
            title={item.error}
          >
            {t("Common:Error")}
          </Link>
        ) : (
          <>
            {item.percent >= 0 ? (
              <Text className={styles.percentText}>
                {Math.trunc(item.percent)}%
              </Text>
            ) : null}
            <IconButton
              iconName={CrossSvgUrl}
              size={16}
              className={styles.closeButton}
              onClick={() => onCancel(item.uniqueId)}
            />
          </>
        )}
      </div>

      {showProgress ? (
        <div className={styles.progressWrap}>
          <ProgressBar percent={item.percent} />
        </div>
      ) : null}
    </div>
  );
});

export default FileRow;

