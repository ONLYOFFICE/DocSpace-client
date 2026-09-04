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
import {
  useRemoveTagMutation,
  useUpdateTag,
  useUpdateTagNameMutation,
} from "./hooks/useTagsQuery";
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
  roomId,
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
  const { tags, setTags } = useTagManagement();

  const updateTag = useUpdateTag(roomId);
  const updateTagName = useUpdateTagNameMutation();
  const removeTag = useRemoveTagMutation();

  // The row whose request is in flight, read from the mutation itself rather
  // than kept alongside it: react-query already knows both which tag was sent
  // and whether the answer is still coming.
  const pendingLabel = useMemo(() => {
    if (updateTag.isPending) {
      return updateTag.variables.label;
    }

    if (updateTagName.isPending) {
      return updateTagName.variables.oldLabel;
    }

    if (removeTag.isPending) {
      return removeTag.variables;
    }
  }, [updateTagName.isPending, removeTag.isPending, updateTag.isPending]);

  // Nothing new is started while a request is out. The list holds one mutation
  // of each kind, so a second call would detach the first and lose both its
  // callbacks and the loader on its row - and the rules say so here, not only
  // in the markup that greys the buttons out.
  const isPending = pendingLabel !== undefined;

  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const toggleChecked = useCallback(
    (label: string) => {
      if (isPending) return;

      const originalTags = [...tags];
      const updatedTags = [...tags];
      const tagIndex = updatedTags.findIndex((tag) => tag.label === label);

      if (tagIndex === -1) return;

      updatedTags[tagIndex] = {
        ...updatedTags[tagIndex],
        checked: !updatedTags[tagIndex].checked,
      };

      updateTag.mutate(updatedTags[tagIndex], {
        onSuccess: () => {
          setTags(updatedTags);
          onTagsChanged?.();
        },
        onError: (error) => {
          toastr.error(error);
          console.error("Failed to update room tags:", error);
          setTags(originalTags);
        },
      });
    },
    [isPending, tags, setTags, updateTag, onTagsChanged],
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

      try {
        cancelEdit();

        // Refusing is an answer, not a failure, so nothing is sent and there
        // is nothing to report.
        if (!(await confirmEditTag())) return;

        await updateTagName.mutateAsync({ oldLabel, newLabel });

        setTags((prev) =>
          prev.map((tag) =>
            tag.label === oldLabel ? { ...tag, label: newLabel } : tag,
          ),
        );
      } catch (error) {
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
      updateTagName,
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

        await removeTag.mutateAsync(tag);

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

        const updatedTags = tags.filter((item) => item.label !== tag);
        setTags(updatedTags);
      } catch (error) {
        toastr.error(error as Error);
        console.error("Failed to remove room tag:", error);
      }
    },
    [isPending, tags, setTags, confirmDeleteTag, removeTag, t],
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

