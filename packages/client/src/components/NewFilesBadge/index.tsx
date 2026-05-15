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

import React from "react";
import { inject, observer } from "mobx-react";

import { Badge } from "@docspace/ui-kit/components/badge";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import type { Nullable } from "@docspace/shared/types";
import { isMobile } from "@docspace/shared/utils";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";

import type DialogsStore from "SRC_DIR/store/DialogsStore";

import type {
  NewFilesBadgeProps,
  TPanelDirection,
  TPanelPosition,
} from "./NewFilesBadge.types";
import { NewFilesPanel } from "./sub-components/NewFilesPanel";

const MARGIN_BADGE = 4;
const MARGIN_WINDOW = 42;
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 500;

const NewFilesBadge = ({
  newFilesCount,
  folderId,

  isRoom,
  mute,

  parentDOMId,
  className,
  onBadgeClick,

  newFilesPanelFolderId,
  setNewFilesPanelFolderId,
}: NewFilesBadgeProps) => {
  const [showPanel, setShowPanel] = React.useState(false);
  const [disableBadgeClick, setDisableBadgeClick] = React.useState(false);
  const [openWithClick, setOpenWithClick] = React.useState(false);
  const [panelDirection, setPanelDirection] =
    React.useState<TPanelDirection>("right");
  const [panelPosition, setPanelPosition] = React.useState<TPanelPosition>({
    left: 0,
    top: 0,

    maxHeight: PANEL_HEIGHT,
  });

  const badgeRef = React.useRef<Nullable<HTMLDivElement>>(null);
  const timerRef = React.useRef<Nullable<NodeJS.Timeout>>(null);
  const disableBadgeTimerRef = React.useRef<Nullable<NodeJS.Timeout>>(null);

  const calculatePosition = React.useCallback(() => {
    if (!badgeRef.current) return;

    let badgeRects = badgeRef.current.getClientRects()[0];

    const winodwHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (parentDOMId) {
      const parentElement = document.getElementById(parentDOMId);

      if (parentElement) {
        badgeRects = parentElement.getClientRects()[0];
      }
    }

    const leftSpace = badgeRects.left;
    const rightSpace = windowWidth - badgeRects.right;
    const topSpace = badgeRects.top;
    const bottomSpace = winodwHeight - badgeRects.top;

    const pos: TPanelPosition = {
      top: 0,
      left: 0,

      maxHeight: PANEL_HEIGHT,
    };

    let direction: TPanelDirection = "right";

    const panelWidth = PANEL_WIDTH + MARGIN_WINDOW + MARGIN_BADGE;

    if (rightSpace >= panelWidth) {
      pos.left = badgeRects.right + MARGIN_BADGE;
    } else if (leftSpace >= panelWidth) {
      pos.left = badgeRects.left - PANEL_WIDTH - MARGIN_BADGE;
      direction = "left";
    } else if (
      topSpace >= PANEL_HEIGHT + MARGIN_WINDOW + MARGIN_BADGE ||
      bottomSpace >= PANEL_HEIGHT + MARGIN_WINDOW + MARGIN_BADGE
    ) {
      pos.left = badgeRects.left + badgeRects.width / 2;
      direction = "center";
    } else {
      pos.left = windowWidth - MARGIN_WINDOW;
      direction = "custom";
    }

    let panelHeight = pos.maxHeight;

    if (winodwHeight < PANEL_HEIGHT + 2 * MARGIN_WINDOW) {
      pos.maxHeight = winodwHeight - 2 * MARGIN_WINDOW;
      panelHeight = pos.maxHeight;
      if (direction === "center") panelHeight += MARGIN_BADGE;
    }

    if (direction === "center") {
      if (topSpace >= panelHeight) {
        pos.top = badgeRects.top - panelHeight - MARGIN_BADGE;
      } else {
        pos.top = badgeRects.bottom + MARGIN_BADGE;
      }
    } else if (bottomSpace >= panelHeight - MARGIN_BADGE) {
      pos.top = badgeRects.top;
    } else {
      pos.top = winodwHeight - MARGIN_WINDOW - panelHeight;
    }

    setPanelPosition(pos);
    setPanelDirection(direction);
  }, [parentDOMId]);

  const onPanelOpen = React.useCallback(() => {
    if (disableBadgeClick) return;
    setShowPanel(true);
    setNewFilesPanelFolderId?.(folderId);
    calculatePosition();
  }, [
    folderId,
    disableBadgeClick,
    setNewFilesPanelFolderId,
    calculatePosition,
  ]);

  const onPanelHide = React.useCallback(() => {
    setShowPanel(false);
    setOpenWithClick(false);
    setDisableBadgeClick(true);
    disableBadgeTimerRef.current = setTimeout(
      () => setDisableBadgeClick(false),
      300,
    );
  }, []);

  const onBadgeClickAction = () => {
    if (showPanel) return;

    setOpenWithClick(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = null;

    onPanelOpen();
    onBadgeClick?.();
  };

  const onPanelClose = React.useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest(".new-files-panel") || isMobile()) return;

      onPanelHide();
    },
    [onPanelHide],
  );

  const onMouseOver = useEventCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      onPanelOpen();

      timerRef.current = null;
    }, 1500);
  });

  const onMouseLeave = useEventCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = null;
  });

  const onMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!badgeRef.current) return;

      let badgeRects = badgeRef.current.getClientRects()[0];

      if (parentDOMId) {
        const parentElement = document.getElementById(parentDOMId);

        if (parentElement) {
          badgeRects = parentElement.getClientRects()[0];
        }
      }

      const { pageX: leftPos, pageY: topPos } = e;

      const { left: panelLeftPos, top: panelTopPos } = panelPosition;
      const panelRightPos = panelPosition.left + PANEL_WIDTH;
      const panelBottomPos = panelPosition.top + panelPosition.maxHeight;
      const {
        left: badgeLeftPos,
        top: badgeTopPos,
        right: badgeRightPos,
        bottom: badgeBottomPos,
      } = badgeRects;

      if (isMobile()) {
        if (topPos < 64) {
          onPanelHide();
        }

        return;
      }

      if (panelDirection === "custom") {
        if (
          leftPos >= panelLeftPos &&
          leftPos <= panelRightPos &&
          topPos <= panelTopPos &&
          topPos >= panelBottomPos
        ) {
          return;
        }

        return onPanelHide();
      }

      if (panelDirection === "center") {
        if (leftPos < panelLeftPos || leftPos > panelRightPos) {
          return onPanelHide();
        }

        if (panelTopPos > badgeTopPos) {
          // down
          if (topPos > panelBottomPos) {
            return onPanelHide();
          }
          if (topPos < panelTopPos) {
            if (topPos < badgeRects.top) {
              return onPanelHide();
            }
            if (
              (leftPos < badgeLeftPos || leftPos > badgeRightPos) &&
              topPos < badgeBottomPos
            ) {
              return onPanelHide();
            }
          }
        } else {
          // top
          if (topPos < panelTopPos) {
            return onPanelHide();
          }
          if (topPos > panelBottomPos) {
            if (topPos > badgeBottomPos) {
              onPanelHide();
            }
            if (
              (leftPos < badgeLeftPos || leftPos > badgeRightPos) &&
              topPos > badgeRects.top
            ) {
              onPanelHide();
            }
          }
        }

        return;
      }

      if (topPos < panelTopPos || topPos > panelBottomPos) {
        return onPanelHide();
      }

      if (panelDirection === "left") {
        if (leftPos < panelLeftPos) {
          return onPanelHide();
        }

        if (leftPos > badgeRightPos) {
          return onPanelHide();
        }

        if (
          (topPos < badgeTopPos || topPos > badgeBottomPos) &&
          leftPos > badgeLeftPos
        ) {
          return onPanelHide();
        }
        return;
      }

      if (leftPos > panelRightPos) {
        return onPanelHide();
      }

      if (leftPos < badgeLeftPos) {
        return onPanelHide();
      }

      if (
        (topPos < badgeTopPos || topPos > badgeBottomPos) &&
        leftPos < badgeRightPos
      ) {
        return onPanelHide();
      }
    },
    [onPanelHide, panelDirection, panelPosition, parentDOMId],
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (disableBadgeTimerRef.current)
        clearTimeout(disableBadgeTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (showPanel && !openWithClick) {
      document.addEventListener("mousemove", onMouseMove);
    }

    if (!showPanel) {
      document.removeEventListener("mousemove", onMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove, openWithClick, showPanel]);

  React.useEffect(() => {
    if (showPanel) {
      document.addEventListener("mousedown", onPanelClose);
      window.addEventListener("resize", onPanelHide);
    }

    if (!showPanel) {
      document.removeEventListener("mousedown", onPanelClose);
      window.removeEventListener("resize", onPanelHide);
    }

    return () => {
      document.removeEventListener("mousedown", onPanelClose);
      window.removeEventListener("resize", onPanelHide);
    };
  }, [showPanel, onPanelClose, onPanelHide]);

  React.useEffect(() => {
    if (!newFilesPanelFolderId || newFilesPanelFolderId === folderId) return;

    onPanelHide();
  }, [folderId, newFilesPanelFolderId, onPanelHide]);

  const label = newFilesCount > 999 ? "999+" : newFilesCount;

  return (
    <>
      <Badge
        ref={badgeRef as React.RefObject<HTMLDivElement>}
        fontSize="11px"
        fontWeight={600}
        className={`new-items${className ? ` ${className}` : ""}`}
        label={label}
        color={globalColors.white}
        onClick={onBadgeClickAction}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        isMutedBadge={mute}
      />
      {showPanel ? (
        <NewFilesPanel
          position={panelPosition}
          folderId={folderId}
          isRoom={isRoom}
          onClose={onPanelHide}
        />
      ) : null}
    </>
  );
};

export default inject(({ dialogsStore }: { dialogsStore: DialogsStore }) => {
  const { newFilesPanelFolderId, setNewFilesPanelFolderId } = dialogsStore;

  return { newFilesPanelFolderId, setNewFilesPanelFolderId };
})(observer(NewFilesBadge));
