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
import classNames from "classnames";
import { motion, useAnimation } from "framer-motion";

import { Text } from "../text";

import type { ToggleButtonProps, ToggleIconProps } from "./ToggleButton.types";
import styles from "./ToggleButton.module.scss";

enum ToggleControls {
  loading = "isLoading",
  checked = "checked",
  unchecked = "notChecked",
}

const ToggleIcon = ({
  isChecked,
  isLoading,
  noAnimation = false,
}: ToggleIconProps) => {
  const controls = useAnimation();

  const transition = noAnimation ? { duration: 0 } : {};

  React.useEffect(() => {
    if (isLoading) {
      controls.start(ToggleControls.loading);
    } else if (isChecked) {
      controls.start(ToggleControls.checked);
    } else {
      controls.start(ToggleControls.unchecked);
    }
  }, [isLoading, isChecked, controls]);

  return (
    <motion.svg
      data-testid="toggle-button-icon"
      width="28"
      height="16"
      viewBox="0 0 28 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.rect width="28" height="16" rx="8" />
      <motion.circle
        cy="8"
        variants={{
          notChecked: { cx: 8, r: 6 },
          checked: { cx: 20, r: 6 },
          isLoading: { r: [5, 6, 6] },
        }}
        initial={isChecked ? ToggleControls.checked : ToggleControls.unchecked}
        transition={{
          r: {
            ...transition,
            repeat: Infinity,
            repeatType: "reverse",
            duration: 0.6,
            ease: "easeOut",
          },
          cx: transition,
        }}
        animate={controls}
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
  dataTestId,
}: ToggleButtonProps) => {
  return (
    <div
      id={id}
      className={classNames(styles.container, className)}
      style={style}
      data-testid={dataTestId ?? "toggle-button"}
    >
      <label
        id={id}
        className={classNames(styles.label, className, {
          [styles.disabled]: isDisabled,
          [styles.checked]: isChecked,
        })}
        style={style}
        data-testid="toggle-button-container"
      >
        <input
          className={styles.hiddenInput}
          name={name}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={onChange}
          data-testid="toggle-button-input"
        />
        <ToggleIcon
          isChecked={isChecked}
          isLoading={isLoading}
          noAnimation={noAnimation || false}
        />
        {label ? (
          <Text
            className={styles.toggleButtonText}
            as="span"
            fontWeight={fontWeight}
            fontSize={fontSize}
            data-testid="toggle-button-label"
          >
            {label}
          </Text>
        ) : null}
      </label>
    </div>
  );
};

export { ToggleButton };
