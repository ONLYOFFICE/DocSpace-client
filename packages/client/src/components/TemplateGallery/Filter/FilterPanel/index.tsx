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

import { FC, useCallback, useMemo, useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import classNames from "classnames";
import { withoutInjected } from "SRC_DIR/helpers/injected";

import FilterIcon from "@onlyoffice/apps-ui-kit/components/filter/sub-components/FilterIcon";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { RadioButtonGroup } from "@onlyoffice/apps-ui-kit/components/radio-button-group";
import { Checkbox } from "@onlyoffice/apps-ui-kit/components/checkbox";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@onlyoffice/apps-ui-kit/components/combobox";
import { useEventListener } from "@onlyoffice/apps-ui-kit/hooks/useEventListener";
import { mapCulturesToArray } from "@docspace/shared/utils/cultures";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { toCulture } from "../../utils/cultureUtils";
import styles from "./FilterPanel.module.scss";
import type { FilterPanelProps } from "./FilterPanel.types";

const ALL_PURPOSES = "all-purposes";

const FilterPanel: FC<FilterPanelProps> = ({
  t,
  isLoading,
  viewMobile,
  oformLocales,
  locale,
  purposes,
  purpose,
  parentCategories,
  categoryIds,
  isOformsFilterChanged,
  filterOformsByLocaleIsLoading,
  filterOformsByLocale,
  filterOformsByPurpose,
  toggleOformsCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const onToggle = useCallback(() => setIsOpen((open) => !open), []);

  const onOutsideMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!isOpen) return;

      const target = e.target as HTMLElement;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target) ||
        target.closest?.(".dropdown-container")
      )
        return;

      setIsOpen(false);
    },
    [isOpen],
  );

  useEventListener("mousedown", onOutsideMouseDown);

  const languageOptions = useMemo(
    () => mapCulturesToArray((oformLocales ?? []).map(toCulture), false),
    [oformLocales],
  );

  if (isLoading) return <RectangleSkeleton width="32px" height="32px" />;

  const selectedLanguage = languageOptions.find(
    ({ key }) => key === toCulture(locale),
  );

  const onSelectLanguage = (option: TOption) => {
    const { index } = option as TOption & { index?: number };
    if (typeof index !== "number" || !oformLocales) return;

    const nextLocale = oformLocales[index];
    if (nextLocale !== locale) filterOformsByLocale(nextLocale);
  };

  const onSelectPurpose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    filterOformsByPurpose(value === ALL_PURPOSES ? "" : value);
  };

  const purposeOptions = [
    { value: ALL_PURPOSES, label: t("Common:All") },
    ...purposes.map(({ key, name }) => ({ value: key, label: name })),
  ];

  const isDisabled = filterOformsByLocaleIsLoading;

  return (
    <div className={styles.filterPanelRoot}>
      <div ref={buttonRef}>
        <FilterIcon
          id="template-gallery-filter"
          title={t("Common:Filter")}
          onClick={onToggle}
          isShowIndicator={isOformsFilterChanged}
          dataTestId="template_gallery_filter_button"
        />
      </div>

      {isOpen ? (
        <div
          ref={panelRef}
          className={classNames(styles.filterPanel, {
            [styles.mobile]: viewMobile,
          })}
          data-testid="template_gallery_filter_panel"
        >
          {selectedLanguage ? (
            <div className={styles.section}>
              <Text className={styles.sectionHeader} fontWeight={600}>
                {t("Common:Language")}
              </Text>
              <ComboBox
                options={languageOptions}
                selectedOption={selectedLanguage}
                onSelect={onSelectLanguage}
                isDisabled={isDisabled}
                scaled
                scaledOptions
                size={ComboBoxSize.content}
                dropDownMaxHeight={300}
                directionY="bottom"
                fillIcon={false}
                showDisabledItems
                dataTestId="template_gallery_language_combobox"
              />
            </div>
          ) : null}

          {purposes.length > 1 ? (
            <div className={styles.section}>
              <Text className={styles.sectionHeader} fontWeight={600}>
                {t("FormGallery:Purpose")}
              </Text>
              <RadioButtonGroup
                name="template-gallery-purpose"
                orientation="vertical"
                spacing="10px"
                options={purposeOptions}
                selected={purpose || ALL_PURPOSES}
                onClick={onSelectPurpose}
                isDisabled={isDisabled}
                dataTestId="template_gallery_purpose"
              />
            </div>
          ) : null}

          {parentCategories.length > 0 ? (
            <div className={styles.section}>
              <Text className={styles.sectionHeader} fontWeight={600}>
                {t("FormGallery:Categories")}
              </Text>
              <div className={styles.categories}>
                {parentCategories.map(({ documentId, name }) => (
                  <Checkbox
                    key={documentId}
                    label={name}
                    isChecked={categoryIds.includes(documentId)}
                    onChange={() => toggleOformsCategory(documentId)}
                    isDisabled={isDisabled}
                    dataTestId={`template_gallery_category_${documentId}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const injectStores = ({ oformsStore }: TStore) => ({
  oformLocales: oformsStore.oformLocales,
  locale: oformsStore.oformsFilter.locale ?? "",
  purposes: oformsStore.purposes,
  purpose: oformsStore.oformsFilter.purpose,
  parentCategories: oformsStore.parentCategories,
  categoryIds: oformsStore.oformsFilter.categoryIds,
  isOformsFilterChanged: oformsStore.isOformsFilterChanged,
  filterOformsByLocaleIsLoading: oformsStore.filterOformsByLocaleIsLoading,
  filterOformsByLocale: oformsStore.filterOformsByLocale,
  filterOformsByPurpose: oformsStore.filterOformsByPurpose,
  toggleOformsCategory: oformsStore.toggleOformsCategory,
});

export default withoutInjected<
  FilterPanelProps,
  ReturnType<typeof injectStores>
>(
  inject(injectStores)(
    withTranslation(["FormGallery", "Common"])(observer(FilterPanel)),
  ),
);
