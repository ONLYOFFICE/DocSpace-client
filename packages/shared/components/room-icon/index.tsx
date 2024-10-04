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

import EditPenSvgUrl from "PUBLIC_DIR/images/icons/12/pen-edit.react.svg?url";
import Camera10ReactSvgUrl from "PUBLIC_DIR/images/icons/10/cover.camera.react.svg?url";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";

import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import { useClickOutside } from "@docspace/shared/utils/useClickOutside";

import { Text } from "../text";

import { IconButton } from "../icon-button";
import { classNames } from "../../utils";

import { getRoomTitle } from "./RoomIcon.utils";
import { StyledIcon, EditWrapper } from "./RoomIcon.styled";

import type { RoomIconProps } from "./RoomIcon.types";

enum EditWrapperSize {
  plus = "20px",
  edit = "24px",
}

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
  currentColorScheme,
  dropDownManualX,
}: RoomIconProps) => {
  const [correctImage, setCorrectImage] = React.useState(true);

  const [openEditLogo, setOpenLogoEdit] = React.useState<boolean>(false);

  const onToggleOpenEditLogo = () => setOpenLogoEdit(!openEditLogo);

  const iconRef = React.useRef<HTMLLIElement>(null);
  const inputFilesElement = React.useRef(null);

  const onInputClick = () => {
    if (inputFilesElement.current) {
      inputFilesElement.current.value = null;
    }
  };

  useClickOutside(iconRef, () => {
    setOpenLogoEdit(false);
  });

  const roomTitle = useMemo(() => getRoomTitle(title ?? ""), [title]);

  const imgSrc = logo?.cover
    ? `data:image/svg+xml;base64, ${window.btoa(logo?.cover?.data)}`
    : logo?.medium
      ? logo.medium
      : logo;

  const dropdownElement = (
    <>
      <DropDown
        manualX={dropDownManualX || "-10px"}
        open={openEditLogo}
        clickOutsideAction={() => setOpenLogoEdit(false)}
        withBackdrop={false}
        isDefaultMode={false}
      >
        {model?.map((option, i) => {
          const optionOnClickAction = () => {
            setOpenLogoEdit(false);
            if (option.key === "upload") {
              return option.onClick(inputFilesElement);
            }
            option.onClick();
          };
          return (
            <DropDownItem
              key={i}
              label={option.label}
              icon={option.icon}
              onClick={optionOnClickAction}
            />
          );
        })}
      </DropDown>
      <input
        id="customFileInput"
        className="custom-file-input"
        type="file"
        onChange={onChangeFile}
        accept="image/png, image/jpeg"
        onClick={onInputClick}
        ref={inputFilesElement}
        style={{ display: "none" }}
      />
    </>
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

  const coverSize = size.replace("px", "") * 0.625;

  return (
    <StyledIcon
      ref={iconRef}
      color={color}
      size={size}
      radius={radius}
      isArchive={isArchive}
      wrongImage={!correctImage && !imgSrc?.color}
      coverSize={coverSize}
      className={className}
      data-testid="room-icon"
      withHover={!!hoverSrc && !isArchive}
      withEditing={withEditing}
      isEmptyIcon={isEmptyIcon}
      onClick={onToggleOpenEditLogo}
    >
      {isEmptyIcon ? (
        <>
          <ReactSVG className="room-icon-empty" src={Camera10ReactSvgUrl} />
          <EditWrapper
            $currentColorScheme={currentColorScheme}
            size={EditWrapperSize.plus}
          >
            <IconButton
              className="open-plus-logo-icon"
              size={12}
              iconName={PlusSvgUrl}
              onClick={onToggleOpenEditLogo}
              isFill
            />
            {dropdownElement}
          </EditWrapper>
        </>
      ) : showDefault || !correctImage ? (
        <>
          <div className="room-background hover-class" />
          <Text className="room-title">{roomTitle}</Text>
        </>
      ) : logo?.cover ? (
        <>
          <div className="room-background hover-class" />
          <ReactSVG className="room-icon-cover" src={imgSrc} />
        </>
      ) : (
        <img
          className={classNames([
            imgClassName,
            "hover-class",
            "not-selectable",
          ])}
          src={imgSrc}
          alt="room icon"
        />
      )}

      {hoverSrc && !isArchive && (
        <div className="room-icon-container" onClick={onToggleOpenEditLogo}>
          <img className="room-icon_hover" src={hoverSrc} alt="room icon" />
          {dropdownElement}
        </div>
      )}

      {badgeUrl && (
        <div className="room-icon_badge">
          <IconButton
            onClick={onBadgeClick}
            iconName={badgeUrl}
            size={12}
            className="room-icon-button"
            isFill
          />
        </div>
      )}

      {withEditing && !isArchive && (
        <EditWrapper size={EditWrapperSize.edit}>
          <IconButton
            className="open-edit-logo-icon"
            size={12}
            iconName={EditPenSvgUrl}
            onClick={onToggleOpenEditLogo}
            isFill
          />
          {dropdownElement}
        </EditWrapper>
      )}
    </StyledIcon>
  );
};

export { RoomIcon };
