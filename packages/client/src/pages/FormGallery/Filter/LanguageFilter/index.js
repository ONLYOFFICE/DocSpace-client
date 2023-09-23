import * as Styled from "./index.styled";

import DropDown from "@docspace/components/drop-down";
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";
import { ReactSVG } from "react-svg";
import { useRef, useState, useEffect } from "react";
import { inject } from "mobx-react";
import { flagsIcons } from "@docspace/common/utils/image-helpers";
import { convertToCulture } from "@docspace/common/utils";
import DropDownItem from "@docspace/components/drop-down-item";
import ComboBox from "@docspace/components/combobox";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";

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

const LanguageFilter = ({
  oformsFilter,
  filterOformsByLocale,
  currentColorScheme,
}) => {
  const dropdownRef = useRef(null);

  const [currentOption] = locales.filter(
    (locale) => locale.key === oformsFilter.locale
  );

  const [selectedOption, setSelectedOption] = useState(currentOption);

  const getSelectedOption = () => {
    const [currentOption] = locales.filter(
      (locale) => locale.key === oformsFilter.locale
    );
    return currentOption;
  };

  console.log(selectedOption);
  console.log(getSelectedOption());

  const [isOpen, setIsOpen] = useState(false);
  const onToggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const onFilterByLocale = async (newLocale) => {
    await filterOformsByLocale(newLocale);

    const [sectionScroll] = document.getElementsByClassName("section-scroll");
    sectionScroll.scrollTop = 0;
  };

  useEffect(() => {
    const [currentOption] = locales.filter(
      (locale) => locale.key === oformsFilter.locale
    );
    setSelectedOption(currentOption);
  }, [oformsFilter.locale]);

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
          key={currentOption.key}
          icon={currentOption.icon}
          fillIcon={false}
        />
      </Styled.LanguangeComboBox>
    </Styled.LanguageFilter>
  );

  // return (
  //   <Styled.LanguageFilter
  //     currentColorScheme={currentColorScheme}
  //     isOpen={isOpen}
  //   >
  //     <div className="combobox" onClick={toggleDropdownIsOpen}>
  //       <img
  //         className="combobox-icon"
  //         src={flagsIcons?.get(
  //           `${convertToCulture(oformsFilter.locale)}.react.svg`
  //         )}
  //         alt={oformsFilter.locale}
  //       />
  //       <ReactSVG className="combobox-expander" src={ExpanderDownReactSvgUrl} />
  //     </div>
  //     <div className="dropdown-wrapper" ref={dropdownRef}>
  //       <DropDown
  //         className={"dropdown-container"}
  //         forwardedRef={dropdownRef}
  //         open={isOpen}
  //         clickOutsideAction={toggleDropdownIsOpen}
  //         directionY={"bottom"}
  //         directionX={"right"}
  //         isDefaultMode={false}
  //         fixedDirection={true}
  //       >
  //         {avialableLocales.map((locale) => (
  //           <Styled.LanguageFilterItem
  //             key={locale}
  //             isSelected={locale === oformsFilter.locale}
  //             className="dropdown-item"
  //             icon={flagsIcons?.get(`${convertToCulture(locale)}.react.svg`)}
  //             onClick={() => onFilterByLocale(locale)}
  //             fillIcon={false}
  //           />
  //         ))}
  //       </DropDown>
  //     </div>
  //   </Styled.LanguageFilter>
  // );
};

export default inject(({ auth, oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByLocale: oformsStore.filterOformsByLocale,
  currentColorScheme: auth.settingsStore.currentColorScheme,
}))(LanguageFilter);
