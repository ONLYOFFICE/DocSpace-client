import * as Styled from "./index.styled";

import { useState } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import SortReactSvgUrl from "PUBLIC_DIR/images/sort.react.svg?url";
import IconButton from "@docspace/components/icon-button";
import ComboBox from "@docspace/components/combobox";
import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";
import Backdrop from "@docspace/components/backdrop";
import Text from "@docspace/components/text";

const SortFilter = ({ t, oformsFilter, sortOforms }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleCombobox = () => setIsOpen(!isOpen);

  const sortData = [
    {
      id: "sort-by_name",
      key: "name_form",
      label: t("Common:Name"),
      default: false,
      isSelected: false,
    },
  ];

  const onSort = (e, newSortBy, newSortOrder = "asc") => {
    e.stopPropagation();
    if (
      oformsFilter.sortBy === newSortBy &&
      oformsFilter.sortOrder === newSortOrder
    )
      return;
    sortOforms(newSortBy, newSortOrder);
  };

  const onToggleSortOrder = (e, newSortBy) => {
    e.stopPropagation();
    onSort(e, newSortBy, oformsFilter.sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <>
      <Backdrop
        visible={isOpen}
        withBackground={false}
        onClick={onToggleCombobox}
        withoutBlur={true}
      />
      <Styled.SortButton
        id={"oform-sort"}
        title={"Sort"}
        onClick={onToggleCombobox}
      >
        <ComboBox
          opened={isOpen}
          onToggle={onToggleCombobox}
          className={"sort-combo-box"}
          options={[]}
          selectedOption={{}}
          directionX={"right"}
          directionY={"both"}
          scaled={true}
          size={"content"}
          advancedOptionsCount={sortData.length}
          disableIconClick={false}
          disableItemClick={true}
          isDefaultMode={false}
          manualY={"102%"}
          advancedOptions={
            <>
              {sortData?.map((item) => (
                <Styled.SortDropdownItem
                  id={item.id}
                  onClick={(e) => onSort(e, item.key)}
                  key={item.key}
                  data-value={item.key}
                  isSelected={oformsFilter.sortBy === item.key}
                  isDescending={oformsFilter.sortOrder === "desc"}
                >
                  <Text fontWeight={600}>{item.label}</Text>
                  <SortDesc
                    onClick={(e) => onToggleSortOrder(e, item.key)}
                    className="sortorder-arrow"
                  />
                </Styled.SortDropdownItem>
              ))}
            </>
          }
        >
          <IconButton iconName={SortReactSvgUrl} size={16} />
        </ComboBox>
      </Styled.SortButton>
    </>
  );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  sortOforms: oformsStore.sortOforms,
}))(withTranslation(["Common"])(SortFilter));
