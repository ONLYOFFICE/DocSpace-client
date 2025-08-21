// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useState, useRef, useEffect, useCallback } from "react";

import VerticalDotsReactSvg from "PUBLIC_DIR/images/icons/17/vertical-dots.react.svg";

import { IconButton } from "../../icon-button";
import { ContextMenu, ContextMenuRefType } from "../../context-menu";

import { TContextButtonProps } from "../Navigation.types";

const ContextButton = ({
  className,
  getData,
  withMenu = true,
  isTrashFolder,
  isMobile,
  id,
  title,
  onCloseDropBox,
  onContextOptionsClick,
  contextButtonAnimation,
  guidAnimationVisible,
  setGuidAnimationVisible,
  ...rest
}: TContextButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animationClasses, setAnimationClasses] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<ContextMenuRefType>(null);
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const resetAnimation = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setAnimationClasses([]);
    setAnimationPlayed(false);
    if (setGuidAnimationVisible) {
      setGuidAnimationVisible(false);
    }
  }, [setGuidAnimationVisible]);

  useEffect(() => {
    if (isOpen && animationPlayed) {
      resetAnimation();
      return;
    }

    if (isOpen) {
      return;
    }

    if (guidAnimationVisible && contextButtonAnimation && !animationPlayed) {
      setAnimationPlayed(true);
      const cleanup = contextButtonAnimation(setAnimationClasses);
      cleanupRef.current = cleanup;
    }
  }, [
    guidAnimationVisible,
    contextButtonAnimation,
    isOpen,
    animationPlayed,
    setGuidAnimationVisible,
    resetAnimation,
  ]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (setGuidAnimationVisible) {
        setGuidAnimationVisible(false);
      }
      setAnimationClasses([]);
    };
  }, [setGuidAnimationVisible]);

  const toggle = (e: React.MouseEvent<HTMLDivElement>, open: boolean) => {
    if (open && animationPlayed) {
      resetAnimation();
    }

    if (open) {
      menuRef.current?.show(e);
    } else {
      menuRef.current?.hide(e);
    }

    setIsOpen(open);
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onContextOptionsClick?.();
    if (withMenu) toggle(e, !isOpen);
  };

  const onHide = () => {
    setIsOpen(false);
    onCloseDropBox?.();
  };

  const model = getData();

  return (
    <div
      ref={ref}
      className={`${className} ${animationClasses.join(" ")}`}
      {...rest}
    >
      <IconButton
        onClick={onClick}
        iconNode={<VerticalDotsReactSvg />}
        id={id}
        size={17}
        isFill
      />
      <ContextMenu
        model={model}
        ref={menuRef}
        onHide={onHide}
        scaled={false}
        withBackdrop
        leftOffset={isTrashFolder ? 188 : isMobile ? 150 : 0}
      />
    </div>
  );
};

export default ContextButton;
