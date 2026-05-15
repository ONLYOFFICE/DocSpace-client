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

import { useForm, Controller } from "react-hook-form";
import React, { useCallback, useMemo, useState } from "react";

import CheckIconURL from "PUBLIC_DIR/images/check.edit.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { Tag } from "@docspace/ui-kit/components/tag";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";

import { useIsMobile } from "@docspace/ui-kit/hooks/use-is-mobile";

import { useTagManagement } from "./TagManagement.provider";
import { useUpdateTag } from "./hooks/useTagsQuery";
import styles from "./TagManagement.module.scss";
import {
  ROW_HEIGHT,
  ICON_SIZE,
  MAX_BODY_HEIGHT,
  MARGIN_BOTTOM,
  EDIT_CANCELLED,
  DELETE_CANCELLED,
  EDIT_TAG_FORM_NAME,
} from "./TagManagement.constants";
import type {
  FormValues,
  TagManagementContentProps,
} from "./TagManagement.types";

export const TagManagementContent: React.FC<TagManagementContentProps> = ({
  onSelectTag,
  roomId,
  onDeleteTag,
  onEditTag,
}) => {
  const { control, handleSubmit, setValue, resetField } = useForm({
    defaultValues: {
      [EDIT_TAG_FORM_NAME]: "",
    },
    shouldUnregister: true,
  });

  const isMobile = useIsMobile();
  const {
    filteredTags,
    tags,
    setTags,
    access: { canEdit, canRemove, canBindTag },
  } = useTagManagement();

  const updateTag = useUpdateTag(roomId);

  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const toggleChecked = useCallback(
    (label: string) => {
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
        },
        onError: (error) => {
          toastr.error(error);
          console.error("Failed to update room tags:", error);
          setTags(originalTags);
        },
      });
    },
    [tags, updateTag],
  );

  const handleEdit = useCallback(
    (label: string) => {
      setEditingLabel(label);

      setValue(EDIT_TAG_FORM_NAME, label);
    },
    [tags, setValue],
  );

  const cancelEdit = useCallback(() => {
    setEditingLabel(null);
    resetField(EDIT_TAG_FORM_NAME);
  }, [resetField]);

  const confirmEdit = useCallback(
    async (submitValue: FormValues) => {
      if (editingLabel === null) return;

      const newLabel = submitValue[EDIT_TAG_FORM_NAME].trim();
      const oldLabel = editingLabel;

      if (newLabel === oldLabel) {
        return cancelEdit();
      }

      if (newLabel.length === 0) {
        console.error("Tag name cannot be empty");
        return;
      }

      try {
        await onEditTag?.(oldLabel, newLabel);
        setTags((prev) =>
          prev.map((tag) =>
            tag.label === oldLabel ? { ...tag, label: newLabel } : tag,
          ),
        );
        cancelEdit();
      } catch (error) {
        if (error === EDIT_CANCELLED) return;

        toastr.error(error as Error);
        console.error("Failed to update tag name:", error);
      }
    },
    [editingLabel, tags, cancelEdit, onEditTag],
  );

  const deleteTag = useCallback(
    async (tag: string) => {
      try {
        await onDeleteTag?.(tag);

        const updatedTags = tags.filter((t) => t.label !== tag);
        setTags(updatedTags);
      } catch (error) {
        if (error === DELETE_CANCELLED) return;

        toastr.error(error as Error);
        console.error("Failed to remove room tag:", error);
      }
    },
    [tags, onDeleteTag],
  );

  const editTagHandleKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    [confirmEdit, cancelEdit],
  );

  const style = useMemo(() => {
    return {
      height: isMobile
        ? "100%"
        : Math.min(
            MAX_BODY_HEIGHT,
            filteredTags.length * ROW_HEIGHT + MARGIN_BOTTOM,
          ),
    };
  }, [isMobile, filteredTags.length]);

  return (
    <div className={styles.wrapperList} style={style}>
      <Scrollbar fixedSize className={styles.scrollbar}>
        {filteredTags.map((tag) => {
          return (
            <div key={tag.label} className={styles.row}>
              <Checkbox
                isChecked={tag.checked}
                isDisabled={!canBindTag}
                className={styles.checkbox}
                onChange={() => toggleChecked(tag.label)}
                dataTestId={`tag_checkbox_${tag.label}`}
              />
              {editingLabel === tag.label ? (
                <>
                  <Controller
                    name={EDIT_TAG_FORM_NAME}
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { value, onChange, ref, disabled },
                      fieldState,
                    }) => (
                      <TextInput
                        scale
                        autoFocus
                        value={value}
                        forwardedRef={ref}
                        onChange={onChange}
                        size={InputSize.base}
                        type={InputType.text}
                        isDisabled={disabled}
                        onKeyDown={editTagHandleKey}
                        className={styles.editInput}
                        hasError={!!fieldState.error}
                        testId="edit_tag_input"
                      />
                    )}
                  />
                  <div className={styles.checkCross}>
                    <IconButton
                      size={ICON_SIZE}
                      iconName={CheckIconURL}
                      className={styles.checkIcon}
                      onClick={handleSubmit(confirmEdit)}
                      dataTestId="confirm_edit_button"
                    />
                    <IconButton
                      size={ICON_SIZE}
                      onClick={cancelEdit}
                      className={styles.crossIcon}
                      iconName={CrossIconReactSvgUrl}
                      dataTestId="cancel_edit_button"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Tag
                    label={tag.label}
                    tag={tag.label}
                    onClick={onSelectTag}
                    className={styles.tag}
                    dataTestId={`tag_item_${tag.label}`}
                  />
                  {canEdit ? (
                    <IconButton
                      size={ICON_SIZE}
                      className={styles.editIcon}
                      iconName={AccessEditReactSvgUrl}
                      onClick={() => handleEdit(tag.label)}
                      dataTestId={`edit_tag_button_${tag.label}`}
                    />
                  ) : null}
                  {canRemove && (
                    <IconButton
                      size={ICON_SIZE}
                      iconName={TrashReactSvgUrl}
                      className={styles.deleteIcon}
                      onClick={() => deleteTag(tag.label)}
                      dataTestId={`delete_tag_button_${tag.label}`}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </Scrollbar>
    </div>
  );
};
