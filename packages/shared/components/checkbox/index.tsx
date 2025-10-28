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

import React, { ChangeEvent } from "react";
import classNames from "classnames";

import CheckboxIndeterminateIcon from "PUBLIC_DIR/images/checkbox.indeterminate.react.svg";
import CheckboxCheckedIcon from "PUBLIC_DIR/images/checkbox.checked.react.svg";
import CheckboxIcon from "PUBLIC_DIR/images/checkbox.react.svg";

import { TextWithTooltip as Text } from "../text";
import { LabelWithTooltip } from "../tooltip";

import { CheckboxProps } from "./Checkbox.types";
import styles from "./Checkbox.module.scss";

const RenderCheckboxIcon = ({
  isChecked,
  isIndeterminate,
  tabIndex,
}: {
  isChecked: boolean;
  isIndeterminate: boolean;
  tabIndex: number;
}) => {
  return isIndeterminate ? (
    <CheckboxIndeterminateIcon
      tabIndex={tabIndex}
      className={classNames(styles.checkbox, "not-selectable")}
    />
  ) : isChecked ? (
    <CheckboxCheckedIcon
      tabIndex={tabIndex}
      className={classNames(styles.checkbox, "not-selectable")}
    />
  ) : (
    <CheckboxIcon
      tabIndex={tabIndex}
      className={classNames(styles.checkbox, "not-selectable")}
    />
  );
};

const CheckboxPure = ({
  id,
  className,
  style,
  label,
  value,
  title,
  truncate = false,
  hasError = false,
  onChange,
  isChecked = false,
  isIndeterminate = false,
  isDisabled,
  name,
  tabIndex = -1,
  helpButton,
  dataTestId,
  ...rest
}: CheckboxProps) => {
  const [checked, setChecked] = React.useState(isChecked);
  const ref = React.useRef<HTMLInputElement | null>(null);
  const prevProps = React.useRef({
    indeterminate: false,
    prevChecked: isChecked,
  });

  React.useEffect(() => {
    if (prevProps.current.indeterminate !== isIndeterminate && ref.current) {
      prevProps.current.indeterminate = isIndeterminate || false;
      ref.current.indeterminate = isIndeterminate || false;
    }
    if (prevProps.current.prevChecked !== isChecked) {
      setChecked(isChecked);

      prevProps.current.prevChecked = isChecked;
    }
  }, [isIndeterminate, isChecked, checked]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) e.preventDefault();
    e.stopPropagation();

    setChecked(e.target.checked);
    onChange?.(e);
  };

  const onClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    return e.preventDefault();
  };

  return (
    <LabelWithTooltip
      id={id}
      style={style}
      className={classNames(styles.label, className, {
        [styles.disabled]: isDisabled,
        [styles.indeterminate]: isIndeterminate,
        [styles.error]: hasError,
      })}
      title={title}
      data-testid={dataTestId ?? "checkbox"}
    >
      <input
        className={styles.hiddenInput}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={isDisabled}
        ref={ref}
        value={value}
        onChange={onInputChange}
        tabIndex={-1}
        {...rest}
      />
      <RenderCheckboxIcon
        tabIndex={tabIndex || 0}
        isChecked={checked || false}
        isIndeterminate={isIndeterminate || false}
      />
      <div className={`${styles.wrapper} wrapper`}>
        {label ? (
          <Text
            as="span"
            title={title}
            truncate={truncate}
            className={`${styles.checkboxText} checkbox-text`}
            lineHeight="16px"
          >
            {label}
          </Text>
        ) : null}
        {helpButton ? (
          <span
            className={`${styles.helpButton} help-button`}
            onClick={onClick}
            data-testid="checkbox-help-button"
          >
            {helpButton}
          </span>
        ) : null}
      </div>
    </LabelWithTooltip>
  );
};

CheckboxPure.displayName = "CheckboxPure";

const Checkbox = React.memo(CheckboxPure);

export { Checkbox };
