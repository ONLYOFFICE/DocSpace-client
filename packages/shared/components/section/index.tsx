/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { Provider } from "../../utils";
import { DeviceType } from "../../enums";

import { FloatingButton } from "../floating-button";

import SectionContainer from "./sub-components/SectionContainer";
import SubSectionHeader from "./sub-components/SectionHeader";
import SubSectionFilter from "./sub-components/SectionFilter";
import SubSectionBody from "./sub-components/SectionBody";
import SubSectionBodyContent from "./sub-components/SectionBodyContent";
import SubSectionPaging from "./sub-components/SectionPaging";
import InfoPanel from "./sub-components/InfoPanel";
import SubInfoPanelBody from "./sub-components/InfoPanelBody";
import SubInfoPanelHeader from "./sub-components/InfoPanelHeader";
import SubSectionFooter from "./sub-components/SectionFooter";
import SubSectionWarning from "./sub-components/SectionWarning";

import { SectionProps } from "./Section.types";
import {
  SECTION_BODY_NAME,
  SECTION_FILTER_NAME,
  SECTION_FOOTER_NAME,
  SECTION_HEADER_NAME,
  SECTION_INFO_PANEL_BODY_NAME,
  SECTION_INFO_PANEL_HEADER_NAME,
  SECTION_PAGING_NAME,
  SECTION_WARNING_NAME,
} from "./Section.constants";
import { parseChildren } from "./Section.utils";

export type { SectionProps };

const SectionHeader = ({ children }: { children: React.ReactNode }) => null;
SectionHeader.displayName = SECTION_HEADER_NAME;

const SectionFilter = ({ children }: { children?: React.ReactNode }) => null;
SectionFilter.displayName = SECTION_FILTER_NAME;

const SectionBody = ({ children }: { children: React.ReactNode }) => null;
SectionBody.displayName = SECTION_BODY_NAME;

const SectionFooter = ({ children }: { children: React.ReactNode }) => null;
SectionFooter.displayName = SECTION_FOOTER_NAME;

const SectionPaging = ({ children }: { children: React.ReactNode }) => null;
SectionPaging.displayName = SECTION_PAGING_NAME;

const InfoPanelBody = ({ children }: { children: React.ReactNode }) => null;
InfoPanelBody.displayName = SECTION_INFO_PANEL_BODY_NAME;

const InfoPanelHeader = ({ children }: { children: React.ReactNode }) => null;
InfoPanelHeader.displayName = SECTION_INFO_PANEL_HEADER_NAME;

const SectionWarning = ({ children }: { children: React.ReactNode }) => null;
SectionWarning.displayName = SECTION_WARNING_NAME;

const Section = (props: SectionProps) => {
  const {
    onDrop,
    showPrimaryProgressBar,
    primaryProgressBarIcon,
    primaryProgressBarValue,
    showPrimaryButtonAlert,
    showSecondaryProgressBar,
    secondaryProgressBarValue,
    secondaryProgressBarIcon,
    showSecondaryButtonAlert,
    uploadFiles,
    viewAs,
    withBodyScroll = true,
    children,
    onOpenUploadPanel,
    isInfoPanelAvailable = true,
    settingsStudio = false,
    clearUploadedFilesHistory,
    isInfoPanelScrollLocked,
    isFormGallery,
    currentDeviceType,

    isInfoPanelVisible,
    setIsInfoPanelVisible,
    isMobileHidden,
    canDisplay,
    anotherDialogOpen,
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
    sectionPagingContent,
    sectionWarningContent,
    infoPanelBodyContent,
    infoPanelHeaderContent,
  ]: (React.JSX.Element | null)[] = parseChildren(children);

  console.log(
    sectionHeaderContent,
    sectionFilterContent,
    sectionBodyContent,
    sectionFooterContent,
    sectionPagingContent,
    sectionWarningContent,
    infoPanelBodyContent,
    infoPanelHeaderContent,
  );

  const isSectionHeaderAvailable = !!sectionHeaderContent;
  const isSectionFilterAvailable = !!sectionFilterContent;
  const isSectionPagingAvailable = !!sectionPagingContent;
  const isSectionBodyAvailable =
    !!sectionBodyContent ||
    isSectionFilterAvailable ||
    isSectionPagingAvailable;
  const isSectionAvailable =
    isSectionHeaderAvailable ||
    isSectionFilterAvailable ||
    isSectionBodyAvailable ||
    isSectionPagingAvailable;

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

  const showTwoProgress = showPrimaryProgressBar && showSecondaryProgressBar;

  return (
    isSectionAvailable && (
      <Provider
        value={{
          sectionWidth: sectionSize.width,
          sectionHeight: sectionSize.height,
        }}
      >
        <SectionContainer
          viewAs={viewAs}
          ref={containerRef}
          isSectionHeaderAvailable={isSectionHeaderAvailable}
          showTwoProgress={showTwoProgress}
        >
          {isSectionHeaderAvailable &&
            currentDeviceType === DeviceType.desktop && (
              <SubSectionHeader
                className="section-header_header"
                isFormGallery={isFormGallery}
              >
                {sectionHeaderContent}
              </SubSectionHeader>
            )}
          {isSectionFilterAvailable &&
            currentDeviceType === DeviceType.desktop && (
              <SubSectionFilter
                className="section-header_filter"
                viewAs={viewAs}
              >
                {sectionFilterContent}
              </SubSectionFilter>
            )}

          {isSectionBodyAvailable && (
            <SubSectionBody
              onDrop={onDrop}
              uploadFiles={uploadFiles}
              withScroll={withBodyScroll}
              autoFocus={currentDeviceType === DeviceType.desktop}
              viewAs={viewAs}
              settingsStudio={settingsStudio}
              isFormGallery={isFormGallery}
              currentDeviceType={currentDeviceType}
            >
              {isSectionHeaderAvailable &&
                currentDeviceType !== DeviceType.desktop && (
                  <SubSectionHeader
                    className="section-body_header"
                    isFormGallery={isFormGallery}
                  >
                    {sectionHeaderContent}
                  </SubSectionHeader>
                )}
              {currentDeviceType !== DeviceType.desktop && (
                <SubSectionWarning>{sectionWarningContent}</SubSectionWarning>
              )}
              {isSectionFilterAvailable &&
                currentDeviceType !== DeviceType.desktop && (
                  <SubSectionFilter
                    className="section-body_filter"
                    viewAs={viewAs}
                  >
                    {sectionFilterContent}
                  </SubSectionFilter>
                )}
              <SubSectionBodyContent>
                {sectionBodyContent}
              </SubSectionBodyContent>
              <SubSectionFooter>{sectionFooterContent}</SubSectionFooter>
              {isSectionPagingAvailable && (
                <SubSectionPaging>{sectionPagingContent}</SubSectionPaging>
              )}
            </SubSectionBody>
          )}

          {currentDeviceType === DeviceType.desktop ? (
            showTwoProgress ? (
              <div className="progress-bar_container">
                <FloatingButton
                  className="layout-progress-bar"
                  icon={primaryProgressBarIcon}
                  percent={primaryProgressBarValue}
                  alert={showPrimaryButtonAlert}
                  onClick={onOpenUploadPanel}
                  clearUploadedFilesHistory={clearUploadedFilesHistory}
                />
                <FloatingButton
                  className="layout-progress-second-bar"
                  icon={secondaryProgressBarIcon}
                  percent={secondaryProgressBarValue}
                  alert={showSecondaryButtonAlert}
                  showTwoProgress={showTwoProgress}
                />
              </div>
            ) : showPrimaryProgressBar && !showSecondaryProgressBar ? (
              <div className="progress-bar_container">
                <FloatingButton
                  className="layout-progress-bar"
                  icon={primaryProgressBarIcon}
                  percent={primaryProgressBarValue}
                  alert={showPrimaryButtonAlert}
                  onClick={onOpenUploadPanel}
                  clearUploadedFilesHistory={clearUploadedFilesHistory}
                />
              </div>
            ) : !showPrimaryProgressBar && showSecondaryProgressBar ? (
              <div className="progress-bar_container">
                <FloatingButton
                  className="layout-progress-bar"
                  icon={secondaryProgressBarIcon}
                  percent={secondaryProgressBarValue}
                  alert={showSecondaryButtonAlert}
                />
              </div>
            ) : null
          ) : null}
        </SectionContainer>

        {isInfoPanelAvailable && (
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
        )}
      </Provider>
    )
  );
};

Section.SectionHeader = SectionHeader;
Section.SectionFilter = SectionFilter;
Section.SectionBody = SectionBody;
Section.SectionFooter = SectionFooter;
Section.SectionPaging = SectionPaging;
Section.InfoPanelBody = InfoPanelBody;
Section.InfoPanelHeader = InfoPanelHeader;
Section.SectionWarning = SectionWarning;

export default Section;
