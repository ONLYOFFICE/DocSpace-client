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

import React, { useMemo } from "react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import { useTheme } from "styled-components";

import EditPenSvgUrl from "PUBLIC_DIR/images/icons/12/pen-edit.react.svg?url";
import Camera10ReactSvgUrl from "PUBLIC_DIR/images/icons/10/cover.camera.react.svg?url";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";

import { useClickOutside } from "../../utils/useClickOutside";
import { getTextColor } from "../../utils";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";
import { globalColors } from "../../themes/globalColors";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { Text } from "../text";
import { IconButton } from "../icon-button";

import { getRoomTitle } from "./RoomIcon.utils";
import styles from "./RoomIcon.module.scss";
import type { RoomIconProps } from "./RoomIcon.types";

const RoomIcon = ({
  title,
  isArchive = false,
  color,
  size = "32px",
  radius = "6px",
  showDefault,
  imgClassName,
  logo,
  badgeUrl,
  onBadgeClick,
  className,
  withEditing,
  hoverSrc,
  model,
  onChangeFile,
  isEmptyIcon,
  dropDownManualX,
}: RoomIconProps) => {
  const [correctImage, setCorrectImage] = React.useState(true);
  const [openEditLogo, setOpenLogoEdit] = React.useState(false);

  const onToggleOpenEditLogo = () => setOpenLogoEdit(!openEditLogo);

  const iconRef = React.useRef<HTMLDivElement>(null);
  const inputFilesElement = React.useRef<HTMLInputElement>(null);

  const theme = useTheme();

  const onInputClick = () => {
    if (inputFilesElement.current) {
      inputFilesElement.current.value = "";
    }
  };

  useClickOutside(iconRef, () => {
    setOpenLogoEdit(false);
  });

  const { isRTL } = useInterfaceDirection();

  const roomTitle = useMemo(() => getRoomTitle(title ?? ""), [title]);

  const imgSrc = logo?.cover
    ? `data:image/svg+xml;base64, ${window.btoa(logo?.cover?.data)}`
    : logo?.medium
      ? logo.medium
      : logo;

  const dropdownElement = (
    <DropDown
      manualX={dropDownManualX || "-10px"}
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

  const prefetchImage = React.useCallback(() => {
    if (!imgSrc || typeof imgSrc !== "string") return;
    setCorrectImage(true);
    const img = new Image();

    img.src = imgSrc;

    img.onerror = () => {
      setCorrectImage(false);
    };
  }, [imgSrc]);

  React.useEffect(() => {
    prefetchImage();
  }, [prefetchImage]);

  const isBigSize = size === "96px";

  const coverSize = +size.replace("px", "") * 0.625;
  const textColor = color && getTextColor(`#${color}`, 202);

  const isWrongImage =
    !correctImage && typeof imgSrc !== "string" && !imgSrc?.color;

  return (
    <>
      <div
        ref={iconRef}
        className={classNames(
          {
            [styles.withHover]: !!hoverSrc && !isArchive,
            [styles.withEditing]: withEditing,
            [styles.isEmptyIcon]: isEmptyIcon,
            [styles.isArchive]: isArchive,
            [styles.wrongImage]: isWrongImage,
          },
          className,
          styles.roomIcon,
        )}
        style={
          {
            "--room-icon-size": size,
            "--room-icon-radius": radius,
            "--room-icon-color": `#${color}`,
            "--room-icon-text-color": textColor,
            "--room-icon-cover-size": coverSize / 20,
          } as React.CSSProperties
        }
        data-testid="room-icon"
        data-is-archive={isArchive}
        data-has-editing={withEditing}
        data-is-empty={isEmptyIcon}
        onClick={onToggleOpenEditLogo}
      >
        {isEmptyIcon ? (
          <>
            <ReactSVG
              className="room-icon-empty"
              src={Camera10ReactSvgUrl}
              data-testid="empty-icon"
            />
            <div
              className={classNames(styles.editWrapper, styles.size20, {
                [styles.rtl]: isRTL,
              })}
            >
              <IconButton
                className="open-plus-logo-icon"
                size={12}
                iconName={PlusSvgUrl}
                onClick={onToggleOpenEditLogo}
                isFill
              />
              {dropdownElement}
            </div>
          </>
        ) : showDefault || !correctImage ? (
          <>
            <div className="room-background hover-class" />
            <Text
              className={classNames("room-title", styles.roomTitle)}
              noSelect
              data-testid="room-title"
              style={
                {
                  "--room-icon-text-color":
                    theme.isBase && isWrongImage
                      ? globalColors.black
                      : !theme.isBase && !isArchive
                        ? `#${color}`
                        : textColor,
                } as React.CSSProperties
              }
            >
              {roomTitle}
            </Text>
          </>
        ) : logo?.cover && typeof imgSrc === "string" && imgSrc ? (
          <>
            <div className="room-background hover-class" />
            <ReactSVG
              className={classNames("room-icon-cover", styles.roomIconCover)}
              style={
                {
                  "--room-icon-color": theme.isBase ? textColor : `#${color}`,
                } as React.CSSProperties
              }
              src={imgSrc}
              data-testid="room-icon-cover"
            />
          </>
        ) : (
          <img
            className={classNames([
              imgClassName,
              "hover-class",
              "not-selectable",
            ])}
            src={imgSrc as string}
            alt="room icon"
            data-testid="room-icon-image"
          />
        )}

        {hoverSrc && !isArchive && (
          <div
            className={styles.roomIconContainer}
            onClick={onToggleOpenEditLogo}
            data-testid="hover-container"
          >
            <img
              className={styles.roomIconHover}
              src={hoverSrc}
              alt="room icon hover"
              data-testid="hover-image"
            />
            {dropdownElement}
          </div>
        )}

        {badgeUrl && !withEditing && (
          <div
            className={classNames(styles.roomIconBadge, {
              [styles.isBig]: isBigSize,
            })}
            data-testid="badge-container"
          >
            <IconButton
              onClick={onBadgeClick}
              iconName={badgeUrl}
              size={isBigSize ? 28 : 12}
              className={classNames(
                styles.roomIconButton,
                {
                  [styles.isBig]: isBigSize,
                },
                "room-icon_button",
              )}
              isFill
            />
          </div>
        )}

        {withEditing && !isArchive && (
          <div
            className={classNames(styles.editWrapper, styles.size20, {
              [styles.rtl]: isRTL,
            })}
          >
            <IconButton
              className="open-edit-logo-icon"
              size={12}
              iconName={EditPenSvgUrl}
              onClick={onToggleOpenEditLogo}
              isFill
            />
            {dropdownElement}
          </div>
        )}
      </div>
      {onChangeFile && (
        <input
          id="customFileInput"
          data-testid="customFileInput"
          className="custom-file-input"
          type="file"
          onChange={onChangeFile}
          accept="image/png, image/jpeg"
          onClick={onInputClick}
          ref={inputFilesElement}
          style={{ display: "none" }}
        />
      )}
    </>
  );
};

export { RoomIcon };
