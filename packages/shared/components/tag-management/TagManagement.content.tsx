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

import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import React, { useCallback, useMemo, useState } from "react";

import CheckIconURL from "PUBLIC_DIR/images/check.edit.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { ButtonKeys } from "@docspace/ui-kit/enums";
import { Tag } from "@docspace/ui-kit/components/tag";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
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
import { stopPropagation } from "./TagManagement.utils";
import styles from "./TagManagement.module.scss";
import {
  ROW_HEIGHT,
  ICON_SIZE,
  LOADER_SIZE,
  MAX_BODY_HEIGHT,
  MARGIN_BOTTOM,
  EDIT_TAG_FORM_NAME,
} from "./TagManagement.constants";
import type {
  FormValues,
  TagManagementContentProps,
  TTag,
} from "./TagManagement.types";

export const TagManagementContent: React.FC<TagManagementContentProps> = ({
  roomId,
  onDeleteTag,
  onEditTag,
  onTagsChanged,
}) => {
  const { control, handleSubmit, setValue, resetField } = useForm({
    defaultValues: {
      [EDIT_TAG_FORM_NAME]: "",
    },
    shouldUnregister: true,
  });

  const { t } = useTranslation("Common");
  const isMobile = useIsMobile();
  const {
    tags,
    filteredTags,
    pendingLabels,
    access: { canEdit, canRemove, canBindTag },
  } = useTagManagement();

  const updateTag = useUpdateTag(roomId);

  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const toggleChecked = useCallback(
    async (tag: TTag) => {
      try {
        setEditingLabel(null);

        await updateTag.mutateAsync({ ...tag, checked: !tag.checked });

        onTagsChanged?.();
      } catch (error) {
        console.error("Failed to update room tags:", error);
        toastr.error(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [updateTag, onTagsChanged],
  );

  const handleEdit = useCallback(
    (label: string) => {
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

      // The whole list, not the filtered one: a tag the search is hiding is
      // still a tag the rename would collide with. Compared case-insensitively,
      // because two tags that differ in case only read as the same name.
      const isTaken = tags.some(
        (tag) =>
          tag.label !== oldLabel &&
          tag.label.toLowerCase() === newLabel.toLowerCase(),
      );

      if (isTaken) {
        // Nothing is sent and the row stays in edit mode, so the name can be
        // corrected instead of retyped.
        toastr.error(t("Common:TagAlreadyExists", { tagName: newLabel }));
        return;
      }

      const flow = onEditTag?.(oldLabel, newLabel);

      try {
        if (flow) {
          // Step one of the flow only settles the confirmation dialog, before
          // anything is sent - so a declined rename is a value, not an error.
          const { value: confirmed } = await flow.next();

          if (!confirmed) return;
        }

        cancelEdit();
        await flow?.next();
      } catch (error) {
        console.error("Failed to update tag name:", error);
        toastr.error(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [editingLabel, cancelEdit, onEditTag, tags, t],
  );

  const deleteTag = useCallback(
    async (tag: string) => {
      const flow = onDeleteTag?.(tag);

      try {
        if (flow) {
          const { value: confirmed } = await flow.next();

          if (!confirmed) return;
        }

        await flow?.next();
      } catch (error) {
        console.error("Failed to remove room tag:", error);
        toastr.error(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [onDeleteTag],
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
          const isEditing = editingLabel === tag.label;
          // A tag being renamed, deleted or bound cannot take another operation
          // until the running one is done.
          const isPending = pendingLabels.has(tag.label);
          const isRowClickable = canBindTag && !isEditing && !isPending;

          return (
            <div
              key={tag.label}
              className={classNames(styles.row, {
                [styles.rowClickable]: isRowClickable,
                [styles.rowPending]: isPending,
              })}
              onClick={isRowClickable ? () => toggleChecked(tag) : undefined}
              onKeyDown={
                isRowClickable
                  ? (event) => {
                      if (event.key !== ButtonKeys.enter) return;

                      event.preventDefault();
                      toggleChecked(tag);
                    }
                  : undefined
              }
              role={isRowClickable ? "button" : undefined}
              tabIndex={isRowClickable ? 0 : undefined}
              data-testid={`tag_row_${tag.label}`}
            >
              {/* The checkbox toggles through its own onChange, so its click
                  must not reach the row handler and toggle a second time. */}
              <span
                onClick={stopPropagation}
                className={styles.checkboxWrapper}
              >
                {isPending ? (
                  <span
                    className={styles.checkboxLoader}
                    style={{ width: LOADER_SIZE, height: LOADER_SIZE }}
                    data-testid={`tag_loader_${tag.label}`}
                  >
                    <Loader
                      primary
                      size={`${LOADER_SIZE}px`}
                      type={LoaderTypes.oval}
                    />
                  </span>
                ) : (
                  <Checkbox
                    isChecked={tag.checked}
                    // Disabled while the row is being renamed: binding clears
                    // the editor, and the name typed into it would be thrown
                    // away without a word.
                    isDisabled={!canBindTag || isEditing}
                    className={styles.checkbox}
                    onChange={() => toggleChecked(tag)}
                    dataTestId={`tag_checkbox_${tag.label}`}
                  />
                )}
              </span>
              {isEditing ? (
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
                    className={styles.tag}
                    dataTestId={`tag_item_${tag.label}`}
                  />
                  {canEdit ? (
                    <IconButton
                      size={ICON_SIZE}
                      className={styles.editIcon}
                      iconName={AccessEditReactSvgUrl}
                      onClick={(event) => {
                        stopPropagation(event);
                        if (isPending) return;
                        handleEdit(tag.label);
                      }}
                      dataTestId={`edit_tag_button_${tag.label}`}
                    />
                  ) : null}
                  {canRemove && (
                    <IconButton
                      size={ICON_SIZE}
                      iconName={TrashReactSvgUrl}
                      className={styles.deleteIcon}
                      onClick={(event) => {
                        stopPropagation(event);
                        if (isPending) return;
                        deleteTag(tag.label);
                      }}
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
