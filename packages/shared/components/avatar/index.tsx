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

import React, { memo } from "react";
import classNames from "classnames";

import AvatarBaseReactSvgUrl from "PUBLIC_DIR/images/avatar.base.react.svg?url";
import AvatarDarkReactSvgUrl from "PUBLIC_DIR/images/avatar.dark.react.svg?url";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";

import { IconSizeType } from "../../utils";
import { useClickOutside } from "../../utils/useClickOutside";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";
import { useTheme } from "../../hooks/useTheme";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";

import { IconButton } from "../icon-button";
import { Text } from "../text";
import { TGetTooltipContent, Tooltip } from "../tooltip";

import styles from "./Avatar.module.scss";

import { AvatarProps } from "./Avatar.types";
import { AvatarRole, AvatarSize } from "./Avatar.enums";
import { getRoleIcon, Initials, EmptyIcon } from "./Avatar.utils";

const AvatarPure = ({
  size,
  source,
  userName,
  role,
  editing,
  isDefaultSource = false,
  hideRoleIcon,
  tooltipContent,
  withTooltip,
  className,
  onClick,
  isGroup = false,
  roleIcon: roleIconProp,
  onChangeFile,
  model,
  hasAvatar,
  noClick = false,
  isNotIcon = false,
  imgClassName = "",
}: AvatarProps) => {
  const { isRTL } = useInterfaceDirection();
  const { isBase } = useTheme();

  const iconRef = React.useRef<HTMLDivElement>(null);
  const inputFilesElement = React.useRef<HTMLInputElement>(null);

  const [openEditLogo, setOpenLogoEdit] = React.useState<boolean>(false);

  const onToggleOpenEditLogo = () => setOpenLogoEdit(!openEditLogo);

  useClickOutside(iconRef, () => {
    setOpenLogoEdit(false);
  });

  const onInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.value = "";
  };

  let isDefault = false;
  let isIcon = false;

  if (source?.includes("default_user_photo")) isDefault = true;
  else if (source?.includes(".svg")) isIcon = true;

  const avatarContent = source ? (
    isIcon && !isNotIcon ? (
      <div className={styles.iconWrapper}>
        <IconButton iconName={source} className="icon" isDisabled />
      </div>
    ) : (
      <img
        src={source}
        className={`${styles.image}${imgClassName ? ` ${imgClassName}` : ""}`}
        data-is-default={isDefault}
        alt=""
        style={
          {
            "--avatar-default-image": `url(${isBase ? AvatarBaseReactSvgUrl : AvatarDarkReactSvgUrl})`,
          } as React.CSSProperties
        }
      />
    )
  ) : userName ? (
    <Initials userName={userName} size={size} isGroup={isGroup} />
  ) : isDefaultSource ? (
    <img
      className={styles.image}
      data-is-default="true"
      alt=""
      style={
        {
          "--avatar-default-image": `url(${isBase ? AvatarBaseReactSvgUrl : AvatarDarkReactSvgUrl})`,
        } as React.CSSProperties
      }
    />
  ) : (
    <EmptyIcon size={IconSizeType.scale} />
  );

  const roleIcon = roleIconProp ?? getRoleIcon(role);

  const uniqueTooltipId = withTooltip ? `roleTooltip_${Math.random()}` : "";
  const tooltipPlace = isRTL ? "left" : "right";

  const getTooltipContent = ({ content }: TGetTooltipContent) => (
    <Text fontSize="12px">{content}</Text>
  );

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1) return;

    if (onClick) onClick(e);
  };

  const onUploadClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!onChangeFile) return;
    if (!model) return;
    const menu = model[0];
    menu.onClick(inputFilesElement);
  };

  const onClickAvatar = (e: React.MouseEvent) => {
    if (!onChangeFile) return;

    e.stopPropagation();
    e.preventDefault();
    if (noClick) return;

    if (hasAvatar) {
      return onToggleOpenEditLogo();
    }

    onUploadClick();
  };

  const dropdownElement = (
    <DropDown
      open={openEditLogo}
      clickOutsideAction={() => setOpenLogoEdit(false)}
      withBackdrop={false}
      isDefaultMode={false}
    >
      {model?.map((option) => {
        const optionOnClickAction = () => {
          setOpenLogoEdit(false);

          if (option.key === "upload") {
            return option.onClick(inputFilesElement);
          }

          option.onClick();
        };

        return (
          <DropDownItem
            key={option.key}
            label={option.label}
            icon={option.icon}
            onClick={optionOnClickAction}
          />
        );
      })}
    </DropDown>
  );

  return (
    <>
      <div
        className={classNames(styles.avatar, className)}
        data-size={size}
        data-no-click={noClick ? "true" : "false"}
        onMouseDown={onMouseDown}
        onClick={onClick || onClickAvatar}
        ref={iconRef}
        data-testid="avatar"
      >
        <div
          className={classNames(styles.avatarWrapper, className)}
          data-has-source={!!source}
          data-has-username={!!userName}
          data-is-group={isGroup}
        >
          {avatarContent}
        </div>
        {editing && size === "max" ? (
          <div className={classNames(styles.editContainer)}>
            {hasAvatar ? (
              <>
                <IconButton
                  className="edit_icon"
                  iconName={PencilReactSvgUrl}
                  onClick={onToggleOpenEditLogo}
                  size={16}
                />
                {dropdownElement}{" "}
              </>
            ) : (
              <IconButton
                className="edit_icon"
                iconName={PlusSvgUrl}
                onClick={onUploadClick}
                size={16}
              />
            )}
          </div>
        ) : (
          roleIcon &&
          !hideRoleIcon && (
            <div
              className={classNames(styles.roleWrapper, "avatar_role-wrapper")}
              data-size={size}
              data-tooltip-id={uniqueTooltipId}
              data-tooltip-content={tooltipContent}
            >
              {roleIcon}
            </div>
          )
        )}
        {withTooltip ? (
          <Tooltip
            float
            id={uniqueTooltipId}
            getContent={getTooltipContent}
            place={tooltipPlace}
            opacity={1}
          />
        ) : null}
      </div>
      {onChangeFile ? (
        <input
          id="customAvatarInput"
          className="custom-file-input"
          type="file"
          onChange={onChangeFile}
          accept="image/png, image/jpeg"
          onClick={onInputClick}
          ref={inputFilesElement}
          style={{ display: "none" }}
          data-testid="file-input"
        />
      ) : null}
    </>
  );
};

const Avatar = memo(AvatarPure);

export { Avatar, AvatarPure, AvatarRole, AvatarSize };
