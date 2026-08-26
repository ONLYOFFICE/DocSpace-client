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

import { useTranslation, Trans } from "react-i18next";
import { FC, useCallback, useRef, useState } from "react";
import { isMobile as isMobileDevice } from "react-device-detect";

import { Tags } from "@docspace/ui-kit/components/tags";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useUnmount } from "@docspace/ui-kit/hooks/useUnmount";
import { useIsMobile } from "@docspace/ui-kit/hooks/use-is-mobile";
import { useCloseOnAnchorCovered } from "@docspace/ui-kit/hooks/useCloseOnAnchorCovered";

import { useIsTable } from "../../hooks/useIsTable";

import { TagManagementPopup } from "./TagManagement.popup";

import type { TagManagementProps } from "./TagManagement.types";
import { EditTagModal, DeleteTagModal } from "./modals";
import {
  useUpdateTagNameMutation,
  useRemoveTagMutation,
} from "./hooks/useTagsQuery";
import { useEditConfirmation } from "./hooks/useEditConfirmation";
import { useDeleteConfirmation } from "./hooks/useDeleteConfirmation";

export const TagManagement: FC<TagManagementProps> = ({
  id,
  onSelectTag,
  tags,
  columnCount,
  isActive,
  className,
  access,
  roomName,
  onTagsChanged,
}) => {
  const {
    isModalOpen,
    isChecked,
    setIsChecked,
    requestConfirmation,
    handleConfirm,
    handleCancel,
  } = useEditConfirmation();

  const { t } = useTranslation();

  const {
    isModalOpen: isDeleteModalOpen,
    tagToDelete,
    isChecked: isDeleteChecked,
    setIsChecked: setIsDeleteChecked,
    requestConfirmation: requestDeleteConfirmation,
    handleConfirm: handleDeleteConfirm,
    handleCancel: handleDeleteCancel,
  } = useDeleteConfirmation();

  const [showTagManagement, setShowTagManagement] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const editTagModalRef = useRef<HTMLDivElement>(null);
  const deleteTagModalRef = useRef<HTMLDivElement>(null);

  const updateTagName = useUpdateTagNameMutation();
  const removeTag = useRemoveTagMutation();

  const onClose = useCallback((event?: Event) => {
    if (
      event?.target instanceof HTMLElement &&
      (editTagModalRef.current?.contains(event.target) ||
        deleteTagModalRef.current?.contains(event.target))
    )
      return;

    setShowTagManagement(false);
  }, []);

  const handleOptionClick = useCallback(() => {
    setShowTagManagement(true);
  }, []);

  useUnmount(onClose);

  const confirmEditTag = useCallback(
    async function* editTagFlow(oldLabel: string, newLabel: string) {
      const confirmed = await requestConfirmation();

      // Hand the answer to the caller before anything is sent, so it can tell
      // a declined dialog from a failed request.
      yield confirmed;

      if (!confirmed) return;

      try {
        await updateTagName.mutateAsync({
          oldLabel,
          newLabel,
        });
        // Only the global tag list is updated optimistically. Without reloading
        // the room, its own tags keep the old label and unionTagsData shows it
        // again next to the new one the next time the list is opened.
        onTagsChanged?.();
      } catch (error) {
        console.error("Failed to update tag name:", error);
        throw error;
      }
    },
    [requestConfirmation, updateTagName, onTagsChanged],
  );

  const confirmDeleteTag = useCallback(
    async function* deleteTagFlow(tag: string) {
      const confirmed = await requestDeleteConfirmation(tag);

      yield confirmed;

      if (!confirmed) return;

      try {
        await removeTag.mutateAsync(tag);
        // Same reason as in confirmEditTag: the room still carries the tag that
        // no longer exists until it is reloaded.
        onTagsChanged?.();
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
      } catch (error) {
        console.error("Failed to delete tag:", error);
        throw error;
      }
    },
    [requestDeleteConfirmation, removeTag, onTagsChanged, t],
  );

  const isTableView = useIsTable();
  const isMobileView = useIsMobile();

  useCloseOnAnchorCovered({
    anchorRef,
    onClose,
    enabled:
      !isMobileView && !isDeleteModalOpen && !isModalOpen && showTagManagement,
  });

  const isMobile = isTableView || isMobileView || isMobileDevice;

  const canShowCreateTag =
    (isActive || isMobile || showTagManagement) && access.canCreate;

  return (
    <>
      <Tags
        tags={tags}
        id={id?.toString()}
        columnCount={columnCount}
        onSelectTag={onSelectTag}
        optionTagRef={anchorRef}
        onOptionTagClick={handleOptionClick}
        showCreateTag={canShowCreateTag}
        className={className}
      />
      {showTagManagement ? (
        <TagManagementPopup
          tags={tags}
          roomId={id}
          access={access}
          onClose={onClose}
          anchor={anchorRef}
          roomName={roomName}
          onEditTag={confirmEditTag}
          onDeleteTag={confirmDeleteTag}
          onTagsChanged={onTagsChanged}
        />
      ) : null}

      {isModalOpen ? (
        <EditTagModal
          onClose={handleCancel}
          onSubmit={handleConfirm}
          isChecked={isChecked}
          onCheckboxChange={setIsChecked}
          ref={editTagModalRef}
        />
      ) : null}

      {isDeleteModalOpen ? (
        <DeleteTagModal
          onClose={handleDeleteCancel}
          onSubmit={handleDeleteConfirm}
          isChecked={isDeleteChecked}
          onCheckboxChange={setIsDeleteChecked}
          tagName={tagToDelete}
          ref={deleteTagModalRef}
        />
      ) : null}
    </>
  );
};
