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

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  createMetadataField,
  createMetadataTemplate,
  deleteMetadataField,
  updateMetadataField,
  updateMetadataTemplate,
} from "@docspace/shared/api/metadata";
import type { TMetadataTemplate } from "@docspace/shared/api/metadata/types";

import type {
  TFieldDraft,
  TFieldForm,
  TTemplateChanges,
  TTemplateDraft,
} from "../types";
import {
  canSaveTemplate,
  createFieldForm,
  getTemplateChanges,
  isValidField,
  moveItem,
  toFieldRequest,
  toTemplateDraft,
  upsertField,
} from "../utils";

const applyFieldChanges = async (
  templateId: number,
  { updated, removed, created }: TTemplateChanges,
) => {
  await Promise.all(
    updated.map(({ id, data }) => updateMetadataField(templateId, id, data)),
  );
  await Promise.all(removed.map((id) => deleteMetadataField(templateId, id)));
  await Promise.all(
    created.map((data) => createMetadataField(templateId, data)),
  );
};

export const useTemplateEditor = (
  template: TMetadataTemplate | null,
  onSaved: () => void,
) => {
  const { t } = useTranslation(["Common"]);

  const [draft, setDraft] = useState(() => toTemplateDraft(template));
  const [fieldForm, setFieldForm] = useState<TFieldForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const lastFieldKey = useRef(0);

  const isNewField =
    !!fieldForm && !draft.fields.some((field) => field.key === fieldForm.key);

  const changeDraft = (patch: Partial<TTemplateDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const changeFields = (update: (fields: TFieldDraft[]) => TFieldDraft[]) =>
    setDraft((prev) => ({ ...prev, fields: update(prev.fields) }));

  const addField = () =>
    setFieldForm(createFieldForm(`new-${++lastFieldKey.current}`));

  const closeField = () => setFieldForm(null);

  const submitField = () => {
    if (!fieldForm || !isValidField(fieldForm)) return;

    changeFields((fields) => upsertField(fields, fieldForm));
    closeField();
  };

  const moveField = (from: number, to: number) =>
    changeFields((fields) => moveItem(fields, from, to));

  const removeField = (key: string) =>
    changeFields((fields) => fields.filter((field) => field.key !== key));

  const save = async () => {
    const name = draft.name.trim();
    let mayBePartial = false;

    setIsSaving(true);

    try {
      if (!template) {
        await createMetadataTemplate({
          name,
          visible: draft.visible,
          fields: draft.fields.map(toFieldRequest),
        });
      } else {
        const changes = getTemplateChanges(template, draft);

        if (changes.isTemplateChanged) {
          await updateMetadataTemplate(template.id, {
            name,
            visible: draft.visible,
          });
        }

        mayBePartial = true;
        await applyFieldChanges(template.id, changes);
      }

      toastr.success(t("Common:ChangesSavedSuccessfully"));
      onSaved();
    } catch (e) {
      toastr.error(e as string);
      if (mayBePartial) onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return {
    draft,
    fieldForm,
    isNewField,
    isSaving,
    canSave: canSaveTemplate(template, draft),
    changeDraft,
    setFieldForm,
    addField,
    closeField,
    submitField,
    moveField,
    removeField,
    save,
  };
};
