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
import { ReactSVG } from "react-svg";

import CrossIconReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { IconButton } from "../icon-button";
import { Text } from "../text";

import { StyledTag, StyledDropdownText } from "./Tag.styled";
import { TagProps } from "./Tag.types";

export const TagPure = ({
  tag,
  label,
  isNewTag,
  isDisabled,
  isDeleted,
  isDefault,
  isLast,
  onDelete,
  onClick,
  advancedOptions,
  tagMaxWidth,
  id,
  className,
  style,
  icon,
  removeTagIcon,
  roomType,
  providerType,
}: TagProps) => {
  const [openDropdown, setOpenDropdown] = React.useState(false);

  const tagRef = React.useRef<HTMLDivElement | null>(null);
  const isMountedRef = React.useRef(true);

  const onClickOutside = React.useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (
      (!!target &&
        typeof target.className !== "object" &&
        target.className?.includes("advanced-tag")) ||
      !isMountedRef.current
    )
      return;

    setOpenDropdown(false);
  }, []);

  React.useEffect(() => {
    if (openDropdown) {
      return document.addEventListener("click", onClickOutside);
    }

    document.removeEventListener("click", onClickOutside);
    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, [openDropdown, onClickOutside]);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const openDropdownAction = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target?.className?.includes("backdrop-active")) return;

    setOpenDropdown(true);
  };

  const onClickAction = React.useCallback(
    (e: React.MouseEvent | React.ChangeEvent) => {
      if (onClick && !isDisabled && !isDeleted) {
        const target = e.target as HTMLDivElement;
        onClick({ roomType, label: target.dataset.tag, providerType });
      }
    },
    [onClick, isDisabled, isDeleted, roomType, providerType],
  );

  const onDeleteAction = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== tagRef.current) {
        onDelete?.(tag);
      }
    },
    [onDelete, tag, tagRef],
  );

  return advancedOptions ? (
    <>
      <StyledTag
        id={id}
        className={`tag advanced-tag ${className ? ` ${className}` : ""}`}
        style={style}
        ref={tagRef}
        onClick={openDropdownAction}
        isDisabled={isDisabled}
        isDeleted={isDeleted}
        isDefault={isDefault}
        isLast={isLast}
        tagMaxWidth={tagMaxWidth}
        isClickable={!!onClick}
        data-testid="tag"
      >
        <Text className="tag-text" font-size="13px" noSelect>
          ...
        </Text>
      </StyledTag>
      <DropDown
        open={openDropdown}
        forwardedRef={tagRef}
        clickOutsideAction={onClickOutside}
        // directionX={"right"}
        manualY="4px"
      >
        {advancedOptions.map((t, index) => (
          <DropDownItem
            className="tag__dropdown-item tag"
            key={`${t}_${index * 50}`}
            onClick={onClickAction}
            data-tag={t}
          >
            <StyledDropdownText
              className="tag__dropdown-item-text"
              fontWeight={600}
              fontSize="12px"
              truncate
              removeTagIcon={removeTagIcon}
            >
              {t}
            </StyledDropdownText>
          </DropDownItem>
        ))}
      </DropDown>
    </>
  ) : (
    <StyledTag
      title={label}
      onClick={onClickAction}
      isNewTag={isNewTag}
      isDisabled={isDisabled}
      isDeleted={isDeleted}
      isDefault={isDefault}
      tagMaxWidth={tagMaxWidth}
      data-tag={label}
      id={id}
      className={`tag${className ? ` ${className}` : ""}`}
      style={style}
      isLast={isLast}
      isClickable={!!onClick}
      data-testid="tag"
    >
      {icon ? (
        <ReactSVG className="third-party-tag" src={icon} />
      ) : (
        <>
          <Text
            className="tag-text"
            title={label}
            font-size="13px"
            noSelect
            truncate
          >
            {label}
          </Text>
          {isNewTag && !!onDelete && (
            <IconButton
              className="tag-icon"
              iconName={CrossIconReactSvgUrl}
              size={10}
              onClick={onDeleteAction}
            />
          )}
        </>
      )}
    </StyledTag>
  );
};

const Tag = React.memo(TagPure);

export { Tag };
