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

"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo } from "react";

import { Provider } from "../../utils";
import { DeviceType } from "../../enums";

import { FloatingButton } from "../floating-button";

import SectionContainer from "./sub-components/SectionContainer";
import SubSectionHeader from "./sub-components/SectionHeader";
import SubSectionFilter from "./sub-components/SectionFilter";
import SubSectionBody from "./sub-components/SectionBody";
import SubSectionBodyContent from "./sub-components/SectionBodyContent";
import InfoPanel from "./sub-components/InfoPanel";
import SubInfoPanelBody from "./sub-components/InfoPanelBody";
import SubInfoPanelHeader from "./sub-components/InfoPanelHeader";
import SubSectionFooter from "./sub-components/SectionFooter";
import SubSectionWarning from "./sub-components/SectionWarning";
import SubSectionSubmenu from "./sub-components/SectionSubmenu";

import { SectionProps } from "./Section.types";
import {
  SECTION_BODY_NAME,
  SECTION_FILTER_NAME,
  SECTION_FOOTER_NAME,
  SECTION_HEADER_NAME,
  SECTION_INFO_PANEL_BODY_NAME,
  SECTION_INFO_PANEL_HEADER_NAME,
  SECTION_WARNING_NAME,
  SECTION_SUBMENU_NAME,
} from "./Section.constants";
import { parseChildren } from "./Section.utils";
import OperationsProgressButton from "../operations-progress-button";

export type { SectionProps };

const SectionHeader = ({ children }: { children: React.ReactNode }) => null;
SectionHeader.displayName = SECTION_HEADER_NAME;

const SectionFilter = ({ children }: { children?: React.ReactNode }) => null;
SectionFilter.displayName = SECTION_FILTER_NAME;

const SectionBody = ({ children }: { children: React.ReactNode }) => null;
SectionBody.displayName = SECTION_BODY_NAME;

const SectionFooter = ({ children }: { children: React.ReactNode }) => null;
SectionFooter.displayName = SECTION_FOOTER_NAME;

const InfoPanelBody = ({ children }: { children: React.ReactNode }) => null;
InfoPanelBody.displayName = SECTION_INFO_PANEL_BODY_NAME;

const InfoPanelHeader = ({ children }: { children: React.ReactNode }) => null;
InfoPanelHeader.displayName = SECTION_INFO_PANEL_HEADER_NAME;

const SectionWarning = ({ children }: { children: React.ReactNode }) => null;
SectionWarning.displayName = SECTION_WARNING_NAME;

const SectionSubmenu = ({ children }: { children: React.ReactNode }) => null;
SectionSubmenu.displayName = SECTION_SUBMENU_NAME;

const Section = (props: SectionProps) => {
  const {
    onDrop,
    uploadFiles,
    viewAs,
    withBodyScroll = true,
    children,
    onOpenUploadPanel,
    isInfoPanelAvailable = true,
    settingsStudio = false,
    isInfoPanelScrollLocked,
    isFormGallery,
    currentDeviceType,

    isInfoPanelVisible,
    setIsInfoPanelVisible,
    isMobileHidden,
    canDisplay,
    anotherDialogOpen,
    getContextModel,
    isIndexEditingMode,

    pathname,
    secondaryOperationsCompleted,
    secondaryActiveOperations = [],
    clearSecondaryProgressData,
    primaryOperationsArray = [],
    clearPrimaryProgressData,
    primaryOperationsCompleted,
    cancelUpload,
    secondaryOperationsAlert,
    mainButtonVisible,

    primaryOperationsAlert,
    needErrorChecking,
  } = props;

  const [sectionSize, setSectionSize] = React.useState<{
    width?: number;
    height?: number;
  }>({});

  const containerRef = React.useRef<null | HTMLDivElement>(null);
  const timerRef = React.useRef<null | ReturnType<typeof setTimeout>>(null);

  const [
    sectionHeaderContent,
    sectionFilterContent,
    sectionBodyContent,
    sectionFooterContent,
    sectionWarningContent,
    infoPanelBodyContent,
    infoPanelHeaderContent,
    sectionSubmenuContent,
  ]: (React.JSX.Element | null)[] = parseChildren(children);

  const isSectionHeaderAvailable = !!sectionHeaderContent;
  const isSectionFilterAvailable = !!sectionFilterContent;
  const isSectionSubmenuAvailable = !!sectionSubmenuContent;
  const isSectionBodyAvailable =
    !!sectionBodyContent || isSectionFilterAvailable;
  const isSectionAvailable =
    isSectionHeaderAvailable ||
    isSectionFilterAvailable ||
    isSectionBodyAvailable;

  useEffect(() => {
    if (!containerRef.current) return;

    const computedStyles = window.getComputedStyle(containerRef.current, null);
    const width = +computedStyles.getPropertyValue("width").replace("px", "");
    const height = +computedStyles.getPropertyValue("height").replace("px", "");

    setSectionSize(() => ({ width, height }));
  }, [isInfoPanelVisible]);

  const onResize = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (!containerRef.current) return;

      const computedStyles = window.getComputedStyle(
        containerRef.current,
        null,
      );
      const width = +computedStyles.getPropertyValue("width").replace("px", "");
      const height = +computedStyles
        .getPropertyValue("height")
        .replace("px", "");

      setSectionSize(() => ({ width, height }));
    }, 100);
  }, []);

  React.useEffect(() => {
    const elem = containerRef.current;

    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(onResize);

    if (elem) ro.observe(elem);
    return () => {
      if (elem) ro.unobserve(elem);
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const providerValue = useMemo(
    () => ({
      sectionWidth: sectionSize.width,
      sectionHeight: sectionSize.height,
    }),
    [sectionSize.width, sectionSize.height],
  );

  const isShowOperationButton =
    secondaryActiveOperations?.length || primaryOperationsArray?.length;

  const isCompletedOperations = () => {
    if (
      secondaryActiveOperations?.length > 0 &&
      primaryOperationsArray?.length > 0 &&
      secondaryActiveOperations.length + primaryOperationsArray.length > 1
    )
      return secondaryOperationsCompleted && primaryOperationsCompleted;

    if (secondaryActiveOperations?.length > 0)
      return secondaryOperationsCompleted;

    return primaryOperationsCompleted;
  };

  const showCancelButton =
    primaryOperationsArray.length > 0 &&
    !primaryOperationsCompleted &&
    primaryOperationsArray.some((op) => op.operation === "upload");

  return (
    isSectionAvailable && (
      <Provider value={providerValue}>
        <SectionContainer
          viewAs={viewAs}
          ref={containerRef}
          isSectionHeaderAvailable={isSectionHeaderAvailable}
          isInfoPanelVisible={isInfoPanelVisible}
          withBodyScroll={withBodyScroll}
          currentDeviceType={currentDeviceType}
        >
          {currentDeviceType !== DeviceType.mobile ? (
            <div className="section-sticky-container">
              {isSectionHeaderAvailable ? (
                <SubSectionHeader
                  className="section-header_header"
                  isFormGallery={isFormGallery}
                >
                  {sectionHeaderContent}
                </SubSectionHeader>
              ) : null}

              {isSectionSubmenuAvailable ? (
                <SubSectionSubmenu>{sectionSubmenuContent}</SubSectionSubmenu>
              ) : null}

              {isSectionFilterAvailable &&
              currentDeviceType === DeviceType.desktop ? (
                <SubSectionFilter className="section-header_filter">
                  {sectionFilterContent}
                </SubSectionFilter>
              ) : null}
            </div>
          ) : null}

          {isSectionBodyAvailable ? (
            <SubSectionBody
              onDrop={onDrop}
              uploadFiles={uploadFiles}
              withScroll={withBodyScroll}
              autoFocus={currentDeviceType === DeviceType.desktop}
              viewAs={viewAs}
              settingsStudio={settingsStudio}
              isFormGallery={isFormGallery}
              currentDeviceType={currentDeviceType}
              getContextModel={getContextModel}
              isIndexEditingMode={isIndexEditingMode}
              pathname={pathname}
            >
              {isSectionHeaderAvailable &&
              currentDeviceType === DeviceType.mobile ? (
                <SubSectionHeader
                  className="section-body_header"
                  isFormGallery={isFormGallery}
                >
                  {sectionHeaderContent}
                </SubSectionHeader>
              ) : null}
              {currentDeviceType !== DeviceType.desktop ? (
                <SubSectionWarning>{sectionWarningContent}</SubSectionWarning>
              ) : null}
              {isSectionSubmenuAvailable &&
              currentDeviceType === DeviceType.mobile ? (
                <SubSectionSubmenu>{sectionSubmenuContent}</SubSectionSubmenu>
              ) : null}
              {isSectionFilterAvailable &&
              currentDeviceType !== DeviceType.desktop ? (
                <SubSectionFilter className="section-body_filter">
                  {sectionFilterContent}
                </SubSectionFilter>
              ) : null}
              <SubSectionBodyContent>
                {sectionBodyContent}
              </SubSectionBodyContent>
              <SubSectionFooter>{sectionFooterContent}</SubSectionFooter>
            </SubSectionBody>
          ) : null}

          {isShowOperationButton ? (
            <OperationsProgressButton
              clearOperationsData={clearSecondaryProgressData}
              operations={secondaryActiveOperations}
              operationsCompleted={isCompletedOperations()}
              clearPanelOperationsData={clearPrimaryProgressData}
              operationsAlert={
                primaryOperationsAlert || secondaryOperationsAlert
              }
              needErrorChecking={needErrorChecking}
              panelOperations={primaryOperationsArray}
              cancelUpload={cancelUpload}
              onOpenPanel={onOpenUploadPanel}
              mainButtonVisible={mainButtonVisible}
              showCancelButton={showCancelButton}
              isInfoPanelVisible={isInfoPanelVisible}
            />
          ) : null}
        </SectionContainer>

        {isInfoPanelAvailable ? (
          <InfoPanel
            isVisible={isInfoPanelVisible}
            setIsVisible={setIsInfoPanelVisible}
            isMobileHidden={isMobileHidden}
            canDisplay={canDisplay}
            anotherDialogOpen={anotherDialogOpen}
            viewAs={viewAs}
            currentDeviceType={currentDeviceType}
          >
            <SubInfoPanelHeader>{infoPanelHeaderContent}</SubInfoPanelHeader>
            <SubInfoPanelBody isInfoPanelScrollLocked={isInfoPanelScrollLocked}>
              {infoPanelBodyContent}
            </SubInfoPanelBody>
          </InfoPanel>
        ) : null}
      </Provider>
    )
  );
};

Section.SectionHeader = SectionHeader;
Section.SectionFilter = SectionFilter;
Section.SectionBody = SectionBody;
Section.SectionFooter = SectionFooter;
Section.InfoPanelBody = InfoPanelBody;
Section.InfoPanelHeader = InfoPanelHeader;
Section.SectionWarning = SectionWarning;
Section.SectionSubmenu = SectionSubmenu;

export default Section;
