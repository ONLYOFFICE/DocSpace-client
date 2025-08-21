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

import { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import { useLocation } from "react-router";

import OformsFilter from "@docspace/shared/api/oforms/filter";
import { isMobile } from "@docspace/shared/utils";

import type { FC } from "react";

import { Scrollbar } from "@docspace/shared/components/scrollbar";
import SectionFilterContent from "../Filter";
import Tiles from "../Tiles";

type FormProps = {
  currentCategory?: unknown;
  fetchCurrentCategory: () => void;
  defaultOformLocale?: string | null;
  fetchOformLocales: () => Promise<unknown>;
  oformsFilter: OformsFilter;
  fetchOforms: (filter: OformsFilter) => Promise<unknown>;
  tabDocuments?: boolean;
  tabSpreadsheet?: boolean;
  tabPresentation?: boolean;
};

const Form: FC<FormProps> = ({
  currentCategory,
  fetchCurrentCategory,
  defaultOformLocale,
  fetchOformLocales,
  oformsFilter,
  fetchOforms,
  tabDocuments,
  tabSpreadsheet,
  tabPresentation,
}) => {
  const location = useLocation();
  // const navigate = useNavigate();

  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isShowOneTile, setShowOneTile] = useState(false);

  const [viewMobile, setViewMobile] = useState(false);

  const onCheckView = () => setViewMobile(isMobile());

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, [onCheckView]);

  useEffect(() => {
    console.log("location", location);

    const firstLoadFilter = tabDocuments
      ? OformsFilter.getDefaultDocx()
      : tabSpreadsheet
        ? OformsFilter.getDefaultSpreadsheet()
        : tabPresentation
          ? OformsFilter.getDefaultPresentation()
          : OformsFilter.getDefault();

    console.log("firstLoadFilter", firstLoadFilter);
    if (firstLoadFilter) {
      Promise.all([fetchOforms(firstLoadFilter), fetchOformLocales()]).finally(
        () => {
          setIsInitLoading(false);
        },
      );
    }
  }, [tabDocuments, tabPresentation, tabSpreadsheet]);

  useEffect(() => {
    if (!isInitLoading) {
      if (!oformsFilter.locale) oformsFilter.locale = defaultOformLocale;
      // navigate(`${location.pathname}?${oformsFilter.toUrlParams()}`);
    }
  }, [oformsFilter]);

  useEffect(() => {
    if (!currentCategory) fetchCurrentCategory();
  }, [oformsFilter.categorizeBy, oformsFilter.categoryId]);

  if (isInitLoading) return null;

  return (
    <div style={{ width: "100%" }}>
      <SectionFilterContent
        isShowOneTile={isShowOneTile}
        setShowOneTile={setShowOneTile}
        viewMobile={viewMobile}
      />
      {viewMobile ? (
        <Scrollbar
          style={{ height: "calc(100vh - 227px)", width: "calc(100% + 16px)" }}
          id="scroll-templates-gallery"
        >
          <Tiles
            isShowOneTile={isShowOneTile}
            smallPreview={tabPresentation || tabSpreadsheet}
            viewMobile={viewMobile}
          />
        </Scrollbar>
      ) : (
        <Scrollbar
          style={{ height: "calc(100vh - 286px)", width: "calc(100% + 16px)" }}
          id="scroll-templates-gallery"
        >
          <Tiles smallPreview={tabPresentation || tabSpreadsheet} />
        </Scrollbar>
      )}
    </div>
  );
};

const ConnectedForm = inject<TStore>(({ oformsStore }) => ({
  oformsLoadError: oformsStore.oformsLoadError,

  currentCategory: oformsStore.currentCategory,
  fetchCurrentCategory: oformsStore.fetchCurrentCategory,

  defaultOformLocale: oformsStore.defaultOformLocale,
  fetchOformLocales: oformsStore.fetchOformLocales,

  oformsFilter: oformsStore.oformsFilter,
  setOformsFilter: oformsStore.setOformsFilter,

  fetchOforms: oformsStore.fetchOforms,
  setOformFromFolderId: oformsStore.setOformFromFolderId,
}))(observer(Form)) as unknown as React.ComponentType<{}>;

export default ConnectedForm;
