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

import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";

import { toastr } from "@docspace/ui-kit/components/toast";

import { useTagManagement } from "./TagManagement.provider";
import { stopPropagation } from "./TagManagement.utils";
import { EDIT_TAG_FORM_NAME } from "./TagManagement.constants";
import type {
  FormValues,
  TagManagementContentProps,
} from "./TagManagement.types";

/**
 * Everything the tag list does, as opposed to how it looks.
 *
 * The rows are one screen of markup and one set of rules about what a click on
 * them means, and the two change for different reasons - so the rules live
 * here and the markup renders whatever this returns.
 */
export const useTagManagementService = ({
  confirmDeleteTag,
  confirmEditTag,
  onTagsChanged,
}: TagManagementContentProps) => {
  const { control, handleSubmit, setValue, resetField } = useForm({
    defaultValues: {
      [EDIT_TAG_FORM_NAME]: "",
    },
    shouldUnregister: true,
  });

  const { t } = useTranslation("Common");
  const {
    tags,
    setTags,
    bindTag,
    renameTag,
    removeTag,
    pendingLabel,
    isPending,
  } = useTagManagement();

  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const toggleChecked = useCallback(
    (label: string) => {
      if (isPending) return;

      const current = tags.find((tag) => tag.label === label);

      if (!current) return;

      const checked = !current.checked;

      // Names the one tag it is about, in both directions. A whole list
      // written back from here - on success or on failure - would also carry
      // rows as they were when this callback was made, undoing anything that
      // has changed since. The confirmation dialogs make that window long: the
      // guard above is passed before a modal opens, not held while it is open.
      const setChecked = (value: boolean) =>
        setTags((prev) =>
          prev.map((tag) =>
            tag.label === label ? { ...tag, checked: value } : tag,
          ),
        );

      setChecked(checked);

      bindTag(
        { label, checked },
        {
          onSuccess: () => onTagsChanged?.(),
          onError: (error) => {
            toastr.error(error);
            console.error("Failed to update room tags:", error);
            setChecked(current.checked);
          },
        },
      );
    },
    [isPending, tags, setTags, bindTag, onTagsChanged],
  );

  const handleEdit = useCallback(
    (event: MouseEvent<HTMLDivElement>, label: string) => {
      stopPropagation(event);
      setEditingLabel(label);

      setValue(EDIT_TAG_FORM_NAME, label);
    },
    [setValue],
  );

  const cancelEdit = useCallback(() => {
    setEditingLabel(null);
    resetField(EDIT_TAG_FORM_NAME);
  }, [resetField]);

  const confirmEdit = useCallback(
    async (submitValue: FormValues) => {
      if (editingLabel === null || isPending) return;

      const newLabel = submitValue[EDIT_TAG_FORM_NAME].trim();
      const oldLabel = editingLabel;

      if (newLabel === oldLabel) {
        return cancelEdit();
      }

      if (newLabel.length === 0) {
        console.error("Tag name cannot be empty");
        return;
      }

      // The whole list, not the filtered one: a tag the search is hiding is
      // still a tag the rename would collide with. Compared case-insensitively,
      // because two tags that differ in case only read as the same name.
      const isTaken = tags.some(
        (tag) =>
          tag.label !== oldLabel &&
          tag.label.trim().toLowerCase() === newLabel.toLowerCase(),
      );

      if (isTaken) {
        // Nothing is sent and the row stays in edit mode, so the name can be
        // corrected instead of retyped.
        toastr.error(t("Common:TagAlreadyExists", { tagName: newLabel }));
        return;
      }

      // Renames the one row, either way round. The rollback runs after two
      // awaits, the second of them a modal the user answers in their own time,
      // so it must not carry a copy of the whole list back with it.
      const rename = (from: string, to: string) =>
        setTags((prev) =>
          prev.map((tag) => (tag.label === from ? { ...tag, label: to } : tag)),
        );

      try {
        cancelEdit();

        // Refusing is an answer, not a failure, so nothing is sent and there
        // is nothing to report.
        if (!(await confirmEditTag())) return;

        rename(oldLabel, newLabel);

        await renameTag({ oldLabel, newLabel });
      } catch (error) {
        rename(newLabel, oldLabel);
        toastr.error(error as Error);
        console.error("Failed to update tag name:", error);
      }
    },
    [
      editingLabel,
      isPending,
      tags,
      setTags,
      cancelEdit,
      confirmEditTag,
      renameTag,
      t,
    ],
  );

  const deleteTag = useCallback(
    async (event: MouseEvent<HTMLDivElement>, tag: string) => {
      stopPropagation(event);

      if (isPending) return;

      try {
        // As with the rename: a refusal ends it quietly.
        if (!(await confirmDeleteTag(tag))) return;

        await removeTag(tag);

        toastr.success(
          <Trans
            t={t}
            i18nKey="RemoveTag"
            ns="Common"
            components={{
              1: <strong key="removed-tag" />,
            }}
            values={{
              tag,
            }}
          />,
        );

        // From `prev`, not from the list this callback closed over: two awaits
        // stand above this line, and the second of them is a modal the user
        // answers in their own time.
        setTags((prev) => prev.filter((item) => item.label !== tag));
      } catch (error) {
        toastr.error(error as Error);
        console.error("Failed to remove room tag:", error);
      }
    },
    [isPending, setTags, confirmDeleteTag, removeTag, t],
  );

  const editTagHandleKey = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "Enter":
          handleSubmit(confirmEdit)(event);
          break;
        case "Escape":
          cancelEdit();
          break;
        default:
          break;
      }
    },
    [handleSubmit, confirmEdit, cancelEdit],
  );

  return {
    control,
    handleSubmit,
    editingLabel,
    pendingLabel,
    toggleChecked,
    handleEdit,
    cancelEdit,
    confirmEdit,
    deleteTag,
    editTagHandleKey,
  };
};

