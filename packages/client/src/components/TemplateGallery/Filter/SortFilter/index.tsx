/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, FC } from "react";
import { observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import SortReactSvgUrl from "PUBLIC_DIR/images/sort.react.svg?url";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";
import { Text } from "@docspace/ui-kit/components/text";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import styles from "./SortFilter.module.scss";
import { SortFilterProps, SortData } from "./SortFilter.types";

const SortFilter: FC<SortFilterProps> = ({
  t,
  oformsFilter,
  sortOforms,
  filterOformsByLocaleIsLoading,
  categoryFilterLoaded,
  languageFilterLoaded,
  isShowInitSkeleton,
  isLanguageFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleCombobox = () => setIsOpen(!isOpen);

  const sortData: SortData[] = [
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

  const onSort = (newSortBy: string) => {
    if (oformsFilter.sortBy === newSortBy) {
      sortOforms(newSortBy, oformsFilter.sortOrder === "asc" ? "desc" : "asc");
    } else sortOforms(newSortBy, "desc");

    setIsOpen(false);
  };

  if (
    (isShowInitSkeleton ||
      filterOformsByLocaleIsLoading ||
      !(categoryFilterLoaded && languageFilterLoaded)) &&
    !isLanguageFilterChange
  )
    return <RectangleSkeleton height="32px" width="32px" />;

  return (
    <>
      <Backdrop
        visible={isOpen}
        onClick={onToggleCombobox}
        withBackground={false}
      />

      <div
        className={styles.sortButton}
        title={t("Common:SortBy")}
        onClick={onToggleCombobox}
      >
        <ComboBox
          id="comboBoxSort"
          tabIndex={1}
          opened={isOpen}
          onToggle={onToggleCombobox}
          className="sort-combo-box"
          scaled
          isDisabled={isLanguageFilterChange}
          disableIconClick={isLanguageFilterChange}
          disableItemClick={isLanguageFilterChange}
          isDefaultMode={false}
          manualY="102%"
          directionX="left"
          advancedOptionsCount={sortData.length}
          fillIcon={false}
          options={[]}
          selectedOption={{ key: "", label: "" }}
          manualWidth="auto"
          advancedOptions={
            <div>
              {sortData?.map((item) => {
                const isSelected = oformsFilter.sortBy === item.key;
                const isDescending = oformsFilter.sortOrder === "desc";
                const itemClasses = [
                  styles.sortDropdownItem,
                  isSelected ? styles.selected : "",
                  !isDescending ? styles.ascending : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <DropDownItem
                    id={item.id}
                    onClick={() => onSort(item.key)}
                    key={item.key}
                    data-value={item.key}
                    className={itemClasses}
                  >
                    <Text fontWeight={600}>{item.label}</Text>
                    <SortDesc className="sortorder-arrow" />
                  </DropDownItem>
                );
              })}
            </div>
          }
        >
          <IconButton iconName={SortReactSvgUrl} size={16} />
        </ComboBox>
      </div>
    </>
  );
};

export default observer(withTranslation(["Common"])(SortFilter));
