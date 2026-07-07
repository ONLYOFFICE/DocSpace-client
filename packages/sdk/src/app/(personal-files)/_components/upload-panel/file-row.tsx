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
    <div className={styles.fileRow} data-error={isError ? "" : undefined}>
      <div className={styles.fileIconWrap}>
        {/* biome-ignore lint/performance/noImgElement: bundled static asset; next/image is not applicable */}
        <img
          className={isError ? "img_error" : undefined}
          src={fileIcon}
          alt=""
        />
      </div>

      <div className="upload-panel_file-name">
        <Text
          as="span"
          fontWeight={600}
          truncate
          className="upload-panel-file-error_text"
          title={item.fileName}
        >
          {name}
          {ext ? (
            <Text as="span" fontWeight={600} className="file-exst">
              {ext}
            </Text>
          ) : null}
        </Text>
      </div>

      <div className="actions-wrapper">
        {isDone ? (
          <CheckReactSvg className="upload-panel_check-button" />
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
              <Text className="upload-panel_percent-text">
                {Math.trunc(item.percent)}%
              </Text>
            ) : null}
            <IconButton
              iconName={CrossSvgUrl}
              size={16}
              className="upload-panel_close-button"
              onClick={() => onCancel(item.uniqueId)}
            />
          </>
        )}
      </div>

      {showProgress ? (
        <div className={styles.progressWrap}>
          <ProgressBar percent={item.percent} />
          {item.label ? (
            <Text fontSize="11px" className={styles.phaseLabel}>
              {item.label}
            </Text>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

export default FileRow;
