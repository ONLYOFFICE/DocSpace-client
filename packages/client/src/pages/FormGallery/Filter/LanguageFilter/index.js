import * as Styled from "./index.styled";

import { withTranslation } from "react-i18next";

import { useState } from "react";
import { inject, observer } from "mobx-react";

import { flagsIcons } from "@docspace/common/utils/image-flags";
import { convertToCulture } from "@docspace/common/utils";
import Backdrop from "@docspace/components/backdrop";
import { isMobile } from "@docspace/components/utils/device";

const LanguageFilter = ({
  t,
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
    onCloseDropdown();

    const [sectionScroll] = document.getElementsByClassName("section-scroll");
    sectionScroll.scrollTop = 0;
  };

  if (oformLocales !== null && oformLocales?.length === 0) return null;

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
}))(withTranslation(["Common"])(observer(LanguageFilter)));
