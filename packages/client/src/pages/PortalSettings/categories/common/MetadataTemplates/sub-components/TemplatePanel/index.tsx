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

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import type { TMetadataTemplate } from "@docspace/shared/api/metadata/types";

import ConfirmDeleteDialog from "SRC_DIR/components/ConfirmDeleteDialog";

import { useTemplateEditor } from "../../hooks/useTemplateEditor";
import { isFieldNameTaken, isValidField } from "../../utils";
import FieldForm from "./FieldForm";
import TemplateForm from "./TemplateForm";

type TemplatePanelProps = {
  template: TMetadataTemplate | null;
  onClose: () => void;
  onSaved: () => void;
};

const TemplatePanel = ({ template, onClose, onSaved }: TemplatePanelProps) => {
  const { t } = useTranslation(["Metadata", "Files", "Common"]);

  const {
    draft,
    fieldForm,
    isNewField,
    isSaving,
    canSave,
    hasRemovedFields,
    changeDraft,
    setFieldForm,
    addField,
    closeField,
    submitField,
    moveField,
    removeField,
    save,
  } = useTemplateEditor(template, onSaved);

  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const onSave = () =>
    hasRemovedFields ? setIsDeleteConfirmVisible(true) : save();

  const isNameTaken = !!fieldForm && isFieldNameTaken(draft.fields, fieldForm);

  const getTitle = () => {
    if (fieldForm)
      return isNewField ? t("Metadata:AddField") : t("Metadata:EditField");

    return template ? t("Files:EditTemplate") : t("Metadata:NewTemplate");
  };

  return (
    <>
      <ModalDialog
        visible
        withBodyScroll
        displayType={ModalDialogType.aside}
        isBackButton={!!fieldForm}
        onBackClick={closeField}
        onClose={onClose}
        dataTestId="metadata_template_panel"
      >
        <ModalDialog.Header>{getTitle()}</ModalDialog.Header>

        <ModalDialog.Body>
          {fieldForm ? (
            <FieldForm
              value={fieldForm}
              isNameTaken={isNameTaken}
              onChange={setFieldForm}
            />
          ) : (
            <TemplateForm
              draft={draft}
              onChange={changeDraft}
              onAddField={addField}
              onEditField={setFieldForm}
              onMoveField={moveField}
              onRemoveField={removeField}
            />
          )}
        </ModalDialog.Body>

        <ModalDialog.Footer>
          {fieldForm ? (
            <Button
              primary
              scale
              size={ButtonSize.normal}
              label={
                isNewField ? t("Common:AddButton") : t("Common:SaveButton")
              }
              isDisabled={!isValidField(fieldForm) || isNameTaken}
              onClick={submitField}
              testId="metadata_field_submit_button"
            />
          ) : (
            <Button
              primary
              scale
              size={ButtonSize.normal}
              label={t("Common:SaveButton")}
              isDisabled={!canSave}
              isLoading={isSaving}
              onClick={onSave}
              testId="metadata_template_save_button"
            />
          )}
          <Button
            scale
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            onClick={fieldForm ? closeField : onClose}
            testId="metadata_cancel_button"
          />
        </ModalDialog.Footer>
      </ModalDialog>

      {isDeleteConfirmVisible ? (
        <ConfirmDeleteDialog
          title={t("Metadata:DeleteFieldsTitle")}
          description={t("Metadata:DeleteFieldsDescription")}
          onDelete={save}
          onClose={() => setIsDeleteConfirmVisible(false)}
        />
      ) : null}
    </>
  );
};

export default TemplatePanel;
