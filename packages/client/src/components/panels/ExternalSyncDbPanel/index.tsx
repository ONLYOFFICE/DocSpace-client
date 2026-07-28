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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { OPERATIONS_NAME } from "@docspace/ui-kit/constants";

import ClearReactSvgUrl from "PUBLIC_DIR/images/icons/17/clear.react.svg?url";
import AlertIcon from "@docspace/ui-kit/assets/info.outline.react.svg";
import TickIcon from "@docspace/ui-kit/assets/check.edit.react.svg";
import PDFIcon from "PUBLIC_DIR/images/icons/32/pdf.svg";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";

import type { ExternalSyncDB } from "@docspace/shared/api/rooms/types";

import styles from "./ExternalSyncDbPanel.module.scss";

type FormEntry = ExternalSyncDB["forms"][number];

interface ExternalSyncDbPanelProps {
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
  data: {
    forms: FormEntry[];
    operationId: null | number;
  };
}

const ExternalSyncDbPanel = ({
  visible,
  onClose,
  onClear,
  data,
}: ExternalSyncDbPanelProps) => {
  const { t } = useTranslation(["Files"]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
      headerIcons={[
        { key: "sync-db-clear", url: ClearReactSvgUrl, onClick: onClear },
      ]}
    >
      <ModalDialog.Header>{t("SyncWithDatabase")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.list}>
          {data.forms.map((form) => (
            <div key={form.id} className={styles.row}>
              <PDFIcon className={styles.fileIcon} />
              <Text className={styles.title} fontSize="14px" truncate>
                {form.title}
              </Text>
              {form.success ? (
                <TickIcon className={styles.tick} />
              ) : (
                <AlertIcon
                  className={styles.alert}
                  data-tooltip-id="external-sync-db-tooltip"
                  data-tooltip-content={form.error}
                  data-tooltip-place="left"
                />
              )}
            </div>
          ))}
          <Tooltip id="external-sync-db-tooltip" maxWidth="280px" />
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore, uploadDataStore }: TStore) => {
  const { clearSecondaryProgressData } =
    uploadDataStore.secondaryProgressDataStore;

  return {
    visible: dialogsStore.isSyncDbPanelVisible,
    onClose: () => dialogsStore.setIsSyncDbPanelVisible(false),
    onClear: () => {
      clearSecondaryProgressData(
        dialogsStore.syncDbData.operationId,
        OPERATIONS_NAME.syncDatabase,
      );
      dialogsStore.setIsSyncDbPanelVisible(false);
      dialogsStore.setSyncDbForms({
        forms: [],
        operationId: null,
      });
    },
    data: dialogsStore.syncDbData,
  };
})(observer(ExternalSyncDbPanel));
