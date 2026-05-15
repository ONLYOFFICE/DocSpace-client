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

import React from "react";
import ToggleParam from "SRC_DIR/components/CreateEditDialogParams/ToggleParam";
import IntegrationBar from "./IntegrationBar";

import styles from "./FormRoomBlock.module.scss";

type FormRoomBlockProps = {
  t: (key: string) => string;
  roomParams: {
    saveFormAsXLSX?: boolean;
    sendFormToExternalDB?: boolean;
    [key: string]: unknown;
  };
  setRoomParams: (params: Record<string, unknown>) => void;
  isDisabled?: boolean;
  hasDatabaseConnection?: boolean;
  isRoomAdmin?: boolean;
};

const FormRoomBlock = ({
  t,
  roomParams,
  isDisabled,
  isRoomAdmin,
  setRoomParams,
  hasDatabaseConnection,
}: FormRoomBlockProps) => {
  const onSaveFormAsXLSXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomParams({
      ...roomParams,
      saveFormAsXLSX: e.target.checked,
    });
  };

  const onSendFormToExternalDBChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRoomParams({
      ...roomParams,
      sendFormToExternalDB: e.target.checked,
    });
  };

  return (
    <div className={styles.formRoomBlock}>
      <ToggleParam
        id="save-form-as-xlsx"
        title={t("Common:CollectResultsInXlsx")}
        description={t("Common:CollectResultsInXlsxDescription")}
        isChecked={roomParams.saveFormAsXLSX || false}
        onCheckedChange={onSaveFormAsXLSXChange}
        isDisabled={isDisabled}
      />
      <ToggleParam
        id="send-form-to-external-db"
        title={t("Common:ExportResultsToDatabase")}
        description={t("Common:ExportResultsToDatabaseDescription")}
        isChecked={roomParams.sendFormToExternalDB || false}
        onCheckedChange={onSendFormToExternalDBChange}
        isDisabled={isDisabled || !hasDatabaseConnection}
      />
      <IntegrationBar
        t={t}
        isRoomAdmin={isRoomAdmin}
        hasDatabaseConnection={hasDatabaseConnection}
      />
    </div>
  );
};

export default FormRoomBlock;
