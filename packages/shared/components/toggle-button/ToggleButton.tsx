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
import { motion } from "framer-motion";

import { Text } from "../text";

import ToggleButtonTheme from "./ToggleButton.theme";
import { ToggleButtonContainer, HiddenInput } from "./ToggleButton.styled";
import { ToggleButtonProps, ToggleIconProps } from "./ToggleButton.types";

const ToggleIcon = ({
  isChecked,
  isLoading,
  noAnimation = false,
}: ToggleIconProps) => {
  const transition = noAnimation ? { duration: 0 } : {};

  return (
    <motion.svg
      animate={[
        isChecked ? "checked" : "notChecked",
        isLoading ? "isLoading" : "",
      ]}
      width="28"
      height="16"
      viewBox="0 0 28 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.rect width="28" height="16" rx="8" />
      <motion.circle
        fill-rule="evenodd"
        clip-rule="evenodd"
        cy="8"
        variants={{
          isLoading: {
            r: [5, 6, 6],
            transition: {
              r: {
                yoyo: Infinity,
                duration: 0.6,
                ease: "easeOut",
              },
            },
          },
          checked: {
            cx: 20,
            r: 6,
            transition,
          },
          notChecked: {
            cx: 8,
            r: 6,
            transition,
          },
        }}
      />
    </motion.svg>
  );
};

const ToggleButton = ({
  label,
  isChecked,
  isDisabled,
  onChange,
  id,
  className,
  style,
  isLoading,
  noAnimation,
  name,
  fontWeight,
  fontSize,
}: ToggleButtonProps) => {
  return (
    <ToggleButtonTheme
      id={id}
      className={className}
      style={style}
      isChecked={isChecked}
      isDisabled={isDisabled}
      data-testid="toggle-button"
    >
      <ToggleButtonContainer
        id={id}
        className={className}
        style={style}
        isDisabled={isDisabled}
        isChecked={isChecked}
      >
        <HiddenInput
          name={name}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={onChange}
        />
        <ToggleIcon
          isChecked={isChecked}
          isLoading={isLoading}
          noAnimation={noAnimation || false}
        />
        {label && (
          <Text
            className="toggle-button-text"
            as="span"
            fontWeight={fontWeight}
            fontSize={fontSize}
          >
            {label}
          </Text>
        )}
      </ToggleButtonContainer>
    </ToggleButtonTheme>
  );
};

export { ToggleButton };
