import React, { useEffect } from "react";
import Section from "@docspace/common/components/Section";
import { observer, inject } from "mobx-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import SectionHeaderContent from "./Header";
import SectionBodyContent from "./Body";
import { InfoPanelBodyContent } from "../Home/InfoPanel";
import InfoPanelHeaderContent from "../Home/InfoPanel/Header";
import SectionFilterContent from "./Filter";
import OformsFilter from "@docspace/common/api/oforms/filter";
import Dialogs from "./Dialogs";
import MediaViewer from "./MediaViewer";

const FormGallery = ({ getOforms, setOformFiles, setOformFromFolderId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fromFolderId } = useParams();

  useEffect(() => {
    const firstLoadFilter = OformsFilter.getFilter(location);
    getOforms(firstLoadFilter);

    return () => setOformFiles(null);
  }, [getOforms, setOformFiles]);

  useEffect(() => {
    setOformFromFolderId(fromFolderId);
  }, [fromFolderId]);

  return (
    <>
      <Section
        // withBodyScroll
        // withBodyAutoFocus={!isMobile}
        withPaging={false}
      >
        <Section.SectionHeader>
          <SectionHeaderContent />
        </Section.SectionHeader>

        <Section.SectionFilter>
          <SectionFilterContent />
        </Section.SectionFilter>

        <Section.SectionBody>
          <SectionBodyContent />
        </Section.SectionBody>

        <Section.InfoPanelHeader>
          <InfoPanelHeaderContent isGallery />
        </Section.InfoPanelHeader>

        <Section.InfoPanelBody>
          <InfoPanelBodyContent isGallery />
        </Section.InfoPanelBody>
      </Section>

      <MediaViewer />
      <Dialogs />
    </>
  );
};

export default inject(({ oformsStore }) => ({
  getOforms: oformsStore.getOforms,
  setOformFiles: oformsStore.setOformFiles,
  setOformFromFolderId: oformsStore.setOformFromFolderId,
}))(observer(FormGallery));
