import React, { useEffect } from "react";
import Section from "@docspace/common/components/Section";
import { observer, inject } from "mobx-react";
import { useLocation, useNavigate } from "react-router-dom";

import SectionHeaderContent from "./Header";
import SectionBodyContent from "./Body";
import { InfoPanelBodyContent } from "../Home/InfoPanel";
import InfoPanelHeaderContent from "../Home/InfoPanel/Header";
import SectionFilterContent from "./Filter";
import OformsFilter from "@docspace/common/api/oforms/filter";

const FormGallery = ({ getOforms, setOformFiles }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const firstLoadFilter = OformsFilter.getFilter(location);
    getOforms(firstLoadFilter);

    return () => setOformFiles(null);
  }, [getOforms, setOformFiles]);

  const [value, setValue] = React.useState("");
  const onChange = (e) => setValue(e.target.value);

  return (
    <Section
      // withBodyScroll
      // withBodyAutoFocus={!isMobile}
      withPaging={false}
    >
      <input value={value} onChange={onChange} />
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
  );
};

export default inject(({ oformsStore }) => {
  const { getOforms, setOformFiles } = oformsStore;

  return {
    getOforms,
    setOformFiles,
  };
})(observer(FormGallery));
