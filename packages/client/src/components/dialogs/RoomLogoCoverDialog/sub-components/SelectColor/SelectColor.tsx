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

import { isMobile } from "@docspace/shared/utils";
import { useClickOutside } from "@docspace/shared/utils";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";
import PencilSvgUrl from "PUBLIC_DIR/images/pencil.outline.react.svg?url";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { ColorPicker } from "@docspace/ui-kit/components/color-picker";
import { SelectColorProps } from "../../RoomLogoCoverDialog.types";

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import styles from "../../RoomLogoCover.module.scss";

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
        {logoColors.map((color, index) =>
          color === selectedColor ? (
            <div
              key={color}
              className={styles.selectedColorItem}
              style={{ "--item-color": color } as React.CSSProperties}
              data-testid={`color_item_selected_${index}`}
            >
              <div className="circle" />
            </div>
          ) : (
            <div
              key={color}
              className={styles.colorItem}
              style={{ "--item-color": color } as React.CSSProperties}
              onClick={() => onChangeColor(color)}
              data-testid={`color_item_${index}`}
            />
          ),
        )}
        {roomColor ? (
          <div
            className={`${styles.customSelectedColor}${isSelectedColorPicker ? ` ${styles.isSelected}` : ""}${pickerColor === globalColors.white ? ` ${styles.whiteBorder}` : ""}`}
            style={
              {
                "--item-color": pickerColor,
                "--item-border-color":
                  pickerColor === globalColors.white
                    ? globalColors.black
                    : pickerColor,
                "--icon-fill":
                  pickerColor === globalColors.white
                    ? globalColors.black
                    : globalColors.white,
              } as React.CSSProperties
            }
            ref={iconRef}
            data-testid="color_item_custom_selected"
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
          </div>
        ) : (
          <div
            className={`${styles.colorItem}${openColorPicker ? ` ${styles.isSelected}` : ""}`}
            ref={iconRef}
            data-testid="color_item_add_custom"
          >
            <IconButton
              className="select-color-plus-icon"
              size={16}
              iconName={PlusSvgUrl}
              onClick={onOpenColorPicker}
              isFill
            />
          </div>
        )}
        {isMobile() ? (
          <ModalDialog
            className={styles.colorPickerModal}
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
          </ModalDialog>
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
