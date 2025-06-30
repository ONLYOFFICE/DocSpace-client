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

import { isMobile } from "@docspace/shared/utils";
import { useClickOutside } from "@docspace/shared/utils/useClickOutside";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { IconButton } from "@docspace/shared/components/icon-button";

import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";
import PencilSvgUrl from "PUBLIC_DIR/images/pencil.outline.react.svg?url";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { DropDown } from "@docspace/shared/components/drop-down";
import { ColorPicker } from "@docspace/shared/components/color-picker";
import { SelectColorProps } from "../../RoomLogoCoverDialog.types";

import {
  StyledModalDialog,
  StyledColorItem,
  SelectedColorItem,
  CustomSelectedColor,
} from "./SelectColor.styled";

export const SelectColor = ({
  logoColors,
  selectedColor,
  t,
  onChangeColor,
  roomColor,
  openColorPicker,
  setOpenColorPicker,
}: SelectColorProps) => {
  const isDefaultColor = logoColors.includes(roomColor!);
  const [pickerColor, setPickerColor] = useState<string | null>(
    isDefaultColor ? "" : roomColor || "",
  );

  React.useEffect(() => {
    setPickerColor(roomColor);
  }, [roomColor]);

  const iconRef = useRef(null);

  const pickerRef = useRef(null);

  useClickOutside(pickerRef, () => {
    setOpenColorPicker(false);
  });

  const onApply = (color: string) => {
    setPickerColor(color);
    onChangeColor(color);
  };

  const onOpenColorPicker = () => {
    if (pickerColor && pickerColor !== selectedColor) {
      return onChangeColor(pickerColor);
    }
    setOpenColorPicker(true);
  };

  const isSelectedColorPicker = pickerColor === selectedColor;

  return (
    <div className="select-color-container">
      <div className="color-name">{t("Common:Color")}</div>
      <div className="colors-container">
        {logoColors.map((color) =>
          color === selectedColor ? (
            <SelectedColorItem key={color} color={color}>
              <div className="circle" color={color} />
            </SelectedColorItem>
          ) : (
            <StyledColorItem
              key={color}
              color={color}
              onClick={() => onChangeColor(color)}
            />
          ),
        )}
        {roomColor ? (
          <CustomSelectedColor
            isSelected={isSelectedColorPicker}
            color={pickerColor!}
            ref={iconRef}
          >
            {isSelectedColorPicker ? (
              <div className="color-picker-circle">
                <IconButton
                  className="select-color-plus-icon"
                  size={12}
                  iconName={PencilSvgUrl}
                  onClick={onOpenColorPicker}
                  isFill
                />
              </div>
            ) : (
              <IconButton
                className="select-color-plus-icon"
                size={12}
                iconName={PencilSvgUrl}
                onClick={onOpenColorPicker}
                isFill
              />
            )}
          </CustomSelectedColor>
        ) : (
          <StyledColorItem
            isEmptyColor
            isSelected={openColorPicker}
            ref={iconRef}
          >
            <IconButton
              className="select-color-plus-icon"
              size={16}
              iconName={PlusSvgUrl}
              onClick={onOpenColorPicker}
              isFill
            />
          </StyledColorItem>
        )}
        {isMobile() ? (
          <StyledModalDialog
            displayType={ModalDialogType.modal}
            visible={openColorPicker}
            onClose={() => setOpenColorPicker(false)}
            blur={8}
          >
            <ModalDialog.Body>
              <ColorPicker
                id="buttons-hex"
                onClose={() => setOpenColorPicker(false)}
                onApply={onApply}
                isPickerOnly
                handleChange={onApply}
                appliedColor={selectedColor!}
                applyButtonLabel={t("Common:ApplyButton")}
                cancelButtonLabel={t("Common:CancelButton")}
              />
            </ModalDialog.Body>
          </StyledModalDialog>
        ) : (
          <DropDown
            directionY="both"
            topSpace={16}
            forwardedRef={iconRef}
            withBackdrop={false}
            isDefaultMode
            open={openColorPicker}
            clickOutsideAction={() => setOpenColorPicker(false)}
          >
            <div ref={pickerRef}>
              <DropDownItem className="drop-down-item-hex" noHover noActive>
                <ColorPicker
                  id="accent-hex"
                  onClose={() => setOpenColorPicker(false)}
                  onApply={onApply}
                  isPickerOnly
                  handleChange={onApply}
                  appliedColor={selectedColor!}
                  applyButtonLabel={t("Common:ApplyButton")}
                  cancelButtonLabel={t("Common:CancelButton")}
                />
              </DropDownItem>
            </div>
          </DropDown>
        )}
      </div>
    </div>
  );
};
