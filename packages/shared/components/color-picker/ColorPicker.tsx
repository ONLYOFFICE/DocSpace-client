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

import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import CrossIconSvgUrl from "PUBLIC_DIR/images/icons/16/cross.react.svg?url";

import { Button, ButtonSize } from "../button";
import { Text } from "../text";
import { IconButton } from "../icon-button";
import { globalColors } from "../../themes";

import styles from "./ColorPicker.module.scss";
import { ColorPickerProps } from "./ColorPicker.types";

const ColorPicker = ({
  className,
  id,
  onClose = () => {},
  onApply = () => {},
  appliedColor = globalColors.lightBlueMain,
  applyButtonLabel = "Apply",
  cancelButtonLabel = "Cancel",
  isPickerOnly = false,
  handleChange,
  hexCodeLabel = "Hex code",
}: ColorPickerProps) => {
  const [color, setColor] = useState(() => appliedColor);
  const { t } = useTranslation(["Common"]);

  // useEffect(() => {
  //   setColor(appliedColor);
  // }, [appliedColor]);

  const onColorChange = (newColor: string) => {
    setColor(newColor);
    if (handleChange) handleChange(newColor);
  };

  return (
    <div
      className={classNames(styles.wrapper, className)}
      id={id}
      data-testid="color-picker"
      role="dialog"
      aria-label="Color picker"
    >
      {isPickerOnly ? (
        <div className={styles.hexHeader}>
          <div className={styles.hexText}>
            <Text
              fontSize="16px"
              lineHeight="22px"
              fontWeight={700}
              truncate
              data-testid="color-picker-title"
            >
              {t("Custom")}
            </Text>
          </div>
          <div className={styles.hexClose}>
            <IconButton
              className={styles.tableHeaderIconButton}
              size={16}
              onClick={onClose}
              iconName={CrossIconSvgUrl}
              isFill
              data-testid="color-picker-close"
              aria-label="Close color picker"
            />
          </div>
        </div>
      ) : null}

      <div className={styles.hexColorPicker} data-testid="color-picker-content">
        <HexColorPicker
          color={color}
          onChange={onColorChange}
          aria-label="Color selector"
        />

        {!isPickerOnly ? (
          <div
            className={styles.hexValueContainer}
            data-testid="color-picker-hex-container"
          >
            <Text
              className={styles.hexValueLabel}
              data-testid="color-picker-hex-label"
            >
              {hexCodeLabel}:
            </Text>
            <HexColorInput
              prefixed
              color={color}
              onChange={onColorChange}
              className={styles.hexValue}
              data-testid="color-picker-hex-input"
              aria-label="Hex color value"
              spellCheck="false"
            />
          </div>
        ) : null}

        {!isPickerOnly ? (
          <div className={styles.hexButton} data-testid="color-picker-buttons">
            <Button
              className={styles.applyButton}
              primary
              scale
              size={ButtonSize.small}
              label={applyButtonLabel}
              onClick={() => onApply(color)}
              testId="color-picker-apply"
              aria-label={applyButtonLabel}
            />
            <Button
              className={styles.cancelButton}
              scale
              size={ButtonSize.small}
              label={cancelButtonLabel}
              onClick={onClose}
              testId="color-picker-cancel"
              aria-label={cancelButtonLabel}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export { ColorPicker };
