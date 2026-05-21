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

import UploadIcon from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import EyeIcon from "PUBLIC_DIR/images/eye.react.svg?url";
import ResetIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import DownloadIcon from "PUBLIC_DIR/images/icons/16/download.react.svg?url";

import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { Badge } from "@docspace/ui-kit/components/badge";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
import { Text } from "@docspace/ui-kit/components/text";
import { TDefaultTemplateItem } from "@docspace/shared/types";
import { UrlActionType } from "@docspace/shared/enums";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import {
  getTitleWithoutExtension,
  getUpperCaseExtension,
} from "@docspace/shared/utils";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { LANGUAGE } from "@docspace/shared/constants";

import FilesSelector from "SRC_DIR/components/FilesSelector";
import { ResetTemplateDialog } from "SRC_DIR/components/dialogs";

import { TFile } from "./TemplatesRow.types";
import styles from "./DefaultTemplates.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type Props = {
  item: TDefaultTemplateItem;
  getFileIcon?: TStore["filesSettingsStore"]["getFileIcon"];
  setTemplate?: TStore["defaultTemplatesStore"]["setTemplate"];
  resetTemplate?: TStore["defaultTemplatesStore"]["resetTemplate"];
  getFilterParam?: TStore["defaultTemplatesStore"]["getFilterParam"];
  openUrl?: TStore["settingsStore"]["openUrl"];
  uploadTemplate?: TStore["defaultTemplatesStore"]["uploadTemplate"];
  openDocEditor?: TStore["filesStore"]["openDocEditor"];
  culture?: TStore["settingsStore"]["culture"];
  index?: number;
};

const TemplatesRow = ({
  item,
  getFileIcon,
  getFilterParam,
  setTemplate,
  resetTemplate,
  openUrl,
  uploadTemplate,
  openDocEditor,
  culture,
  index,
}: Props) => {
  const { t } = useTranslation(["Settings", "EmptyView", "Common"]);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getOptions = () => {
    const selectOption = [
      {
        key: "upload-from-docspace",
        label: t("EmptyView:UploadFromPortalTitle", {
          productName: getBrandName("ProductName"),
        }),
        onClick: () => setIsSelectorVisible(true),
        disabled: false,
        icon: UploadIcon,
      },
      {
        key: "upload-from-device",
        label: t("EmptyView:UploadDevicePDFFormOptionTitle"),
        onClick: () => {
          setTimeout(() => {
            fileInputRef.current?.click();
          }, 100);
        },
        disabled: false,
        icon: UploadIcon,
      },
    ];

    if (item?.isModified) {
      return [
        ...selectOption,
        {
          key: "separator",
          isSeparator: true,
        },
        {
          key: "preview",
          label: t("Common:Preview"),
          onClick: () => openDocEditor?.(item.id, true),
          disabled: false,
          icon: EyeIcon,
        },
        {
          key: "download",
          label: t("Common:Download"),
          onClick: () => openUrl?.(item.viewUrl, UrlActionType.Download),
          disabled: false,
          icon: DownloadIcon,
        },
        {
          key: "reset",
          label: t("Settings:ResetToDefault"),
          onClick: () => setIsDialogVisible(true),
          disabled: false,
          icon: ResetIcon,
        },
      ];
    }
    return selectOption;
  };

  const onSelectFile = (file: TFile) => {
    setTemplate?.(file.id, file.fileExst);
  };

  const onResetFile = () => {
    resetTemplate?.(item.fileExst);
    setIsDialogVisible(false);
  };

  const icon = getFileIcon?.(item.fileExst);

  const badgeBackgroundColor = item.isModified
    ? "var(--modified-badge-active-background-color)"
    : "var(--modified-badge-background-color)";

  const filterParam = getFilterParam?.(item.fileExst);

  const locale = getCookie(LANGUAGE) ?? culture ?? "en";
  const lastModified = item.lastModified
    ? getCorrectDate(locale, item.lastModified)
    : t("Settings:NotModified");

  return (
    <div
      className={styles.templateRow}
      data-testid={`default-template-row-${index}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={item.fileExst}
        style={{ display: "none" }}
        onChange={(event) => uploadTemplate?.(event, item.fileExst)}
      />
      <ResetTemplateDialog
        isVisible={isDialogVisible}
        onReset={() => onResetFile()}
        onClose={() => setIsDialogVisible(false)}
      />
      <ReactSVG src={icon} className={styles.icon} />
      <div className={styles.rowContent}>
        <div className={styles.mainContent}>
          <Text fontWeight={600} fontSize="13px" truncate>
            {getTitleWithoutExtension(item, false)}
          </Text>
          <Text
            className={styles.modifiedText}
            containerMinWidth="120px"
            fontSize="12px"
            lineHeight="16px"
            fontWeight={600}
            truncate
          >
            {lastModified} | {getUpperCaseExtension(item.fileExst)}
            {item?.fileSize
              ? " | " + getConvertedSize(t, item?.fileSize)
              : null}
          </Text>
        </div>

        <Badge
          className={styles.badge}
          backgroundColor={badgeBackgroundColor}
          label={item.isModified ? t("Common:Customized") : t("Common:Default")}
          noHover
          fontSize="9px"
          fontWeight={700}
          lineHeight="100%"
          padding="2px 5px"
        />
      </div>
      <ContextMenuButton
        className={styles.contextMenuButton}
        directionX="left"
        directionY="both"
        getData={getOptions}
      />
      {isSelectorVisible ? (
        /* @ts-expect-error need pass all props */
        <FilesSelector
          key="select-default-template-dialog"
          filterParam={filterParam}
          isPanelVisible={isSelectorVisible}
          onSelectFile={(file) => onSelectFile(file as TFile)}
          onClose={() => setIsSelectorVisible(false)}
          acceptButtonLabel={t("Common:SelectAction")}
          isMultiSelect={false}
          withRecentTreeFolder
          withFavoritesTreeFolder
          withAIAgentsTreeFolder
          openRoot
          isSelect
        />
      ) : null}
    </div>
  );
};

export default inject(
  ({
    filesSettingsStore,
    defaultTemplatesStore,
    settingsStore,
    filesStore,
  }: TStore) => {
    const { getFileIcon } = filesSettingsStore;
    const { setTemplate, getFilterParam, resetTemplate, uploadTemplate } =
      defaultTemplatesStore;

    const { openUrl, culture } = settingsStore;

    const { openDocEditor } = filesStore;

    return {
      getFileIcon,
      getFilterParam,
      setTemplate,
      resetTemplate,
      openUrl,
      uploadTemplate,
      culture,
      openDocEditor,
    };
  },
)(observer(TemplatesRow));
