// (c) Copyright Ascensio System SIA 2010-2024
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

// import { inject, observer } from "mobx-react";

import { Scrollbar } from "@docspace/shared/components/scrollbar";

import { DeviceType } from "@docspace/shared/enums";

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
    currentDeviceType,
  }: SectionBodyProps) => {
    const focusRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (!autoFocus) return;

      if (focusRef.current) focusRef.current.focus();
    }, [autoFocus]);

    const focusProps = autoFocus
      ? {
          ref: focusRef,
          tabIndex: -1,
        }
      : {};

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
          currentDeviceType !== DeviceType.mobile ? (
            <Scrollbar
              id="sectionScroll"
              scrollclass="section-scroll"
              fixedSize
            >
              <div className="section-wrapper">
                <div className="section-wrapper-content" {...focusProps}>
                  {children}
                  <StyledSpacer />
                </div>
              </div>
            </Scrollbar>
          ) : (
            <div className="section-wrapper">
              <div className="section-wrapper-content" {...focusProps}>
                {children}
                <StyledSpacer />
              </div>
            </div>
          )
        ) : (
          <div className="section-wrapper">
            {children}
            <StyledSpacer />
          </div>
        )}
      </StyledDropZoneBody>
    ) : (
      <StyledSectionBody
        viewAs={viewAs}
        withScroll={withScroll}
        isDesktop={isDesktop}
        settingsStudio={settingsStudio}
        isFormGallery={isFormGallery}
      >
        {withScroll ? (
          currentDeviceType !== DeviceType.mobile ? (
            <Scrollbar
              id="sectionScroll"
              scrollclass="section-scroll"
              fixedSize
            >
              <div className="section-wrapper">
                <div className="section-wrapper-content" {...focusProps}>
                  {children}
                  <StyledSpacer className="settings-mobile" />
                </div>
              </div>
            </Scrollbar>
          ) : (
            <div className="section-wrapper">
              <div className="section-wrapper-content" {...focusProps}>
                {children}
                <StyledSpacer className="settings-mobile" />
              </div>
            </div>
          )
        ) : (
          <div className="section-wrapper">{children}</div>
        )}
      </StyledSectionBody>
    );
  },
);

SectionBody.displayName = "SectionBody";

export default SectionBody;
