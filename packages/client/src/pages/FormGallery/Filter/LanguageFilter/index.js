import * as Styled from "./index.styled";

import { useState } from "react";
import { inject, observer } from "mobx-react";

import { flagsIcons } from "@docspace/common/utils/image-flags";
import { convertToCulture } from "@docspace/common/utils";

const LanguageFilter = ({
  oformsFilter,
  defaultOformLocale,
  oformLocales,
  filterOformsByLocale,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const onFilterByLocale = async (newLocale) => {
    await filterOformsByLocale(newLocale);

    const [sectionScroll] = document.getElementsByClassName("section-scroll");
    sectionScroll.scrollTop = 0;
  };

  return (
    <Styled.LanguageFilter>
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
            {oformLocales.map((locale) => (
              <Styled.LanguageFilterItem
                key={locale}
                isSelected={locale === oformsFilter.locale}
                icon={flagsIcons?.get(`${convertToCulture(locale)}.react.svg`)}
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
}))(observer(LanguageFilter));
