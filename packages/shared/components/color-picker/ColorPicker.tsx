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

import { useEffect, useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { useTranslation } from "react-i18next";

import CrossIconSvgUrl from "PUBLIC_DIR/images/icons/16/cross.react.svg?url";

import { Button } from "../button";
import { Text } from "../text";
import { IconButton } from "../icon-button";

import Wrapper from "./ColorPicker.styled";
import { ColorPickerProps } from "./ColorPicker.types";
import { ButtonSize } from "../button/Button.enums";
import { globalColors } from "../../themes";

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
  forwardedRef,
}: ColorPickerProps) => {
  const [color, setColor] = useState(
    appliedColor || globalColors.lightBlueMain,
  );

  const { t } = useTranslation(["Common"]);

  useEffect(() => {
    if (!isPickerOnly && appliedColor && appliedColor !== color) {
      setColor(appliedColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedColor]);

  return (
    <Wrapper
      ref={forwardedRef}
      isPickerOnly={isPickerOnly}
      className={className}
      id={id}
    >
      {isPickerOnly ? (
        <div className="hex-header">
          <div className="hex-text">
            <Text fontSize="16px" lineHeight="22px" fontWeight={700} truncate>
              {t("Custom")}
            </Text>
          </div>
          <div className="hex-close">
            <IconButton
              className="table-header_icon-button"
              size={16}
              onClick={onClose}
              iconName={CrossIconSvgUrl}
              isFill
            />
          </div>
        </div>
      ) : null}

      <div className="hex-color-picker">
        {!isPickerOnly ? (
          <div className="hex-value-container">
            <div className="hex-value-label">{hexCodeLabel}:</div>

            <HexColorInput
              className="hex-value"
              prefixed
              color={color.toUpperCase()}
              onChange={setColor}
            />
          </div>
        ) : null}

        <HexColorPicker
          color={
            isPickerOnly ? appliedColor?.toUpperCase() : color.toUpperCase()
          }
          onChange={isPickerOnly ? handleChange : setColor}
        />

        {!isPickerOnly ? (
          <div className="hex-button">
            <Button
              label={applyButtonLabel}
              size={ButtonSize.small}
              className="apply-button"
              primary
              scale
              onClick={() => onApply(color)}
            />
            <Button
              label={cancelButtonLabel}
              className="cancel-button button"
              size={ButtonSize.small}
              scale
              onClick={onClose}
            />
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
};

export { ColorPicker };
