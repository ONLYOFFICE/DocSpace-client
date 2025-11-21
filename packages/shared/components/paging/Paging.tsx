// (c) Copyright Ascensio System SIA 2009-2025
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
import classNames from "classnames";

import { ButtonSize, Button } from "../button";
import { ComboBox, TOption } from "../combobox";

import { PagingProps } from "./Paging.types";
import styles from "./Paging.module.scss";

const Paging = (props: PagingProps) => {
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
    selectedPageItem,
    selectedCountItem,
    id,
    className,
    style,
    showCountItem = true,
    onSelectPage,
    onSelectCount,
    dataTestId,
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
    <div
      data-testid={dataTestId ?? "paging"}
      id={id}
      className={classNames(styles.paging, className)}
      style={style}
    >
      <div className={styles.leftButtonsContainer}>
        <Button
          className={classNames(styles.prevButton, "not-selectable")}
          size={ButtonSize.small}
          scale
          label={previousLabel}
          onClick={previousAction}
          isDisabled={disablePrevious}
          testId="paging_previous_button"
        />
        {pageItems ? (
          <div className={styles.page}>
            <ComboBox
              isDisabled={disablePrevious ? disableNext : false}
              className={styles.manualWidth}
              directionY={openDirection}
              options={pageItems}
              onSelect={onSelectPageAction}
              scaledOptions={pageItems.length < 6}
              selectedOption={selectedPageItem}
              dataTestId="paging_page_items_combobox"
              {...setDropDownMaxHeight}
            />
          </div>
        ) : null}
        <Button
          className={classNames(styles.nextButton, "not-selectable")}
          size={ButtonSize.small}
          scale
          label={nextLabel}
          onClick={nextAction}
          isDisabled={disableNext}
          testId="paging_next_button"
        />
      </div>
      {showCountItem
        ? countItems && (
            <div className={styles.onPage}>
              <ComboBox
                className={styles.hideDisabled}
                directionY={openDirection}
                directionX="right"
                options={countItems}
                scaledOptions
                onSelect={onSelectCountAction}
                selectedOption={selectedCountItem}
                dataTestId="paging_count_items_combobox"
              />
            </div>
          )
        : null}
    </div>
  );
};

export { Paging };
