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

import { useTranslation, Trans } from "react-i18next";
import { FC, useCallback, useRef, useState } from "react";
import { isMobile as isMobileDevice } from "react-device-detect";

import { Tags } from "@docspace/ui-kit/components/tags";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useUnmount } from "@docspace/ui-kit/hooks/useUnmount";

import { useIsTable } from "../../hooks/useIsTable";
import { useIsMobile } from "../../hooks/useIsMobile";
import { ShareAccessRights } from "../../enums";

import { TagManagementPopup } from "./TagManagement.popup";

import type { TagManagementProps } from "./TagManagement.types";
import { EditTagModal, DeleteTagModal } from "./modals";
import {
  useUpdateTagNameMutation,
  useRemoveTagMutation,
} from "./hooks/useTagsQuery";
import { useEditConfirmation } from "./hooks/useEditConfirmation";
import { useDeleteConfirmation } from "./hooks/useDeleteConfirmation";
import { EDIT_CANCELLED, DELETE_CANCELLED } from "./TagManagement.constants";

export const TagManagement: FC<TagManagementProps> = ({
  id,
  onSelectTag,
  access,
  isAdmin,
  tags,
  columnCount,
  isActive,
  className,
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
    async (oldLabel: string, newLabel: string) => {
      const confirmed = await requestConfirmation();

      if (!confirmed) {
        return Promise.reject(EDIT_CANCELLED);
      }

      try {
        await updateTagName.mutateAsync({
          oldLabel,
          newLabel,
        });
      } catch (error) {
        console.error("Failed to update tag name:", error);
        throw error;
      }
    },
    [requestConfirmation, updateTagName],
  );

  const confirmDeleteTag = useCallback(
    async (tag: string) => {
      const confirmed = await requestDeleteConfirmation(tag);

      if (!confirmed) {
        return Promise.reject(DELETE_CANCELLED);
      }

      try {
        await removeTag.mutateAsync(tag);
        toastr.success(
          <Trans
            t={t}
            i18nKey="RemoveTag"
            ns="TagManagement"
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
    [requestDeleteConfirmation, removeTag, t],
  );

  const isTableView = useIsTable();
  const isMobileView = useIsMobile();

  const isMobile = isTableView || isMobileView || isMobileDevice;

  const isRoomOwner =
    access === ShareAccessRights.None ||
    access === ShareAccessRights.FullAccess;

  const isRoomManager = access === ShareAccessRights.RoomManager;

  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canCreate = isAdmin || isRoomOwner || isRoomManager;
  const canBindTag = isRoomManager || isAdmin || isRoomOwner;

  const canShowCreateTag =
    (isActive || isMobile || showTagManagement) && canCreate;

  return (
    <>
      <Tags
        tags={tags}
        id={id.toString()}
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
          anchor={anchorRef}
          onClose={onClose}
          onSelectTag={onSelectTag}
          canCreate={canCreate}
          canEdit={canEdit}
          canRemove={canDelete}
          canBindTag={canBindTag}
          canSearch
          onEditTag={confirmEditTag}
          onDeleteTag={confirmDeleteTag}
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
