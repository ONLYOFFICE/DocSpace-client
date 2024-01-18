import styled from "styled-components";

import CategoryFilter from "./CategoryFilter";
import LanguageFilter from "./LanguageFilter";
import SearchFilter from "./SearchFilter";
import SortFilter from "./SortFilter";
import { mobile, tablet } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

export const StyledFilter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 0 8px 0;

  .form-only-filters {
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;

    &:empty {
      display: none;
    }
  }

  .general-filters {
    height: 32px;
    width: 100%;
    max-width: 693px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    gap: 8px;
  }

  .form-only-filters:empty + .general-filters {
    justify-content: space-between;
    max-width: 100%;
  }

  @media ${tablet} {
    padding-bottom: 16px;
  }

  @media ${mobile} {
    flex-direction: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `column` : `column-reverse`};

    .form-only-filters {
      width: 100%;
    }
    .general-filters {
      max-width: 100%;
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
