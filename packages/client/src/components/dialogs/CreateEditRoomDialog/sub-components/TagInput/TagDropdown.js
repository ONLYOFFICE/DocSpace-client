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

import React, { useRef, useState, useEffect } from "react";

import { StyledDropDown, StyledDropDownWrapper } from "../StyledDropdown";

import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { isMobile, DomHelpers } from "@docspace/shared/utils";

const TagDropdown = ({
  open,
  tagHandler,
  tagInputValue,
  setTagInputValue,
  createTagLabel,
  isDisabled,
  inputRef,
  closeDropdown,
}) => {
  const dropdownRef = useRef(null);

  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(0);

  const onKeyPress = (e) => e.key === "Enter" && addNewTag();

  useEffect(() => {
    inputRef?.current?.addEventListener("keyup", onKeyPress);

    return () => inputRef?.current?.removeEventListener("keyup", onKeyPress);
  }, [onKeyPress]);

  const chosenTags = tagHandler.tags.map((tag) => tag.name.toLowerCase());

  const tagsForDropdown = tagHandler.fetchedTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInputValue.toLowerCase()) &&
      !chosenTags.includes(tag.toLowerCase()),
  );

  const preventDefault = (e) => {
    e.preventDefault();
  };

  const onClickOutside = (e) => {
    /*     if (!e) return;
    if (e.target.id === "shared_tags-input") return; */
    // inputRef?.current?.blur();
    closeDropdown();
  };

  const addNewTag = () => {
    if (tagInputValue?.trim() === "") return;
    tagHandler.addNewTag(tagInputValue);
    setTagInputValue("");
    onClickOutside();
  };

  const addFetchedTag = (name) => {
    tagHandler.addTag(name);
    setTagInputValue("");
    onClickOutside();
  };

  const calcualateDisplayedDropdownItems = () => {
    let res = tagsForDropdown.map((tag, i) => (
      <DropDownItem
        className="dropdown-item"
        height={32}
        heightTablet={32}
        key={i}
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
          onMouseDown={preventDefault}
          onClick={addNewTag}
          label={`${createTagLabel}  “${tagInputValue}”`}
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
      const offsetBottom = window.innerHeight - offsetTop;
      const maxHeight = Math.floor((offsetBottom - 22) / 32) * 32 - 2;
      const result = isMobile()
        ? Math.min(maxHeight, 158)
        : Math.min(maxHeight, 382);
      setDropdownMaxHeight(result);
    }
  }, [open]);

  const dropdownItems = calcualateDisplayedDropdownItems();

  return (
    <StyledDropDownWrapper
      ref={dropdownRef}
      className="dropdown-content-wrapper"
      onMouseDown={preventDefault}
    >
      <StyledDropDown
        className="dropdown-content"
        open={open}
        forwardedRef={dropdownRef}
        maxHeight={dropdownMaxHeight}
        showDisabledItems={false}
        hasItems={!!dropdownItems.length}
        clickOutsideAction={onClickOutside}
        withBackdrop={false}
      >
        {dropdownItems}
      </StyledDropDown>
    </StyledDropDownWrapper>
  );
};

export default TagDropdown;
