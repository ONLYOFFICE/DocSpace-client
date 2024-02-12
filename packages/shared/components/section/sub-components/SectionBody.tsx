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
