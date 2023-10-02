import * as Styled from "./index.styled";

import { useState } from "react";
import { inject, observer } from "mobx-react";

import DeReactSvgUrl from "PUBLIC_DIR/images/flags/de.react.svg?url";
import EnUSReactSvgUrl from "PUBLIC_DIR/images/flags/en-US.react.svg?url";
import EsReactSvgUrl from "PUBLIC_DIR/images/flags/es.react.svg?url";
import FrReactSvgUrl from "PUBLIC_DIR/images/flags/fr.react.svg?url";
import ItReactSvgUrl from "PUBLIC_DIR/images/flags/it.react.svg?url";
import JaJPReactSvgUrl from "PUBLIC_DIR/images/flags/ja-JP.react.svg?url";
import ZhCNReactSvgUrl from "PUBLIC_DIR/images/flags/zh-CN.react.svg?url";

const locales = [
  {
    key: "en",
    icon: EnUSReactSvgUrl,
  },
  {
    key: "zh",
    icon: ZhCNReactSvgUrl,
  },
  {
    key: "it",
    icon: ItReactSvgUrl,
  },
  {
    key: "fr",
    icon: FrReactSvgUrl,
  },
  {
    key: "es",
    icon: EsReactSvgUrl,
  },
  {
    key: "de",
    icon: DeReactSvgUrl,
  },
  {
    key: "ja",
    icon: JaJPReactSvgUrl,
  },
];

const LanguageFilter = ({ oformsFilter, filterOformsByLocale }) => {
  const [selectedOption] = locales.filter((l) => l.key === oformsFilter.locale);

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
            {locales.map((locale) => (
              <Styled.LanguageFilterItem
                key={locale.key}
                isSelected={locale.key === oformsFilter.locale}
                icon={locale.icon}
                onClick={() => onFilterByLocale(locale.key)}
                fillIcon={false}
              />
            ))}
          </>
        }
      >
        <Styled.LanguageFilterSelectedItem
          key={selectedOption.key}
          icon={selectedOption.icon}
          fillIcon={false}
        />
      </Styled.LanguangeComboBox>
    </Styled.LanguageFilter>
  );
};

export default inject(({ auth, oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByLocale: oformsStore.filterOformsByLocale,
  currentColorScheme: auth.settingsStore.currentColorScheme,
}))(observer(LanguageFilter));
