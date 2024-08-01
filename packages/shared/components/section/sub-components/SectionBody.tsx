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

import React from "react";
import { useLocation } from "react-router-dom";

// import { inject, observer } from "mobx-react";

import { ContextMenu } from "@docspace/shared/components/context-menu";

import {
  StyledDropZoneBody,
  StyledSpacer,
  StyledSectionBody,
} from "../Section.styled";
import { SectionBodyProps } from "../Section.types";

const SectionBody = React.memo(
  ({
    isFormGallery,
    autoFocus = false,
    children,
    onDrop,
    uploadFiles = false,
    viewAs,
    withScroll = true,

    isDesktop,
    settingsStudio = false,
    getContextModel,
  }: SectionBodyProps) => {
    const focusRef = React.useRef<HTMLDivElement | null>(null);
    const cmRef = React.useRef<null | {
      show: (e: React.MouseEvent | MouseEvent) => void;
      hide: (e: React.MouseEvent | MouseEvent) => void;
      toggle: (e: React.MouseEvent | MouseEvent) => boolean;
      getVisible: () => boolean;
    }>(null);
    const location = useLocation();

    const [isOpen, setIsOpen] = React.useState(false);

    const onContextMenu = React.useCallback(
      (e: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
        const bodyElem = document.getElementsByClassName(
          "section-body",
        )[0] as HTMLDivElement;

        const target = e.target as Node;

        if (
          !getContextModel ||
          !getContextModel() ||
          !bodyElem ||
          !bodyElem.contains(target)
        )
          return;

        e.stopPropagation();
        e.preventDefault();

        // if (cmRef.current) cmRef.current.toggle(e);
        if (cmRef.current) {
          if (!isOpen) cmRef?.current?.show(e);
          else cmRef?.current?.hide(e);
          setIsOpen(!isOpen);
        }
      },
      [getContextModel, isOpen],
    );

    const onHide = () => {
      setIsOpen(false);
    };

    const focusSectionBody = React.useCallback(() => {
      if (focusRef.current) focusRef.current.focus({ preventScroll: true });
    }, []);

    const onBodyFocusOut = React.useCallback(
      (e: FocusEvent) => {
        if (e.relatedTarget !== null) return;
        focusSectionBody();
      },
      [focusSectionBody],
    );

    React.useEffect(() => {
      document.addEventListener("contextmenu", onContextMenu);

      return () => {
        document.removeEventListener("contextmenu", onContextMenu);
      };
    }, [onContextMenu]);

    React.useEffect(() => {
      if (!autoFocus) return;

      focusSectionBody();
    }, [autoFocus, location.pathname, focusSectionBody]);

    React.useEffect(() => {
      if (!autoFocus) return;

      const customScrollbar = document.querySelector(
        "#customScrollBar > .scroll-wrapper > .scroller > .scroll-body",
      );
      customScrollbar?.removeAttribute("tabIndex");

      document.body.addEventListener("focusout", onBodyFocusOut);

      return () => {
        customScrollbar?.setAttribute("tabIndex", "-1");
        document.body.removeEventListener("focusout", onBodyFocusOut);
      };
    }, [autoFocus, onBodyFocusOut]);

    const focusProps = autoFocus
      ? {
          ref: focusRef,
          tabIndex: -1,
        }
      : {};

    const contextBlock = (
      <ContextMenu
        ref={cmRef}
        onHide={onHide}
        getContextModel={getContextModel}
        withBackdrop
        model={[]}
      />
    );

    return uploadFiles ? (
      <StyledDropZoneBody
        isDropZone
        onDrop={onDrop}
        withScroll={withScroll}
        viewAs={viewAs}
        isDesktop={isDesktop}
        settingsStudio={settingsStudio}
        className="section-body"
      >
        {withScroll ? (
          <div className="section-wrapper">
            <div className="section-wrapper-content" {...focusProps}>
              {children}
              <StyledSpacer />
            </div>
          </div>
        ) : (
          <div className="section-wrapper">
            {children}
            <StyledSpacer />
          </div>
        )}

        {contextBlock}
      </StyledDropZoneBody>
    ) : (
      <StyledSectionBody
        viewAs={viewAs}
        withScroll={withScroll}
        isDesktop={isDesktop}
        settingsStudio={settingsStudio}
        isFormGallery={isFormGallery}
        className="section-body"
      >
        {withScroll ? (
          <div className="section-wrapper">
            <div className="section-wrapper-content" {...focusProps}>
              {children}
              <StyledSpacer className="settings-mobile" />
            </div>
          </div>
        ) : (
          <div className="section-wrapper">{children}</div>
        )}
        {contextBlock}
      </StyledSectionBody>
    );
  },
);

SectionBody.displayName = "SectionBody";

export default SectionBody;
