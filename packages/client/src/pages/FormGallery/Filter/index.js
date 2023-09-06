import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryFilter from "./CategoryFilter";
import LanguageFilter from "./LanguageFilter";
import SearchFilter from "./SearchFilter";
import SortFilter from "./SortFilter";
import { smallTablet } from "@docspace/components/utils/device";
import { getDefaultOformLocale } from "@docspace/common/utils";
import OformsFilter from "@docspace/common/api/oforms/filter";

export const StyledFilter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 32px;
  padding: 8px 0 5px 0;

  .form-only-filters {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .general-filters {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    gap: 8px;
  }

  @media ${smallTablet} {
    height: 72px;
    flex-direction: column-reverse;

    .form-only-filters {
      width: 100%;
    }
  }
`;

const SectionFilterContent = ({ oformsFilter, setOformsFilter }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isInitLoading, setIsInitLoading] = useState(true);

  useEffect(() => {
    const firstLoadFilter = OformsFilter.getFilter(location);

    if (!firstLoadFilter.locale) {
      firstLoadFilter.locale = getDefaultOformLocale();
      setOformsFilter(firstLoadFilter);
      navigate(`${location.pathname}?${oformsFilter.toUrlParams()}`);
    } else setOformsFilter(firstLoadFilter);

    setIsInitLoading(false);
  }, []);

  useEffect(() => {
    if (isInitLoading) return;
    navigate(`${location.pathname}?${oformsFilter.toUrlParams()}`);
  }, [
    oformsFilter.categorizeBy,
    oformsFilter.categoryId,
    oformsFilter.locale,
    oformsFilter.search,
    oformsFilter.sortBy,
    oformsFilter.sortOrder,
  ]);

  return (
    <StyledFilter>
      <div className="form-only-filters">
        <CategoryFilter />
        <LanguageFilter />
      </div>
      <div className="general-filters">
        <SearchFilter />
        <SortFilter />
      </div>
    </StyledFilter>
  );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  setOformsFilter: oformsStore.setOformsFilter,
}))(SectionFilterContent);
