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

import PlusReactSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";

import { useTranslation } from "react-i18next";

import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import type {
  TCustomField,
  TCustomFieldRequest,
} from "@docspace/shared/api/metadata/types";

import { useCustomFieldsForm } from "../../hooks/useCustomFieldsForm";
import CustomFieldForm from "./CustomFieldForm";
import CustomFieldRow from "./CustomFieldRow";
import styles from "../Panel.module.scss";

type CustomFieldsPanelProps = {
  fields: TCustomField[];
  withNewField: boolean;
  onSubmit: (fields: TCustomFieldRequest[]) => Promise<boolean>;
  onClose: () => void;
};

const CustomFieldsPanel = ({
  fields,
  withNewField,
  onSubmit,
  onClose,
}: CustomFieldsPanelProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);

  const {
    drafts,
    newField,
    canAdd,
    canSave,
    canSubmitNewField,
    isSaving,
    isNameTaken,
    openNewField,
    closeNewField,
    changeNewField,
    submitNewField,
    changeDraft,
    removeDraft,
    save,
  } = useCustomFieldsForm({ fields, withNewField, onSubmit, onClose });

  return (
    <ModalDialog
      visible
      withBodyScroll
      withoutPadding
      displayType={ModalDialogType.aside}
      isBackButton={!!newField}
      onBackClick={closeNewField}
      onClose={onClose}
      dataTestId="metadata_custom_fields_panel"
    >
      <ModalDialog.Header>
        {newField ? t("Metadata:AddField") : t("Metadata:CustomFields")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.body}>
          {newField ? (
            <CustomFieldForm
              draft={newField}
              isNameTaken={isNameTaken(newField)}
              onChange={changeNewField}
            />
          ) : (
            <div className={styles.form}>
              <AddButton
                iconName={PlusReactSvgUrl}
                label={t("Metadata:AddField")}
                isDisabled={!canAdd}
                onClick={openNewField}
                testId="metadata_custom_field_add_button"
              />
              {drafts.map((draft) => (
                <CustomFieldRow
                  key={draft.key}
                  draft={draft}
                  canRename
                  isValueRequired
                  isNameTaken={isNameTaken(draft)}
                  onChange={changeDraft}
                  onRemove={() => removeDraft(draft.key)}
                />
              ))}
            </div>
          )}
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        {newField ? (
          <Button
            primary
            scale
            size={ButtonSize.normal}
            label={t("Common:AddButton")}
            isDisabled={!canSubmitNewField}
            onClick={submitNewField}
            testId="metadata_custom_field_submit_button"
          />
        ) : (
          <Button
            primary
            scale
            size={ButtonSize.normal}
            label={t("Common:SaveButton")}
            isDisabled={!canSave}
            isLoading={isSaving}
            onClick={save}
            testId="metadata_custom_fields_save_button"
          />
        )}
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isSaving}
          onClick={newField ? closeNewField : onClose}
          testId="metadata_custom_fields_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default CustomFieldsPanel;
