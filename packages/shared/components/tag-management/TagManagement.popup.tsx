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

import { match } from "ts-pattern";
import { createPortal } from "react-dom";
import React, { useLayoutEffect, useRef } from "react";
import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/dom";

import { useClickOutside } from "@docspace/ui-kit/utils/use-click-outside";
import { useEventListener } from "@docspace/ui-kit/hooks/useEventListener";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";

import { useIsMobile } from "../../hooks/useIsMobile";

import { TagManagementProvider } from "./TagManagement.provider";
import { TagManagementFilter } from "./TagManagement.filter";
import { TagManagementContent } from "./TagManagement.content";
import { TagManagementLoader } from "./TagManagement.loader";
import type { TagManagementPopupProps } from "./TagManagement.types";
import { stopPropagation } from "./TagManagement.utils";
import { EVENT_OPTIONS } from "./TagManagement.constants";

import styles from "./TagManagement.module.scss";

import { useTagsQuery } from "./hooks/useTagsQuery";

export const TagManagementPopup: React.FC<TagManagementPopupProps> = ({
  roomId,
  onClose,
  anchor,
  onSelectTag,
  tags: roomTags,

  canCreate = false,
  canRemove = false,
  canSearch = false,
  canEdit = false,
  canBindTag = false,

  onDeleteTag,
  onEditTag,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  useClickOutside(isMobile ? modalRef : ref, onClose, EVENT_OPTIONS);
  useEventListener("resize", onClose);

  const { data: fetchedTags, status } = useTagsQuery();

  useLayoutEffect(() => {
    if (isMobile) return;

    if (!anchor.current || !ref.current) return onClose();

    const cleanup = autoUpdate(anchor.current, ref.current, () => {
      if (!anchor.current || !ref.current || isMobile) return;

      computePosition(anchor.current, ref.current, {
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [
          offset(4),
          flip({
            fallbackAxisSideDirection: "end",
          }),
          shift(),
        ],
      }).then(({ x, y }) => {
        if (ref.current) {
          ref.current.style.left = `${x}px`;
          ref.current.style.top = `${y}px`;
        }
      });
    });

    return cleanup;
  }, [anchor, anchor.current, ref, isMobile, onClose]);

  const element = (
    <div
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
      onMouseDown={stopPropagation}
      className={styles.tagManagement}
      ref={ref}
    >
      {match(status)
        .with("pending", () => <TagManagementLoader />)
        .with("success", () => (
          <TagManagementProvider
            fetchedTags={fetchedTags ?? []}
            roomTags={roomTags}
            canRemove={canRemove}
            canCreate={canCreate}
            canSearch={canSearch}
            canEdit={canEdit}
            canBindTag={canBindTag}
          >
            <TagManagementFilter roomId={roomId} />
            <TagManagementContent
              onSelectTag={onSelectTag}
              roomId={roomId}
              onDeleteTag={onDeleteTag}
              onEditTag={onEditTag}
            />
          </TagManagementProvider>
        ))
        .with("error", () => <></>)
        .otherwise(() => (
          <></>
        ))}
    </div>
  );

  if (isMobile) {
    return (
      <ModalDialog visible autoMaxHeight displayType={ModalDialogType.modal}>
        <ModalDialog.Body className={styles.modalBody} ref={modalRef}>
          {element}
        </ModalDialog.Body>
      </ModalDialog>
    );
  }

  return createPortal(element, document.body);
};
