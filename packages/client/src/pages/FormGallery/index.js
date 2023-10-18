import { useState, useEffect } from "react";
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

const FormGallery = ({
  currentCategory,
  fetchCurrentCategory,
  defaultOformLocale,
  fetchOformLocales,
  oformsFilter,
  setOformsFilter,
  fetchOforms,
  setOformFromFolderId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fromFolderId } = useParams();

  const [isInitLoading, setIsInitLoading] = useState(true);

  useEffect(() => {
    const firstLoadFilter = OformsFilter.getFilter(location);
    fetchOforms(firstLoadFilter);
    fetchOformLocales();
    setIsInitLoading(false);
  }, []);

  useEffect(() => {
    if (
      !isInitLoading &&
      location.search !== `?${oformsFilter.toUrlParams()}`
    ) {
      if (!oformsFilter.locale) oformsFilter.locale = defaultOformLocale;
      navigate(`${location.pathname}?${oformsFilter.toUrlParams()}`);
    }
  }, [oformsFilter]);

  useEffect(() => {
    if (!currentCategory) fetchCurrentCategory();
  }, [oformsFilter.categorizeBy, oformsFilter.categoryId]);

  useEffect(() => {
    if (fromFolderId) setOformFromFolderId(fromFolderId);
    else {
      const myDocumentsFolderId = 2;
      setOformFromFolderId(myDocumentsFolderId);
      navigate(
        `/form-gallery/${myDocumentsFolderId}/filter?${oformsFilter.toUrlParams()}`
      );
    }
  }, [fromFolderId]);

  return (
    <>
      <Section
        // withBodyScroll
        // withBodyAutoFocus={!isMobile}
        withPaging={false}
        isFormGallery
      >
        <Section.SectionHeader isFormGallery>
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

      <Dialogs />
    </>
  );
};

export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,
  fetchCurrentCategory: oformsStore.fetchCurrentCategory,

  defaultOformLocale: oformsStore.defaultOformLocale,
  fetchOformLocales: oformsStore.fetchOformLocales,

  oformsFilter: oformsStore.oformsFilter,
  setOformsFilter: oformsStore.setOformsFilter,

  fetchOforms: oformsStore.fetchOforms,
  setOformFromFolderId: oformsStore.setOformFromFolderId,
}))(observer(FormGallery));
