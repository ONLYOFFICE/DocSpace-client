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

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { TFunction } from "i18next";

import TagList from "./TagList";

import InputParam from "../Params/InputParam";
import TagDropdown from "./TagDropdown";

const StyledTagInput = styled.div<{ hasTags: boolean }>`
  position: relative;

  .set_room_params-tag_input {
    &-label_wrapper {
      &-label {
        cursor: pointer;
        width: auto;
        display: inline-block;
      }
    }
  }

  .dropdown-content-wrapper {
    margin-bottom: -4px;
    max-width: 100%;
    position: relative;
  }

  ${({ hasTags }) => !hasTags && "margin-bottom: -8px"}
`;

type TagInputProps = {
  t: TFunction;
  title: string;
  tagHandler: any;
  setIsScrollLocked: (value: boolean) => void;
  isDisabled: boolean;
  tooltipLabel?: string;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e?: React.FocusEvent<HTMLInputElement>) => void;
  dataTestId?: string;
  isMobile?: () => boolean;
};

const TagInput = ({
  t,
  title,
  tagHandler,
  setIsScrollLocked,
  isDisabled,
  tooltipLabel,
  onFocus,
  onBlur,
  dataTestId,
  isMobile,
}: TagInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDropdown = () => {
    if (isDisabled) return;
    // setIsScrollLocked(true);
    setIsDropdownOpen(true);
  };

  const closeDropdown = () => {
    setIsScrollLocked(false);
    setIsDropdownOpen(false);
  };

  const onTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    if (text.trim().length > 0 && !isDropdownOpen) {
      openDropdown();
    } else if (text.trim().length === 0 && isDropdownOpen) {
      closeDropdown();
    }

    setTagInput(text);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    const text = event.target.value;
    if (text.trim().length > 0) {
      openDropdown();
    }
    onFocus && onFocus(event);
  };

  const handleBlur = () => {
    !isMobile?.() && closeDropdown();
    onBlur && onBlur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyCode = event.code;

    const isAcceptableEvents =
      keyCode === "ArrowUp" || keyCode === "ArrowDown" || keyCode === "Enter";

    if (isAcceptableEvents && isDropdownOpen) return;

    event.stopPropagation();
  };

  return (
    <StyledTagInput
      className="set_room_params-input set_room_params-tag_input"
      hasTags={!!tagHandler.tags.length}
    >
      <InputParam
        ref={inputRef}
        id="shared_tags-input"
        title={title ? `${title}:` : `${t("Common:Tags")}:`}
        placeholder={t("TagsPlaceholder")}
        value={tagInput}
        onChange={onTagInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        isDisabled={isDisabled}
        onKeyDown={handleKeyDown}
        name="tagInput"
        tooltipLabel={tooltipLabel}
        dataTestId={dataTestId}
      />

      <TagDropdown
        inputRef={inputRef}
        open={isDropdownOpen}
        tagHandler={tagHandler}
        tagInputValue={tagInput}
        setTagInputValue={setTagInput}
        createTagLabel={t("CreateTagOption")}
        closeDropdown={closeDropdown}
      />

      <TagList tagHandler={tagHandler} isDisabled={isDisabled} />
    </StyledTagInput>
  );
};

export default TagInput;
