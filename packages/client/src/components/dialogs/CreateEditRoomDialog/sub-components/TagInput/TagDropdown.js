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

  const chosenTags = tagHandler.tags.map((tag) => tag.name);

  const tagsForDropdown = tagHandler.fetchedTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInputValue.toLowerCase()) &&
      !chosenTags.includes(tag)
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
      ![...tagsForDropdown, ...chosenTags].find((tag) => tagInputValue === tag)
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
