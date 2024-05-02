// (c) Copyright Ascensio System SIA 2009-2024
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

import { useState, useEffect } from "react";
import Section from "@docspace/shared/components/section";
import { observer, inject } from "mobx-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import SectionHeaderContent from "./Header";
import SectionBodyContent from "./Body";
import { InfoPanelBodyContent } from "../Home/InfoPanel";
import InfoPanelHeaderContent from "../Home/InfoPanel/Header";
import SectionFilterContent from "./Filter";
import OformsFilter from "@docspace/shared/api/oforms/filter";
import Dialogs from "./Dialogs";
import ErrorView from "./ErrorView";
import SectionWrapper from "SRC_DIR/components/Section";
const FormGallery = ({
  oformsLoadError,
  currentCategory,
  fetchCurrentCategory,
  defaultOformLocale,
  fetchOformLocales,
  oformsFilter,
  fetchOforms,
  setOformFromFolderId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fromFolderId } = useParams();

  const [isInitLoading, setIsInitLoading] = useState(true);

  useEffect(() => {
    const firstLoadFilter = OformsFilter.getFilter(location);

    Promise.all([fetchOforms(firstLoadFilter), fetchOformLocales()]).finally(
      () => {
        setIsInitLoading(false);
      },
    );
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
        `/form-gallery/${myDocumentsFolderId}/filter?${oformsFilter.toUrlParams()}`,
      );
    }
  }, [fromFolderId]);

  if (isInitLoading) return <></>;

  return (
    <>
      <SectionWrapper
        // withBodyScroll
        // withBodyAutoFocus={!isMobile}
        withPaging={false}
        isFormGallery
      >
        <Section.SectionHeader isFormGallery>
          <SectionHeaderContent />
        </Section.SectionHeader>

        {!oformsLoadError && (
          <Section.SectionFilter>
            <SectionFilterContent />
          </Section.SectionFilter>
        )}

        <Section.SectionBody isFormGallery>
          {!oformsLoadError ? <SectionBodyContent /> : <ErrorView />}
        </Section.SectionBody>

        <Section.InfoPanelHeader>
          <InfoPanelHeaderContent isGallery />
        </Section.InfoPanelHeader>

        <Section.InfoPanelBody>
          <InfoPanelBodyContent isGallery />
        </Section.InfoPanelBody>
      </SectionWrapper>

      <Dialogs />
    </>
  );
};

export default inject(({ oformsStore }) => ({
  oformsLoadError: oformsStore.oformsLoadError,

  currentCategory: oformsStore.currentCategory,
  fetchCurrentCategory: oformsStore.fetchCurrentCategory,

  defaultOformLocale: oformsStore.defaultOformLocale,
  fetchOformLocales: oformsStore.fetchOformLocales,

  oformsFilter: oformsStore.oformsFilter,
  setOformsFilter: oformsStore.setOformsFilter,

  fetchOforms: oformsStore.fetchOforms,
  setOformFromFolderId: oformsStore.setOformFromFolderId,
}))(observer(FormGallery));
