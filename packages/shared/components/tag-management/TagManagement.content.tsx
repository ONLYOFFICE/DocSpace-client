// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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

import { useIsMobile } from "../../hooks/useIsMobile";

import { useTagManagement } from "./TagManagement.provider";
import {
  useCreateTagMutation,
  useUpdateTag,
  useRemoveTagMutation,
} from "./hooks/useTagsQuery";
import styles from "./TagManagement.module.scss";
import {
  ROW_HEIGHT,
  ICON_SIZE,
  MAX_BODY_HEIGHT,
  MARGIN_BOTTOM,
  EDIT_CANCELLED,
  DELETE_CANCELLED,
} from "./TagManagement.constants";
import type { TagManagementContentProps } from "./TagManagement.types";

export const TagManagementContent: React.FC<TagManagementContentProps> = ({
  onSelectTag,
  roomId,
  onDeleteTag,
  onEditTag,
}) => {
  const isMobile = useIsMobile();
  const { filteredTags, tags, setTags, canEdit, canRemove, canBindTag } =
    useTagManagement();
  const removeTag = useRemoveTagMutation();
  const addTagToRoom = useCreateTagMutation(roomId);
  const updateTag = useUpdateTag(roomId);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const toggleChecked = useCallback(
    (label: string) => {
      const updatedTags = [...tags];
      const tagIndex = updatedTags.findIndex((tag) => tag.label === label);

      if (tagIndex === -1) return;
      const checked = !updatedTags[tagIndex].checked;

      updatedTags[tagIndex].checked = checked;

      updateTag.mutate(updatedTags[tagIndex], {
        onSuccess: () => {
          setTags(updatedTags);
        },
        onError: (error) => {
          toastr.error(error);
          console.error("Failed to update room tags:", error);
        },
      });
    },
    [tags, removeTag, addTagToRoom],
  );

  const handleEdit = useCallback(
    (index: number) => {
      setEditingIndex(index);
      setEditValue(tags[index].label);
    },
    [tags],
  );

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditValue("");
  }, []);

  const confirmEdit = useCallback(async () => {
    if (editingIndex === null) return;

    const newLabel = editValue.trim();
    const oldLabel = tags[editingIndex].label;

    if (newLabel === oldLabel) {
      return cancelEdit();
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
  }, [editingIndex, editValue, tags, cancelEdit, onEditTag]);

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
    [tags, removeTag, onDeleteTag],
  );

  const editTagHandleKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "Enter":
          confirmEdit();
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

  const handleEditValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    [setEditValue],
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
        {filteredTags.map((tag, index) => {
          return (
            <div key={tag.label} className={styles.row}>
              <Checkbox
                className={styles.checkbox}
                isChecked={tag.checked}
                onChange={() => toggleChecked(tag.label)}
                isDisabled={!canBindTag}
              />
              {editingIndex === index ? (
                <>
                  <TextInput
                    scale
                    autoFocus
                    value={editValue}
                    size={InputSize.base}
                    type={InputType.text}
                    onKeyDown={editTagHandleKey}
                    className={styles.editInput}
                    onChange={handleEditValueChange}
                  />
                  <div className={styles.checkCross}>
                    <IconButton
                      size={ICON_SIZE}
                      className={styles.checkIcon}
                      iconName={CheckIconURL}
                      onClick={confirmEdit}
                    />
                    <IconButton
                      size={ICON_SIZE}
                      className={styles.crossIcon}
                      iconName={CrossIconReactSvgUrl}
                      onClick={cancelEdit}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Tag
                    className={styles.tag}
                    label={tag.label}
                    tag={tag.label}
                    onClick={onSelectTag}
                  />
                  {canEdit ? (
                    <IconButton
                      size={ICON_SIZE}
                      className={styles.editIcon}
                      iconName={AccessEditReactSvgUrl}
                      onClick={() => handleEdit(index)}
                    />
                  ) : null}
                  {canRemove && (
                    <IconButton
                      size={ICON_SIZE}
                      iconName={TrashReactSvgUrl}
                      className={styles.deleteIcon}
                      onClick={() => deleteTag(tag.label)}
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
