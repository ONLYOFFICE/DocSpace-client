import styled from "styled-components";

import CategoryFilter from "./CategoryFilter";
import LanguageFilter from "./LanguageFilter";
import SearchFilter from "./SearchFilter";
import SortFilter from "./SortFilter";
import { mobile, tablet } from "@docspace/components/utils/device";
import { Base } from "@docspace/components/themes";

export const StyledFilter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 32px;
  padding: 0 0 8px 0;

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

  @media ${mobile} {
    height: 72px;

    flex-direction: ${({ theme }) =>
      theme.interfaceDirection === "ltl" ? `column-reverse` : `column`};

    .form-only-filters {
      width: 100%;
    }
  }
`;

StyledFilter.defaultProps = { theme: Base };

const SectionFilterContent = ({}) => {
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

export default SectionFilterContent;
