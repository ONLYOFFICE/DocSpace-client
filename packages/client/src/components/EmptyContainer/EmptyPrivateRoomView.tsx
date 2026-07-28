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

import { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Events } from "@docspace/shared/enums";
import { EmptyView } from "@docspace/shared/components/empty-view";
import type { EmptyViewOptionsType } from "@docspace/shared/components/empty-view";
import type { Nullable } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";

import EmptyPrivateRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.private.room.light.svg";
import EmptyPrivateRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.private.room.dark.svg";
import UploadDeviceIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";
import CreateNewFileIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import SecurityShieldIcon from "PUBLIC_DIR/images/icons/16/security.react.svg";
import DocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import PresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";

import styles from "./EmptyPrivateRoomView.module.scss";

type EmptyPrivateRoomViewProps = {
  security?: Nullable<TFolderSecurity | TRoomSecurity>;
  canCreateEncrypted?: boolean;
};

const EmptyPrivateRoomView = ({
  security,
  canCreateEncrypted,
}: EmptyPrivateRoomViewProps) => {
  const { t } = useTranslation(["EmptyView", "Common", "Translations"]);
  const { isBase } = useTheme();

  const items = [
    t("Common:PrivateRoomEmptyBenefitE2EE"),
    t("Common:PrivateRoomEmptyBenefitAEAD"),
    t("Common:PrivateRoomEmptyBenefitHPKE"),
    t("Common:PrivateRoomEmptyBenefitKDF"),
  ];

  const dispatchCreate = useCallback(
    (extension?: string) => {
      if (extension === "pdf" && isMobile) {
        toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
        return;
      }

      const event: Event & { payload?: unknown } = new Event(Events.CREATE);
      (event as Event & { payload?: object }).payload = {
        id: -1,
        extension,
        edit: extension === "pdf",
      };
      window.dispatchEvent(event);
    },
    [t],
  );

  const onUploadFiles = useCallback(() => {
    const input = document.querySelector(
      ".custom-file-input-article",
    ) as HTMLElement | null;
    input?.click();
  }, []);

  const canCreate = !!security?.Create;

  const options: EmptyViewOptionsType = [];

  if (canCreate) {
    if (canCreateEncrypted) {
      options.push({
        title: t("EmptyView:CreateNewFileTitle"),
        description: t("EmptyView:CreateNewFileDescription"),
        icon: <CreateNewFileIcon />,
        key: "create-file",
        model: [
          {
            key: "create-document",
            label: t("Common:Document"),
            icon: DocumentsReactSvgUrl,
            onClick: () => dispatchCreate("docx"),
          },
          {
            key: "create-spreadsheet",
            label: t("Common:Spreadsheet"),
            icon: SpreadsheetReactSvgUrl,
            onClick: () => dispatchCreate("xlsx"),
          },
          {
            key: "create-presentation",
            label: t("Common:Presentation"),
            icon: PresentationReactSvgUrl,
            onClick: () => dispatchCreate("pptx"),
          },
          {
            key: "create-pdf-form",
            label: t("Translations:NewForm"),
            icon: FormReactSvgUrl,
            onClick: () => dispatchCreate("pdf"),
          },
          { isSeparator: true, key: "separator" },
          {
            key: "create-folder",
            label: t("Common:Folder"),
            icon: FolderReactSvgUrl,
            onClick: () => dispatchCreate(undefined),
          },
        ],
      });
    } else {
      options.push({
        title: t("Common:NewFolder"),
        description: t("EmptyView:CreateNewFileDescription"),
        icon: <CreateNewFileIcon />,
        key: "create-folder",
        onClick: () => dispatchCreate(undefined),
      });
    }

    options.push({
      title: t("EmptyView:UploadDeviceOptionTitle"),
      description: t("EmptyView:UploadDeviceOptionDescription"),
      icon: <UploadDeviceIcon />,
      key: "upload-device",
      onClick: onUploadFiles,
    });
  }

  const description = (
    <ul className={styles.list}>
      {items.map((text) => (
        <li key={text} className={styles.listItem}>
          <SecurityShieldIcon />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <EmptyView
      icon={isBase ? <EmptyPrivateRoomLightIcon /> : <EmptyPrivateRoomDarkIcon />}
      title={t("Common:PrivateRoomEmptyTitle")}
      description={description}
      options={options}
    />
  );
};

const InjectedEmptyPrivateRoomView = inject<TStore>(
  ({ selectedFolderStore, uploadDataStore }) => {
    return {
      security: selectedFolderStore.security,
      canCreateEncrypted: uploadDataStore.shouldEncryptCurrentUpload(),
    };
  },
)(observer(EmptyPrivateRoomView));

export default InjectedEmptyPrivateRoomView;
