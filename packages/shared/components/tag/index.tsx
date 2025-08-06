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
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { IconButton } from "../icon-button";
import { Text } from "../text";

import type { TagProps } from "./Tag.types";
import styles from "./Tag.module.scss";

const TagPure = ({
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
  dataTestId,
  onMouseEnter,
  onMouseLeave,
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
    e.stopPropagation();

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
      <div
        id={id}
        className={classNames(styles.tag, "advanced-tag", className, {
          [styles.isDisabled]: isDisabled,
          [styles.isDeleted]: isDeleted,
          [styles.isClickable]: !!onClick,
          [styles.isLast]: isLast,
        })}
        style={{ ...style, maxWidth: tagMaxWidth }}
        ref={tagRef}
        onClick={openDropdownAction}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-testid="tag_container"
      >
        <Text className={styles.tagText} fontSize="13px" noSelect>
          ...
        </Text>
      </div>
      <DropDown
        open={openDropdown}
        forwardedRef={tagRef}
        clickOutsideAction={onClickOutside}
        manualY="4px"
      >
        {advancedOptions.map((t, index) => (
          <DropDownItem
            className="tag__dropdown-item tag"
            key={`${t}_${index * 50}`}
            onClick={onClickAction}
            data-tag={t}
            testId={dataTestId ?? "tag_item"}
          >
            <Text
              className={classNames(styles.dropdownText, {
                [styles.removeTagIcon]: removeTagIcon,
              })}
              fontWeight={600}
              fontSize="12px"
              truncate
            >
              {t}
            </Text>
          </DropDownItem>
        ))}
      </DropDown>
    </>
  ) : (
    <div
      title={label}
      onClick={onClickAction}
      className={classNames(styles.tag, "tag", className, {
        [styles.isNewTag]: isNewTag,
        [styles.isDisabled]: isDisabled,
        [styles.isDeleted]: isDeleted,
        [styles.isClickable]: !!onClick,
        [styles.isLast]: isLast,
        [styles.thirdPartyTag]: icon,
      })}
      style={{ ...style, maxWidth: tagMaxWidth }}
      data-tag={label}
      id={id}
      data-testid={dataTestId ?? "tag_item"}
      aria-label={label}
      aria-disabled={isDisabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {icon ? (
        <ReactSVG className={styles.thirdPartyTag} src={icon} />
      ) : (
        <>
          <Text
            className={classNames(styles.tagText, {
              [styles.isDefault]: isDefault,
            })}
            title={label}
            fontSize="13px"
            noSelect
            truncate
          >
            {label}
          </Text>
          {isNewTag && !!onDelete ? (
            <IconButton
              className={styles.tagIcon}
              iconName={CrossIconReactSvgUrl}
              size={12}
              onClick={onDeleteAction}
            />
          ) : null}
        </>
      )}
    </div>
  );
};

TagPure.displayName = "TagPure";

const Tag = React.memo(TagPure);

export { Tag, TagProps };
