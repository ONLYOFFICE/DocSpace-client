// (c) Copyright Ascensio System SIA 2009-2024
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
import { useState, useMemo } from "react";

import { mapCulturesToArray } from "../../utils/common";
import { isMobile } from "../../utils";
import {
  LanguageComboBox,
  SelectedItemComponent,
  ItemComponent,
  WrapperComponent,
} from "./LanguageCombobox.styled";
import { TCulture, TCultures, ComboboxProps } from "./LanguageCmbobox.types";

const getIconUrl = (cultureNames: TCultures, selectedCulture: TCulture) => {
  const currentCulture = cultureNames.find(
    (item) => item.key === selectedCulture.key,
  );

  if (!currentCulture) return "";

  return currentCulture.icon;
};
const LanguageCombobox = (props: ComboboxProps) => {
  const {
    tabIndex,
    cultures,
    isAuthenticated = false,
    onSelectLanguage,
    selectedCulture,
    id,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const onToggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const cultureNames = useMemo(() => {
    return mapCulturesToArray(cultures, isAuthenticated);
  }, [isAuthenticated, cultures]);

  const onSelect = (culture: TCulture) => {
    if (culture.key === selectedCulture.key) return;

    onSelectLanguage(culture.key, culture.icon);

    onCloseDropdown();
  };

  const advancedOptions = () => {
    return (
      <>
        {cultureNames.map((culture) => (
          <ItemComponent
            className="language-item"
            key={culture.key}
            isSelected={culture.key === selectedCulture.key}
            icon={culture.icon}
            {...(isMobile() && culture.label && { label: culture.label })}
            onClick={() => onSelect(culture)}
            fillIcon={false}
          />
        ))}
      </>
    );
  };

  return (
    <WrapperComponent>
      <LanguageComboBox
        id={id}
        tabIndex={tabIndex}
        className="combobox"
        opened={isOpen}
        onClick={onToggleDropdownIsOpen}
        onSelect={onCloseDropdown}
        isDisabled={false}
        showDisabledItems
        directionX="right"
        directionY="both"
        scaled
        size="base"
        manualWidth="41px"
        disableIconClick={false}
        disableItemClick={false}
        isDefaultMode={false}
        fixedDirection
        advancedOptionsCount={5}
        fillIcon={false}
        withBlur={isMobile()}
        options={[]}
        selectedOption={{}}
        advancedOptions={advancedOptions()}
      >
        <SelectedItemComponent
          key={selectedCulture.key}
          icon={
            selectedCulture.icon ?? getIconUrl(cultureNames, selectedCulture)
          }
          fillIcon={false}
        />
      </LanguageComboBox>
    </WrapperComponent>
  );
};
export { LanguageCombobox };
