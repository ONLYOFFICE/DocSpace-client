// (c) Copyright Ascensio System SIA 2009-2026
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
