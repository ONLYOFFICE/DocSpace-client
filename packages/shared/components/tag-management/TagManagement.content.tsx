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
import { Controller } from "react-hook-form";
import React, { useMemo } from "react";

import CheckIconURL from "PUBLIC_DIR/images/check.edit.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { Tag } from "@docspace/ui-kit/components/tag";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
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
import { useTagManagementService } from "./TagManagement.service";
import { stopPropagation } from "./TagManagement.utils";
import styles from "./TagManagement.module.scss";
import {
  ROW_HEIGHT,
  ICON_SIZE,
  LOADER_SIZE,
  MAX_BODY_HEIGHT,
  MARGIN_BOTTOM,
  EDIT_TAG_FORM_NAME,
  REGEX_TAG_NAME_PATTERN,
} from "./TagManagement.constants";
import type { TagManagementContentProps } from "./TagManagement.types";

export const TagManagementContent: React.FC<TagManagementContentProps> = ({
  confirmDeleteTag,
  confirmEditTag,
  onTagsChanged,
}) => {
  const isMobile = useIsMobile();
  const {
    filteredTags,
    access: { canEdit, canRemove, canBindTag },
  } = useTagManagement();

  const {
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
  } = useTagManagementService({
    confirmDeleteTag,
    confirmEditTag,
    onTagsChanged,
  });

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
          const isPending = pendingLabel === tag.label;
          const isRowClickable = canBindTag && !isEditing && !isPending;

          return (
            <div
              key={tag.label}
              className={classNames(styles.row, {
                [styles.rowClickable]: isRowClickable,
                [styles.rowPending]: isPending,
              })}
              onClick={
                isRowClickable ? () => toggleChecked(tag.label) : undefined
              }
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
                      type={LoaderTypes.track}
                    />
                  </span>
                ) : (
                  <Checkbox
                    isChecked={tag.checked}
                    isDisabled={!canBindTag || isEditing}
                    className={styles.checkbox}
                    onChange={() => toggleChecked(tag.label)}
                    dataTestId={`tag_checkbox_${tag.label}`}
                  />
                )}
              </span>
              {isEditing ? (
                <>
                  <Controller
                    name={EDIT_TAG_FORM_NAME}
                    control={control}
                    rules={{ required: true, pattern: REGEX_TAG_NAME_PATTERN }}
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
                  {canEdit || canRemove ? (
                    // One flex item for both icons, so the row's own gap
                    // separates them from the tag rather than from each other.
                    // The click never reaches the row: the gap between them is
                    // part of this box, not of the row.
                    <div
                      className={styles.rowActions}
                      onClick={stopPropagation}
                    >
                      {canEdit ? (
                        <IconButton
                          size={ICON_SIZE}
                          className={styles.editIcon}
                          iconName={AccessEditReactSvgUrl}
                          onClick={(event) => {
                            handleEdit(event, tag.label);
                          }}
                          dataTestId={`edit_tag_button_${tag.label}`}
                          isDisabled={isPending}
                        />
                      ) : null}
                      {canRemove ? (
                        <IconButton
                          size={ICON_SIZE}
                          iconName={TrashReactSvgUrl}
                          className={styles.deleteIcon}
                          onClick={(event) => {
                            deleteTag(event, tag.label);
                          }}
                          dataTestId={`delete_tag_button_${tag.label}`}
                          isDisabled={isPending}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </Scrollbar>
    </div>
  );
};
