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

import { FC, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { withoutInjected } from "SRC_DIR/helpers/injected";

import { SelectedItem } from "@onlyoffice/apps-ui-kit/components/selected-item";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { getCultureLabel } from "@docspace/shared/constants/cultures";

import { toCulture } from "../../utils/cultureUtils";
import styles from "./SelectedFilters.module.scss";
import type { SelectedFiltersProps } from "./SelectedFilters.types";

const LANGUAGE_GROUP = "language";
const PURPOSE_GROUP = "purpose";
const CATEGORY_GROUP = "category";

const SelectedFilters: FC<SelectedFiltersProps> = ({
  t,
  onHeightChange,
  locale,
  isLocaleChanged,
  defaultOformLocale,
  selectedPurpose,
  selectedCategories,
  filterOformsByLocaleIsLoading,
  filterOformsByLocale,
  filterOformsByPurpose,
  removeOformsCategory,
  clearOformsFilter,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const items = [
    ...(isLocaleChanged
      ? [
          {
            key: locale,
            group: LANGUAGE_GROUP,
            label: getCultureLabel(toCulture(locale)),
          },
        ]
      : []),
    ...(selectedPurpose
      ? [
          {
            key: selectedPurpose.key,
            group: PURPOSE_GROUP,
            label: selectedPurpose.name,
          },
        ]
      : []),
    ...selectedCategories.map(({ documentId, name }) => ({
      key: documentId,
      group: CATEGORY_GROUP,
      label: name,
    })),
  ];

  const hasItems = items.length > 0;

  useEffect(() => {
    const row = rowRef.current;

    if (!row) {
      onHeightChange(0);
      return;
    }

    const observer = new ResizeObserver(() => {
      const { marginTop } = window.getComputedStyle(row);
      onHeightChange(row.offsetHeight + parseFloat(marginTop || "0"));
    });

    observer.observe(row);

    return () => {
      observer.disconnect();
      onHeightChange(0);
    };
  }, [hasItems, onHeightChange]);

  if (!hasItems) return null;

  const onRemove = (key: string | number, _label: unknown, group?: string) => {
    if (filterOformsByLocaleIsLoading) return;

    switch (group) {
      case LANGUAGE_GROUP:
        filterOformsByLocale(defaultOformLocale);
        break;
      case PURPOSE_GROUP:
        filterOformsByPurpose("");
        break;
      default:
        removeOformsCategory(String(key));
    }
  };

  return (
    <div
      ref={rowRef}
      className={styles.selectedFilters}
      data-testid="template_gallery_selected_filters"
    >
      {items.map((item) => (
        <SelectedItem
          key={`${item.group}_${item.key}`}
          className={styles.selectedItem}
          propKey={item.key}
          group={item.group}
          label={item.label}
          onClose={onRemove}
          onClick={onRemove}
          isInline
          isDisabled={filterOformsByLocaleIsLoading}
          dataTestId={`template_gallery_selected_${item.group}_${item.key}`}
        />
      ))}
      {items.length > 1 ? (
        <Link
          className={styles.clearAll}
          isHovered
          fontWeight={600}
          isSemitransparent
          type={LinkType.action}
          onClick={clearOformsFilter}
          dataTestId="template_gallery_clear_all"
        >
          {t("Common:ClearAll")}
        </Link>
      ) : null}
    </div>
  );
};

const injectStores = ({ oformsStore }: TStore) => ({
  locale: oformsStore.oformsFilter.locale ?? "",
  isLocaleChanged: oformsStore.isLocaleChanged,
  defaultOformLocale: oformsStore.defaultOformLocale,
  selectedPurpose: oformsStore.selectedPurpose,
  selectedCategories: oformsStore.selectedCategories,
  filterOformsByLocaleIsLoading: oformsStore.filterOformsByLocaleIsLoading,
  filterOformsByLocale: oformsStore.filterOformsByLocale,
  filterOformsByPurpose: oformsStore.filterOformsByPurpose,
  removeOformsCategory: oformsStore.removeOformsCategory,
  clearOformsFilter: oformsStore.clearOformsFilter,
});

export default withoutInjected<
  SelectedFiltersProps,
  ReturnType<typeof injectStores>
>(inject(injectStores)(withTranslation(["Common"])(observer(SelectedFilters))));
