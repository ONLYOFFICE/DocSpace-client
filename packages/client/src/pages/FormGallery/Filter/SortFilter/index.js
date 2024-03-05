import * as Styled from "./index.styled";

import { useState } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import SortReactSvgUrl from "PUBLIC_DIR/images/sort.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";
import { Text } from "@docspace/shared/components/text";
import { isMobile } from "@docspace/shared/utils";
import { Backdrop } from "@docspace/shared/components/backdrop";

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
    {
      id: "sort-by_updatedAt",
      key: "updatedAt",
      label: t("Common:LastModifiedDate"),
      default: false,
      isSelected: false,
    },
  ];

  const onSort = (newSortBy) => {
    if (oformsFilter.sortBy === newSortBy)
      sortOforms(newSortBy, oformsFilter.sortOrder === "asc" ? "desc" : "asc");
    else sortOforms(newSortBy, "desc");

    setIsOpen(false);
  };

  return (
    <>
      <Backdrop
        visible={isOpen}
        onClick={onToggleCombobox}
        withBackground={isMobile()}
        withoutBlur={!isMobile()}
      />

      <Styled.SortButton
        id={"oform-sort"}
        title={t("Common:SortBy")}
        onClick={onToggleCombobox}
      >
        <Styled.SortComboBox
          id="comboBoxSort"
          tabIndex={1}
          opened={isOpen}
          onToggle={onToggleCombobox}
          className={"sort-combo-box"}
          directionX={"right"}
          directionY={"both"}
          scaled={true}
          size={"content"}
          disableIconClick={false}
          disableItemClick={true}
          isDefaultMode={false}
          manualY={"102%"}
          fixedDirection={true}
          advancedOptionsCount={sortData.length}
          fillIcon={false}
          options={[]}
          selectedOption={{}}
          advancedOptions={
            <>
              {sortData?.map((item) => (
                <Styled.SortDropdownItem
                  id={item.id}
                  onClick={() => onSort(item.key)}
                  key={item.key}
                  data-value={item.key}
                  isSelected={oformsFilter.sortBy === item.key}
                  isDescending={oformsFilter.sortOrder === "desc"}
                >
                  <Text fontWeight={600}>{item.label}</Text>
                  <SortDesc className="sortorder-arrow" />
                </Styled.SortDropdownItem>
              ))}
            </>
          }
        >
          <IconButton iconName={SortReactSvgUrl} size={16} />
        </Styled.SortComboBox>
      </Styled.SortButton>
    </>
  );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  sortOforms: oformsStore.sortOforms,
}))(withTranslation(["Common"])(SortFilter));
