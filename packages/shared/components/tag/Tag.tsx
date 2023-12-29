import React from "react";
import { ReactSVG } from "react-svg";

import CrossIconReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
import TagIconReactSvgUrl from "PUBLIC_DIR/images/tag.react.svg?url";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { IconButton } from "../icon-button";
import { Text } from "../text";

import {
  StyledTag,
  StyledDropdownIcon,
  StyledDropdownText,
} from "./Tag.styled";
import { TagProps } from "./Tag.types";

export const TagPure = ({
  tag,
  label,
  isNewTag,
  isDisabled,
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
}: TagProps) => {
  const [openDropdown, setOpenDropdown] = React.useState(false);

  const tagRef = React.useRef<HTMLDivElement | null>(null);
  const isMountedRef = React.useRef(true);

  const onClickOutside = React.useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.className?.includes("advanced-tag") || !isMountedRef.current)
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
      if (onClick && !isDisabled) {
        const target = e.target as HTMLDivElement;
        onClick(target.dataset.tag);
      }
    },
    [onClick, isDisabled],
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
            data-tag={tag}
          >
            <StyledDropdownIcon
              className="tag__dropdown-item-icon"
              src={TagIconReactSvgUrl}
            />
            <StyledDropdownText
              className="tag__dropdown-item-text"
              fontWeight={600}
              fontSize="12px"
              truncate
            >
              {tag}
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
          {isNewTag && (
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
