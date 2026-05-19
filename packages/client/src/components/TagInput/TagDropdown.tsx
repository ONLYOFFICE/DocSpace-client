/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useRef, useState, useEffect } from "react";
import classNames from "classnames";

import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { isMobile, DomHelpers } from "@docspace/shared/utils";
import { TagDropDownProps } from "./TagInput.types";
import styles from "./TagInput.module.scss";

const MAX_ITEMS_COUNT = 7;

const TagDropdown = ({
  open,
  tagHandler,

  tagInputValue,
  setTagInputValue,

  createTagLabel,
  inputRef,
  closeDropdown,
}: TagDropDownProps) => {
  const dropdownRef = useRef(null);

  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(0);

  const onClickOutside = () => {
    closeDropdown();
  };

  const addNewTag = () => {
    if (tagInputValue?.trim() === "") return;

    tagHandler.addNewTag(tagInputValue);

    setTagInputValue("");

    onClickOutside();
  };

  const onKeyPress = React.useCallback(
    (e: KeyboardEvent) => {
      e.key === "Enter" && addNewTag();
    },
    [addNewTag],
  );

  useEffect(() => {
    inputRef?.current?.addEventListener("keyup", onKeyPress);
    return () => inputRef?.current?.removeEventListener("keyup", onKeyPress);
  }, [onKeyPress, inputRef]);

  const chosenTags = tagHandler.tags.map((tag) => tag.name.toLowerCase());

  const tagsForDropdown = tagHandler.fetchedTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInputValue.toLowerCase()) &&
      !chosenTags.includes(tag.toLowerCase()),
  );

  const addFetchedTag = (name: string) => {
    tagHandler.addTag(name);
    setTagInputValue("");
    onClickOutside();
  };

  const calcualateDisplayedDropdownItems = () => {
    let res = tagsForDropdown.map((tag) => (
      <DropDownItem
        className="dropdown-item"
        height={32}
        heightTablet={32}
        key={tag}
        label={tag}
        onClick={() => addFetchedTag(tag)}
      />
    ));

    if (
      tagInputValue &&
      ![...tagsForDropdown, ...chosenTags].find(
        (tag) => tagInputValue.toLowerCase() === tag.toLowerCase(),
      )
    )
      res = [
        <DropDownItem
          key={-2}
          className="dropdown-item"
          onClick={addNewTag}
          label={`${createTagLabel}  "${tagInputValue}"`}
          height={32}
          heightTablet={32}
        />,
        ...res,
      ];

    return res;
  };

  useEffect(() => {
    if (dropdownRef && open) {
      const { top: offsetTop } = DomHelpers.getOffset(dropdownRef.current);
      const offsetBottom = window.innerHeight - Number(offsetTop);
      const maxHeight = Math.floor((offsetBottom - 22) / 32) * 32 - 2;
      const result = isMobile()
        ? Math.min(maxHeight, 158)
        : Math.min(maxHeight, 382);
      setDropdownMaxHeight(result);
    }
  }, [open]);

  const dropdownItems = calcualateDisplayedDropdownItems();

  return (
    <DropDown
      className={classNames(styles.tagDropdown, "dropdown-content", {
        [styles.hidden]: !dropdownItems.length,
      })}
      open={open}
      forwardedRef={dropdownRef}
      maxHeight={dropdownMaxHeight}
      showDisabledItems={false}
      clickOutsideAction={onClickOutside}
      withBackdrop={false}
      isDefaultMode={false}
      manualY="54px"
      directionY="both"
    >
      {dropdownItems.length > MAX_ITEMS_COUNT ? (
        <Scrollbar style={{ height: `${32 * MAX_ITEMS_COUNT}px` }}>
          {dropdownItems}
        </Scrollbar>
      ) : (
        dropdownItems
      )}
    </DropDown>
  );
};

export default TagDropdown;
