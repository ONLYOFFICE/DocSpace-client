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

import { match } from "ts-pattern";
import { createPortal } from "react-dom";
import React, { useLayoutEffect, useRef } from "react";
import { isTablet } from "react-device-detect";
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

import { useIsMobile } from "@docspace/ui-kit/hooks/use-is-mobile";
import { useKeyboardAwareSheet } from "@docspace/ui-kit/hooks/useKeyboardAwareSheet";
import { isReliableAndroidViewport } from "@docspace/ui-kit/utils/device";

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
  access,
  onDeleteTag,
  onEditTag,
  roomName,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  useClickOutside(isMobile ? modalRef : ref, onClose, EVENT_OPTIONS);
  useEventListener("resize", onClose, undefined, {
    enabled: !isMobile && !isTablet,
  });

  // Lift the sheet above the on-screen keyboard. Only needed on Android
  // browsers with reliable visualViewport (Edge Android excluded). iOS WebKit
  // handles `position: fixed` against the visual viewport itself.
  useKeyboardAwareSheet(sheetRef, isMobile && isReliableAndroidViewport());

  const { data: fetchedTags, status } = useTagsQuery();

  useLayoutEffect(() => {
    if (isMobile) return;

    if (!anchor.current || !ref.current) return onClose();

    const updatePosition = () => {
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
        if (!ref.current) return;

        ref.current.style.left = `${x}px`;
        ref.current.style.top = `${y}px`;
      });
    };

    const cleanup = autoUpdate(anchor.current, ref.current, updatePosition);

    const viewport = window.visualViewport;

    if (isTablet && viewport) {
      viewport.addEventListener("resize", updatePosition);
      viewport.addEventListener("scroll", updatePosition);
    }

    return () => {
      cleanup();
      if (isTablet && viewport) {
        viewport.removeEventListener("resize", updatePosition);
        viewport.removeEventListener("scroll", updatePosition);
      }
    };
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
            access={access}
          >
            <TagManagementFilter roomId={roomId} roomName={roomName} />
            <TagManagementContent
              roomId={roomId}
              onEditTag={onEditTag}
              onDeleteTag={onDeleteTag}
              onSelectTag={onSelectTag}
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
      <ModalDialog
        sheetRef={sheetRef}
        visible
        autoMaxHeight
        displayType={ModalDialogType.modal}
      >
        <ModalDialog.Body className={styles.modalBody} ref={modalRef}>
          {element}
        </ModalDialog.Body>
      </ModalDialog>
    );
  }

  return createPortal(element, document.body);
};
