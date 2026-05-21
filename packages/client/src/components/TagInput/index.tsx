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

import React, { useState, useRef } from "react";
import { TFunction } from "i18next";
import classNames from "classnames";
import TagList from "./TagList";

import InputParam from "SRC_DIR/components/CreateEditDialogParams/InputParam";
import TagHandler from "SRC_DIR/helpers/TagHandler";
import { removeEmojiCharacters } from "@docspace/shared/utils";

import TagDropdown from "./TagDropdown";
import styles from "./TagInput.module.scss";

type TagInputProps = {
  t: TFunction;
  title: string;
  tagHandler: TagHandler;
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
    const text = removeEmojiCharacters(e.target.value);

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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      e.relatedTarget &&
      inputRef.current &&
      e.relatedTarget.classList.contains("dropdown-item")
    ) {
      inputRef.current.focus();
      return e;
    }

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
    <div
      className={classNames(styles.tagInput, {
        [styles.noTags]: !!tagHandler.tags.length,
      })}
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
    </div>
  );
};

export default TagInput;
