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
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";

import styles from "./ConvertDialog.module.scss";

export type ConvertFormat = ".docx" | ".xlsx";

type ConvertDialogProps = {
  visible: boolean;
  fileExst: string;
  storeOriginalFiles: boolean;
  isConverting: boolean;
  onChangeStoreOriginal: (next: boolean) => void;
  onClose: () => void;
  onConfirm: (format: ConvertFormat | null) => void;
};

const ConvertDialog = ({
  visible,
  fileExst,
  storeOriginalFiles,
  isConverting,
  onChangeStoreOriginal,
  onClose,
  onConfirm,
}: ConvertDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const isXML = fileExst?.includes(".xml");

  const options = React.useMemo(
    () => [
      { label: t("Common:Document"), value: ".docx" },
      { label: t("Common:Spreadsheet"), value: ".xlsx" },
    ],
    [t],
  );

  const [selectedFormat, setSelectedFormat] =
    React.useState<ConvertFormat>(".docx");

  React.useEffect(() => {
    if (visible) {
      setSelectedFormat(".docx");
    }
  }, [visible]);

  const onChangeRadio = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedFormat(e.target.value as ConvertFormat);
    },
    [],
  );

  const onChangeOriginal = React.useCallback(() => {
    onChangeStoreOriginal(!storeOriginalFiles);
  }, [storeOriginalFiles, onChangeStoreOriginal]);

  const handleConfirm = React.useCallback(() => {
    onConfirm(isXML ? selectedFormat : null);
  }, [isXML, selectedFormat, onConfirm]);

  return (
    <ModalDialog visible={visible} onClose={onClose} autoMaxHeight>
      <ModalDialog.Header>
        {t("Common:DocumentConversionTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body className={styles.body}>
        <Text>
          {isXML
            ? t("Common:ConversionXmlMessage")
            : t("Common:OpenFileMessage")}
        </Text>

        {isXML ? (
          <div className={styles.formatSection}>
            <Text>{t("Common:SelectFileType")}</Text>
            <RadioButtonGroup
              orientation="vertical"
              options={options}
              name="convert-file-type"
              selected={selectedFormat}
              onClick={onChangeRadio}
              spacing="12px"
              className={styles.radioGroup}
            />
          </div>
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <div className={styles.footer}>
          <div className={styles.checkboxes}>
            <Checkbox
              label={t("Common:SaveOriginalFormatMessage")}
              isChecked={storeOriginalFiles}
              onChange={onChangeOriginal}
              isDisabled={isConverting}
            />
          </div>
          <div className={styles.buttons}>
            <Button
              label={t("Common:ContinueButton")}
              size={ButtonSize.normal}
              primary
              scale
              onClick={handleConfirm}
              isLoading={isConverting}
            />
            <Button
              label={t("Common:CloseButton")}
              size={ButtonSize.normal}
              scale
              onClick={onClose}
              isDisabled={isConverting}
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ConvertDialog;

