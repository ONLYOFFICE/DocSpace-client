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

import type {
  TCustomField,
  TCustomFieldRequest,
} from "@docspace/shared/api/metadata/types";

import type { TCustomFieldDraft } from "../types";
import {
  canAddCustomField,
  createCustomFieldDraft,
  getCustomFieldChanges,
  isCustomFieldNameTaken,
  isValidCustomFieldDraft,
  toCustomFieldDrafts,
} from "../utils";

type TUseCustomFieldsFormProps = {
  fields: TCustomField[];
  withNewField: boolean;
  onSubmit: (fields: TCustomFieldRequest[]) => Promise<boolean>;
  onClose: () => void;
};

export const useCustomFieldsForm = ({
  fields,
  withNewField,
  onSubmit,
  onClose,
}: TUseCustomFieldsFormProps) => {
  const lastDraftKey = useRef(0);

  const createDraft = () =>
    createCustomFieldDraft(`new-${++lastDraftKey.current}`);

  const [initialFields] = useState(fields);
  const [drafts, setDrafts] = useState(() => [
    ...toCustomFieldDrafts(initialFields),
    ...(withNewField ? [createDraft()] : []),
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const changes = getCustomFieldChanges(initialFields, drafts);
  const canSave =
    !!changes.length &&
    drafts.every((draft) =>
      isValidCustomFieldDraft(draft, initialFields, drafts),
    );

  const isNameTaken = (draft: TCustomFieldDraft) =>
    draft.isNew && isCustomFieldNameTaken(draft, initialFields, drafts);

  const addDraft = () => setDrafts((prev) => [...prev, createDraft()]);

  const changeDraft = (draft: TCustomFieldDraft) =>
    setDrafts((prev) =>
      prev.map((item) => (item.key === draft.key ? draft : item)),
    );

  const removeDraft = (key: string) =>
    setDrafts((prev) => prev.filter((item) => item.key !== key));

  const save = async () => {
    setIsSaving(true);

    if (await onSubmit(changes)) onClose();
    else setIsSaving(false);
  };

  return {
    drafts,
    canAdd: canAddCustomField(drafts.length),
    canSave,
    isSaving,
    isNameTaken,
    addDraft,
    changeDraft,
    removeDraft,
    save,
  };
};
