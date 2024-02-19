import React from "react";
import FilterReactSvrUrl from "PUBLIC_DIR/images/filter.react.svg?url";

import { IconButton } from "../../icon-button";
import { ColorTheme, ThemeId } from "../../color-theme";

import { FilterButtonProps } from "../Filter.types";
import { StyledButton } from "../Filter.styled";

import FilterBlock from "./FilterBlock";

const FilterButton = ({
  onFilter,
  getFilterData,
  selectedFilterValue,
  filterHeader,
  selectorLabel,
  isRooms,
  isAccounts,
  isPeopleAccounts,
  isGroupsAccounts,
  isInsideGroup,
  id,
  title,
  userId,
}: FilterButtonProps) => {
  const [showFilterBlock, setShowFilterBlock] = React.useState(false);

  const changeShowFilterBlock = React.useCallback(() => {
    setShowFilterBlock((value) => !value);
  }, [setShowFilterBlock]);

  return (
    <>
      <StyledButton
        id={id}
        isOpen={showFilterBlock}
        onClick={changeShowFilterBlock}
        title={title}
      >
        <IconButton iconName={FilterReactSvrUrl} size={16} />
        {selectedFilterValue && selectedFilterValue.length > 0 && (
          <ColorTheme themeId={ThemeId.IndicatorFilterButton} />
        )}
      </StyledButton>

      {showFilterBlock && (
        <FilterBlock
          filterHeader={filterHeader}
          selectedFilterValue={selectedFilterValue}
          hideFilterBlock={changeShowFilterBlock}
          getFilterData={getFilterData}
          onFilter={onFilter}
          selectorLabel={selectorLabel}
          isRooms={isRooms}
          isAccounts={isAccounts}
          isPeopleAccounts={isPeopleAccounts}
          isGroupsAccounts={isGroupsAccounts}
          isInsideGroup={isInsideGroup}
          userId={userId}
        />
      )}
    </>
  );
};

export default React.memo(FilterButton);
