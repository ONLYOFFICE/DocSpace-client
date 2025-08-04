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

import React from "react";
import classNames from "classnames";

import { DragAndDrop } from "../../drag-and-drop";

import styles from "../Section.module.scss";
import { SectionBodyProps } from "../Section.types";

import SectionContextMenu from "./SectionContextMenu";

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
    isIndexEditingMode,
    pathname,
    withoutFooter,
  }: SectionBodyProps) => {
    const focusRef = React.useRef<HTMLDivElement | null>(null);

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
      if (!autoFocus) return;

      focusSectionBody();
    }, [autoFocus, pathname, focusSectionBody]);

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
        }
      : {};

    return (
      <DragAndDrop
        className={classNames(
          {
            [styles.dropzone]: true,
            [styles.withScroll]: withScroll,
            [styles.isDesktop]: isDesktop,
            [styles.isRowView]: viewAs === "row",
            [styles.isTile]: viewAs === "tile",
            [styles.isSettingsView]: viewAs === "settings",
            [styles.isProfileView]: viewAs === "profile",
            [styles.isFormGallery]: isFormGallery,
            [styles.isStudio]: settingsStudio,
            [styles.common]: true,
          },
          "section-body",
        )}
        onDrop={onDrop}
        isDropZone={false}
      >
        {withScroll ? (
          <div className="section-wrapper">
            <div className="section-wrapper-content" {...focusProps}>
              {children}
              {withoutFooter ? null : (
                <div className={classNames(styles.spacer)} />
              )}
            </div>
          </div>
        ) : (
          <div className="section-wrapper">
            {children}
            {withoutFooter ? null : (
              <div className={classNames(styles.spacer)} />
            )}
          </div>
        )}

        {!isIndexEditingMode && getContextModel ? (
          <SectionContextMenu getContextModel={getContextModel} />
        ) : null}
      </DragAndDrop>
    );
    //   <div
    //     className={classNames(
    //       styles.sectionBody,
    //       {
    //         [styles.withScroll]: withScroll,
    //         [styles.isDesktop]: isDesktop,
    //         [styles.isRowView]: viewAs === "row",
    //         [styles.isTile]: viewAs === "tile",
    //         [styles.isSettingsView]: viewAs === "settings",
    //         [styles.isProfileView]: viewAs === "profile",
    //         [styles.isFormGallery]: isFormGallery,
    //         [styles.isStudio]: settingsStudio,
    //         [styles.common]: true,
    //       },
    //       "section-body",
    //     )}
    //   >
    //     {withScroll ? (
    //       <div className="section-wrapper">
    //         <div className="section-wrapper-content" {...focusProps}>
    //           {children}
    //           <div className={classNames(styles.spacer, "settings-mobile")} />
    //         </div>
    //       </div>
    //     ) : (
    //       <div className="section-wrapper">{children}</div>
    //     )}
    //     <SectionContextMenu getContextModel={getContextModel} />
    //   </div>
    // );
  },
);

SectionBody.displayName = "SectionBody";

export default SectionBody;
