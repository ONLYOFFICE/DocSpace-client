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

import { useState } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import SortReactSvgUrl from "PUBLIC_DIR/images/sort.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";
import { Text } from "@docspace/shared/components/text";
import { Backdrop } from "@docspace/shared/components/backdrop";
import * as Styled from "./index.styled";

const SortFilter = ({ t, oformsFilter, sortOforms }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleCombobox = () => setIsOpen(!isOpen);

  const sortData = [
    {
      id: "sort-by_name",
      key: "name_form",
      label: t("Common:Label"),
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
        withBackground={false}
        withoutBlur
      />

      <Styled.SortButton
        id="oform-sort"
        title={t("Common:SortBy")}
        onClick={onToggleCombobox}
      >
        <Styled.SortComboBox
          id="comboBoxSort"
          tabIndex={1}
          opened={isOpen}
          onToggle={onToggleCombobox}
          className="sort-combo-box"
          directionX="left"
          directionY="both"
          scaled
          size="content"
          disableIconClick={false}
          disableItemClick
          isDefaultMode={false}
          manualY="102%"
          fixedDirection
          advancedOptionsCount={sortData.length}
          fillIcon={false}
          options={[]}
          selectedOption={{}}
          manualWidth="auto"
          advancedOptions={sortData?.map((item) => (
            <Styled.SortDropdownItem
              id={item.id}
              onClick={() => onSort(item.key)}
              key={item.key}
              data-value={item.key}
              isSelected={oformsFilter.sortBy === item.key}
              $isDescending={oformsFilter.sortOrder === "desc"}
            >
              <Text fontWeight={600}>{item.label}</Text>
              <SortDesc className="sortorder-arrow" />
            </Styled.SortDropdownItem>
          ))}
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
