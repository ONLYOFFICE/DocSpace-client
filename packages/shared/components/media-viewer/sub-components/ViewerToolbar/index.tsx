// (c) Copyright Ascensio System SIA 2009-2024
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

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import MediaContextMenu from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg";

import { useClickOutside } from "../../../../utils/useClickOutside";

import ImageViewerToolbarProps, {
  ImperativeHandle,
  ToolbarItemType,
} from "./ViewerToolbar.props";

import {
  ImageViewerToolbarWrapper,
  ListTools,
  ToolbarItem,
} from "./ViewerToolbar.styled";
import { globalColors } from "../../../../themes";

const ViewerToolbar = forwardRef<ImperativeHandle, ImageViewerToolbarProps>(
  (
    {
      toolbar,
      className,
      percentValue,
      toolbarEvent,
      generateContextMenu,
      setIsOpenContextMenu,
    },
    ref,
  ) => {
    const contextMenuRef = useRef<HTMLLIElement>(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [percent, setPercent] = useState<number>(() =>
      Math.round(percentValue * 100),
    );

    useClickOutside(contextMenuRef, () => {
      setIsOpen(false);
    });

    useImperativeHandle(ref, () => {
      return {
        setPercentValue(percentArg: number) {
          setPercent(Math.round(percentArg * 100));
        },
      };
    }, []);

    function getContextMenu(item: ToolbarItemType) {
      const contextMenu = generateContextMenu(isOpen);

      if (!contextMenu) return;

      return (
        <ToolbarItem
          ref={contextMenuRef}
          style={{ position: "relative" }}
          key={item.key}
          onClick={() => {
            setIsOpenContextMenu((open) => !open);
            setIsOpen((open) => !open);
          }}
          data-key={item.key}
        >
          <div className="context" style={{ height: "16px" }}>
            <MediaContextMenu />
          </div>
          {contextMenu}
        </ToolbarItem>
      );
    }

    function getPercentCompoent() {
      return (
        <div
          className="iconContainer zoomPercent"
          style={{
            width: "auto",
            color: globalColors.white,
            userSelect: "none",
          }}
        >
          {`${percent}%`}
        </div>
      );
    }

    function renderToolbarItem(item: ToolbarItemType) {
      if (item.disabled) return null;

      if (item.key === "context-menu") {
        return getContextMenu(item);
      }

      let content: JSX.Element | undefined = item?.render;

      if (item.key === "percent") {
        content = getPercentCompoent();
      }

      return (
        <ToolbarItem
          $percent={item.percent ? percent : 100}
          $isSeparator={item.actionType === -1}
          key={item.key}
          onClick={() => {
            toolbarEvent(item);
          }}
          data-key={item.key}
        >
          {content}
        </ToolbarItem>
      );
    }

    return (
      <ImageViewerToolbarWrapper className={className}>
        <ListTools>{toolbar.map((item) => renderToolbarItem(item))}</ListTools>
      </ImageViewerToolbarWrapper>
    );
  },
);

ViewerToolbar.displayName = "ImageViewerToolba";

export { ViewerToolbar };
