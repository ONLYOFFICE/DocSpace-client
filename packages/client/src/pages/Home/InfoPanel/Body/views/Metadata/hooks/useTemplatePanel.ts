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

import type {
  TEntryMetadataTemplate,
  TMetadataTemplate,
  TMetadataValueRequest,
} from "@docspace/shared/api/metadata/types";
import type { TMetadataInput } from "@docspace/shared/utils/metadata";

import type { TTemplateForm } from "../types";
import {
  createTemplateForm,
  getChangedValues,
  isTemplateFormValid,
  toEntryTemplate,
} from "../utils";

type TUseTemplatePanelProps = {
  template?: TEntryMetadataTemplate;
  onSubmit: (
    templateId: number,
    values: TMetadataValueRequest[],
  ) => Promise<boolean>;
  onClose: () => void;
};

export const useTemplatePanel = ({
  template,
  onSubmit,
  onClose,
}: TUseTemplatePanelProps) => {
  const [selected, setSelected] = useState<TMetadataTemplate | null>(null);
  const [form, setForm] = useState<TTemplateForm | null>(() =>
    template ? createTemplateForm(template) : null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const isNew = !template;
  const values = form ? getChangedValues(form) : [];
  const canSave =
    !!form && isTemplateFormValid(form) && (isNew || !!values.length);

  const openForm = (template = selected) => {
    if (!template) return;

    setSelected(template);
    setForm(createTemplateForm(toEntryTemplate(template)));
  };

  const closeForm = () => setForm(null);

  const setInput = (fieldId: number, input: TMetadataInput) =>
    setForm(
      (prev) => prev && { ...prev, inputs: { ...prev.inputs, [fieldId]: input } },
    );

  const save = async () => {
    if (!form) return;

    setIsSaving(true);

    if (await onSubmit(form.template.id, values)) onClose();
    else setIsSaving(false);
  };

  return {
    selected,
    setSelected,
    form,
    isNew,
    canSave,
    isSaving,
    openForm,
    closeForm,
    setInput,
    save,
  };
};
