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

import React from "react";

import { ButtonSize, Button } from "../button";
import { ComboBox, TOption } from "../combobox";

import { StyledPage, StyledOnPage, StyledPaging } from "./Paging.styled";
import { PagingProps } from "./Paging.types";

const Paging = (props: PagingProps) => {
  // console.log("Paging render");
  const {
    previousLabel,
    nextLabel,
    previousAction,
    nextAction,
    pageItems,
    countItems,
    openDirection,
    disablePrevious = false,
    disableNext = false,
    disableHover = false,
    selectedPageItem,
    selectedCountItem,
    id,
    className,
    style,
    showCountItem = true,
    onSelectPage,
    onSelectCount,
  } = props;

  const onSelectPageAction = (option: TOption) => {
    onSelectPage?.(option);
  };

  const onSelectCountAction = (option: TOption) => {
    onSelectCount?.(option);
  };

  const setDropDownMaxHeight =
    pageItems && pageItems.length > 6 ? { dropDownMaxHeight: 200 } : {};

  return (
    <StyledPaging id={id} className={className} style={style}>
      <Button
        className="prev-button not-selectable"
        size={ButtonSize.small}
        scale
        label={previousLabel}
        onClick={previousAction}
        isDisabled={disablePrevious}
        disableHover={disableHover}
      />
      {pageItems ? (
        <StyledPage>
          <ComboBox
            isDisabled={disablePrevious ? disableNext : false}
            className="manualWidth"
            directionY={openDirection}
            options={pageItems}
            onSelect={onSelectPageAction}
            scaledOptions={pageItems.length < 6}
            selectedOption={selectedPageItem}
            {...setDropDownMaxHeight}
          />
        </StyledPage>
      ) : null}
      <Button
        className="next-button not-selectable"
        size={ButtonSize.small}
        scale
        label={nextLabel}
        onClick={nextAction}
        isDisabled={disableNext}
        disableHover={disableHover}
      />
      {showCountItem
        ? countItems && (
            <StyledOnPage>
              <ComboBox
                className="hideDisabled"
                directionY={openDirection}
                directionX="right"
                options={countItems}
                scaledOptions
                onSelect={onSelectCountAction}
                selectedOption={selectedCountItem}
              />
            </StyledOnPage>
          )
        : null}
    </StyledPaging>
  );
};

export { Paging };
