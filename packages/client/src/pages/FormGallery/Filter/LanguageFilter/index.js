// (c) Copyright Ascensio System SIA 2010-2024
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

import * as Styled from "./index.styled";

import { withTranslation } from "react-i18next";

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";

import { flagsIcons } from "@docspace/shared/utils/image-flags";
import { convertToCulture } from "@docspace/shared/utils/common";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { isMobile } from "@docspace/shared/utils";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const LanguageFilter = ({
  t,
  oformsFilter,
  defaultOformLocale,
  oformLocales,
  filterOformsByLocale,
  filterOformsByLocaleIsLoading,
  setLanguageFilterLoaded,
  categoryFilterLoaded,
  languageFilterLoaded,
  oformFilesLoaded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const onFilterByLocale = async (newLocale) => {
    await filterOformsByLocale(newLocale);
    onCloseDropdown();

    const [sectionScroll] = document.getElementsByClassName("section-scroll");
    sectionScroll.scrollTop = 0;
  };

  useEffect(() => {
    setLanguageFilterLoaded(oformLocales && oformLocales?.length !== 0);
  }, [oformLocales, oformLocales?.length]);

  if (
    filterOformsByLocaleIsLoading ||
    !(categoryFilterLoaded && languageFilterLoaded && oformFilesLoaded)
  )
    return <RectangleSkeleton width="41px" height="32px" />;

  return (
    <Styled.LanguageFilter>
      <Backdrop
        visible={isOpen}
        withBackground={isMobile()}
        onClick={onCloseDropdown}
        withoutBlur={!isMobile()}
      />
      <Styled.LanguangeComboBox
        id="comboBoxLanguage"
        tabIndex={1}
        className={"combobox"}
        opened={isOpen}
        onClick={onToggleDropdownIsOpen}
        onSelect={onCloseDropdown}
        isDisabled={false}
        showDisabledItems={true}
        directionX={"right"}
        directionY={"both"}
        scaled={true}
        size={"base"}
        manualWidth={"41px"}
        disableIconClick={false}
        disableItemClick={false}
        isDefaultMode={false}
        fixedDirection={true}
        advancedOptionsCount={5}
        fillIcon={false}
        options={[]}
        selectedOption={{}}
        advancedOptions={
          <>
            {oformLocales?.map((locale) => (
              <Styled.LanguageFilterItem
                className={"language-item"}
                key={locale}
                isSelected={locale === oformsFilter.locale}
                icon={flagsIcons?.get(`${convertToCulture(locale)}.react.svg`)}
                label={
                  isMobile()
                    ? t(`Common:Culture_${convertToCulture(locale)}`)
                    : undefined
                }
                onClick={() => onFilterByLocale(locale)}
                fillIcon={false}
              />
            ))}
          </>
        }
      >
        <Styled.LanguageFilterSelectedItem
          key={oformsFilter.locale}
          icon={flagsIcons?.get(
            `${convertToCulture(
              oformsFilter.locale || defaultOformLocale
            )}.react.svg`
          )}
          fillIcon={false}
        />
      </Styled.LanguangeComboBox>
    </Styled.LanguageFilter>
  );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  defaultOformLocale: oformsStore.defaultOformLocale,
  oformLocales: oformsStore.oformLocales,
  filterOformsByLocale: oformsStore.filterOformsByLocale,
  filterOformsByLocaleIsLoading: oformsStore.filterOformsByLocaleIsLoading,
  setLanguageFilterLoaded: oformsStore.setLanguageFilterLoaded,
  categoryFilterLoaded: oformsStore.categoryFilterLoaded,
  languageFilterLoaded: oformsStore.languageFilterLoaded,
  oformFilesLoaded: oformsStore.oformFilesLoaded,
}))(withTranslation(["Common"])(observer(LanguageFilter)));
