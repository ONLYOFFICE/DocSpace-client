import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, Outlet } from "react-router-dom";
import Section from "@docspace/shared/components/section";
import SectionHeaderContent from "../Home/Section/Header";
import SectionFilterContent from "../Home/Section/Filter";
import FilesPanels from "../../components/FilesPanels";
import SectionWrapper from "SRC_DIR/components/Section";
import SelectionArea from "../Home/SelectionArea/FilesSelectionArea";
import MediaViewer from "../Home/MediaViewer";

import { usePublic } from "../Home/Hooks";

const PublicRoomPage = (props) => {
  const {
    roomId,
    withPaging,
    fetchFiles,
    isEmptyPage,
    setIsLoading,

    showSecondaryProgressBar,
    secondaryProgressBarValue,
    secondaryProgressBarIcon,
    showSecondaryButtonAlert,
  } = props;

  const location = useLocation();

  usePublic({
    roomId,
    location,
    fetchFiles,
    setIsLoading,
  });

  const sectionProps = {
    showSecondaryProgressBar,
    secondaryProgressBarValue,
    secondaryProgressBarIcon,
    showSecondaryButtonAlert,
  };

  return (
    <>
      <SectionWrapper
        withBodyScroll
        // withBodyAutoFocus={!isMobile}
        withPaging={withPaging}
        {...sectionProps}
      >
        <Section.SectionHeader>
          <SectionHeaderContent />
        </Section.SectionHeader>

        {!isEmptyPage && (
          <Section.SectionFilter>
            <SectionFilterContent />
          </Section.SectionFilter>
        )}

        <Section.SectionBody>
          <Outlet />
        </Section.SectionBody>
      </SectionWrapper>

      <FilesPanels />
      <SelectionArea />
      <MediaViewer />
    </>
  );
};

export default inject(
  ({
    authStore,
    settingsStore,
    filesStore,
    publicRoomStore,
    uploadDataStore,
    filesSettingsStore,
    clientLoadingStore,
  }) => {
    const { withPaging } = settingsStore;
    const { isLoaded, isLoading, roomStatus, roomId } = publicRoomStore;

    const { fetchFiles, isEmptyPage } = filesStore;
    const { getFilesSettings } = filesSettingsStore;

    const {
      visible: showSecondaryProgressBar,
      percent: secondaryProgressBarValue,
      icon: secondaryProgressBarIcon,
      alert: showSecondaryButtonAlert,
    } = uploadDataStore.secondaryProgressDataStore;

    const { setIsSectionFilterLoading, setIsSectionBodyLoading } =
      clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
      setIsSectionBodyLoading(param);
    };

    return {
      roomId,
      isLoaded,
      isLoading,
      roomStatus,
      fetchFiles,
      getFilesSettings,

      withPaging,

      showSecondaryProgressBar,
      secondaryProgressBarValue,
      secondaryProgressBarIcon,
      showSecondaryButtonAlert,

      isAuthenticated: authStore.isAuthenticated,
      isEmptyPage,
      setIsLoading,
    };
  }
)(observer(PublicRoomPage));
