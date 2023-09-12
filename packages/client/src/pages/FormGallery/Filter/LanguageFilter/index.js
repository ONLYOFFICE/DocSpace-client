import * as Styled from "./index.styled";

import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";
import { ReactSVG } from "react-svg";
import { useRef, useState } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { flagsIcons } from "@docspace/common/utils/image-helpers";
import { convertToCulture } from "@docspace/common/utils";

const avialableLocales = ["en", "zh", "it", "fr", "es", "de", "ja"];

const LanguageFilter = ({ oformsFilter, filterOformsByLocale }) => {
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);

  const onFilterByLocale = async (newLocale) => {
    await filterOformsByLocale(newLocale);

    const [sectionScroll] = document.getElementsByClassName("section-scroll");
    sectionScroll.scrollTop = 0;
  };

  return (
    <Styled.LanguageFilter isOpen={isOpen}>
      <div className="combobox" onClick={toggleDropdownIsOpen}>
        <img
          className="combobox-icon"
          src={flagsIcons?.get(
            `${convertToCulture(oformsFilter.locale)}.react.svg`
          )}
          alt={oformsFilter.locale}
        />
        <ReactSVG className="combobox-expander" src={ExpanderDownReactSvgUrl} />
      </div>
      <div className="dropdown-wrapper" ref={dropdownRef}>
        <DropDown
          className={"dropdown-container"}
          forwardedRef={dropdownRef}
          open={isOpen}
          clickOutsideAction={toggleDropdownIsOpen}
          directionY={"bottom"}
          directionX={"right"}
          isDefaultMode={false}
          fixedDirection={true}
        >
          {avialableLocales.map((locale) => (
            <Styled.LanguageFilterItem
              key={locale}
              isSelected={locale === oformsFilter.locale}
              className="dropdown-item"
              icon={flagsIcons?.get(`${convertToCulture(locale)}.react.svg`)}
              onClick={() => onFilterByLocale(locale)}
              fillIcon={false}
            />
          ))}
        </DropDown>
      </div>
    </Styled.LanguageFilter>
  );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByLocale: oformsStore.filterOformsByLocale,
}))(withTranslation(["FormGallery", "Common"])(LanguageFilter));
