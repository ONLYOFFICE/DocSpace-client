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
import { CategoryType } from "@docspace/client/src/helpers/constants";

const FormGallery = ({
  oformsFilter,
  getOforms,
  setOformFiles,
  setOformFromFolderId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fromFolderId } = useParams();

  useEffect(() => {
    const firstLoadFilter = OformsFilter.getFilter(location);
    getOforms(firstLoadFilter);
    return () => setOformFiles(null);
  }, []);

  useEffect(() => {
    if (fromFolderId) {
      setOformFromFolderId(fromFolderId);
    } else {
      setOformFromFolderId(CategoryType.SharedRoom);
      navigate(
        `/form-gallery/${
          CategoryType.SharedRoom
        }/filter?${oformsFilter.toUrlParams()}`
      );
    }
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
  oformsFilter: oformsStore.oformsFilter,
  getOforms: oformsStore.getOforms,
  setOformFiles: oformsStore.setOformFiles,
  setOformFromFolderId: oformsStore.setOformFromFolderId,
}))(observer(FormGallery));
