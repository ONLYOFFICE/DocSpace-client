import * as Styled from "./index.styled";

import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";
import { ReactSVG } from "react-svg";
import { useRef, useState } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import OformsFilter from "@docspace/common/api/oforms/filter";
import { flagsIcons } from "@docspace/common/utils/image-helpers";
import {
  convertToCulture,
  getDefaultOformLocale,
} from "@docspace/common/utils";

const avialableLocales = ["en", "zh", "it", "fr", "es", "de", "ja"];
const defaultOformLocale = getDefaultOformLocale();

const LanguageFilter = ({ oformsFilter, getOforms }) => {
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);

  const [locale, setLocale] = useState(defaultOformLocale);

  const onSelectLanguage = (newLocale) => {
    return () => {
      const newFilter = oformsFilter.clone();
      newFilter.locale = newLocale;
      getOforms(newFilter);
      navigate(`${location.pathname}?${newFilter.toUrlParams()}`);

      setLocale(newLocale);
      setIsOpen(false);
    };
  };

  useEffect(() => {
    let firstLoadLocale = searchParams.get("locale");
    if (!firstLoadLocale) firstLoadLocale = defaultOformLocale;
    setLocale(firstLoadLocale);
  }, []);

  return (
    <Styled.LanguageFilter isOpen={isOpen}>
      <div className="combobox" onClick={toggleDropdownIsOpen}>
        <img
          className="combobox-icon"
          src={flagsIcons?.get(`${convertToCulture(locale)}.react.svg`)}
          alt={locale}
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
          {avialableLocales.map((locale, i) => (
            <DropDownItem
              key={i}
              className="dropdown-item"
              icon={flagsIcons?.get(`${convertToCulture(locale)}.react.svg`)}
              onClick={onSelectLanguage(locale)}
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
  getOforms: oformsStore.getOforms,
}))(withTranslation(["FormGallery", "Common"])(LanguageFilter));
