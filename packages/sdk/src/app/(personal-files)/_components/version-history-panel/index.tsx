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

import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.react.svg?url";

import type { TFile } from "@docspace/shared/api/files/types";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { Row } from "@docspace/ui-kit/components/rows";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { Encoder } from "@docspace/ui-kit/utils/encoder";

import { useVersionHistoryStore } from "../../_store/VersionHistoryStore";

import VersionBadge from "./VersionBadge";
import styles from "./VersionHistoryPanel.module.scss";

type VersionRowProps = {
  version: TFile;
  isVersion: boolean;
  index: number;
  culture: string;
  anonymousLabel: string;
  openLabel: string;
  downloadLabel: string;
  actionsLabel: string;
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
}: VersionRowProps) => {
  const versionDate = getCorrectDate(culture, version.updated, "L", "LTS");
  const author = version.updatedBy?.isAnonim
    ? anonymousLabel
    : Encoder.htmlDecode(version.updatedBy?.displayName ?? "");

  const downloadUrl = `${version.viewUrl}&version=${version.version}`;

  const onOpen = React.useCallback(() => {
    window.open(version.webUrl, "_self");
  }, [version.webUrl]);

  const onDownload = React.useCallback(() => {
    window.open(downloadUrl, "_self");
  }, [downloadUrl]);

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

    if (version.security?.Download) {
      items.push({
        id: `version-row_download_${version.id}_${version.version}`,
        key: "download",
        label: `${downloadLabel} (${version.contentLength})`,
        icon: DownloadReactSvgUrl,
        onClick: onDownload,
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
    onOpen,
    onDownload,
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
            <Text
              className={styles.contentLength}
              fontWeight={600}
              fontSize="14px"
            >
              {version.contentLength}
            </Text>
          </div>
          {version.comment ? (
            <div className={styles.commentWrapper}>
              <Text className={styles.commentText} truncate>
                {version.comment}
              </Text>
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

  const { isVisible, file, versions, isLoading, close } = store;

  if (!isVisible || !file) return null;

  const culture = i18n.language || "en";
  const anonymousLabel = t("Common:Anonymous");
  const openLabel = t("Common:Open");
  const downloadLabel = t("Common:Download");
  const actionsLabel = t("Common:Actions");
  const title = versions && versions.length > 0 ? versions[0].title : file.title;

  return (
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
                />
              );
            })}
          </div>
        )}
      </ModalDialog.Body>
    </ModalDialog>
  );
});

export default VersionHistoryPanel;
