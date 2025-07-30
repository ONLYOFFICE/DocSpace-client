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

import React, { ChangeEvent, MouseEvent, useState } from "react";
import classNames from "classnames";

import PlusIcon from "PUBLIC_DIR/images/payment.plus.react.svg";
import MinusIcon from "PUBLIC_DIR/images/minus.react.svg";

import { Text } from "../text";
import { Slider } from "../slider";
import { TextInput } from "../text-input";
import { InputType } from "../text-input/TextInput.enums";
import { TabItem } from "../tab-item";

import styles from "./quantity-picker.module.scss";

interface TabItemObject {
  name: string;
  value: number;
}

type QuantityPickerProps = {
  value: number;
  minValue: number;
  maxValue: number;
  step: number;
  title?: string;
  subtitle?: string;
  showPlusSign?: boolean;
  isDisabled?: boolean;
  showSlider?: boolean;
  onChange: (value: number) => void;
  className?: string;
  items?: Array<number | TabItemObject>;
  isLarge?: boolean;
  withoutContorls?: boolean;
  disableValue?: string;
  underContorlsTitle?: string | React.ReactNode;
  isZeroAllowed?: boolean;
  enableZero?: boolean;
};

const shouldSetIncrementError = (
  newValue: number,
  enableZero: boolean,
  minValue: number,
): boolean => {
  if (!enableZero) return false;
  if (enableZero && newValue < minValue) return newValue !== 0;

  return false;
};

const QuantityPicker: React.FC<QuantityPickerProps> = ({
  value,
  minValue,
  maxValue,
  step,
  title,
  subtitle,
  showPlusSign,
  isDisabled,
  showSlider,
  onChange,
  className,
  items,
  isLarge,
  withoutContorls,
  disableValue,
  underContorlsTitle,
  enableZero = false,
}) => {
  const displayValue = showPlusSign
    ? value > maxValue
      ? `${maxValue}+`
      : `${value}`
    : `${value}`;

  const [error, setError] = useState(false);

  const containerClass = classNames(styles.container, className);
  const titleClass = classNames(styles.countTitle, {
    [styles.disabled]: isDisabled,
  });

  const titleUnderControlsClass = classNames(styles.underContorlsText, {
    [styles.warningIncrementFromZero]: enableZero ? error : false,
  });

  const inputClass = classNames(styles.countInput, {
    [styles.disabled]: isDisabled,
    [styles.isLarge]: isLarge,
    [styles.isContant]: disableValue,
  });
  const circleClass = classNames(styles.circle, {
    [styles.disabled]: isDisabled,
  });
  const controlButtonClass = classNames(styles.controlButton, {
    [styles.disabled]: isDisabled,
  });

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleButtonClick = (e: MouseEvent<HTMLDivElement>) => {
    const operation = e.currentTarget.dataset.operation as "plus" | "minus";
    let newValue = +value;

    if (operation === "plus") {
      if (value <= maxValue) {
        if (newValue < minValue) {
          newValue = minValue;
          setError(false);
        } else {
          newValue += step;
        }
      }
    }

    if (operation === "minus") {
      if (value > maxValue) {
        newValue = maxValue;
      } else if (newValue - step >= minValue) {
        newValue -= step;
      } else {
        newValue = enableZero ? 0 : minValue;
        setError(false);
      }
    }

    if (newValue !== +value) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    let inputValue = target.value;

    if (!displayValue.includes("+") && value > maxValue) {
      inputValue = inputValue.slice(0, -1);
    }

    const numberValue = +inputValue;

    if (Number.isNaN(numberValue)) return;

    if (!enableZero && numberValue <= minValue) {
      onChange(minValue);
      setError(false);
      return;
    }

    onChange(numberValue);

    setError(shouldSetIncrementError(numberValue, enableZero, minValue));
  };

  const buttonProps = isDisabled ? {} : { onClick: handleButtonClick };
  const sliderProps = isDisabled ? {} : { onChange: handleSliderChange };
  const inputProps = isDisabled ? {} : { onChange: handleInputChange };

  const createTabItems = () => {
    if (!items || !items.length) return [];

    return items.map((item) => {
      if (typeof item === "number") {
        return {
          name: `+${item}`,
          id: item.toString(),
          value: item,
          content: null,
          isDisabled,
        };
      }

      return {
        name: `+${item.name}`,
        id: item.value.toString(),
        value: item.value,
        content: null,
        isDisabled,
      };
    });
  };

  const onSelectTab = (e: React.MouseEvent<HTMLDivElement>) => {
    const itemValue = Number(e.currentTarget.dataset.value);
    if (itemValue === undefined) return;

    onChange(value + itemValue);
    setError(false);
  };

  const tabItems = createTabItems();

  return (
    <div className={containerClass}>
      {title ? (
        <Text fontWeight={600} fontSize="16px" className={titleClass}>
          {title}
        </Text>
      ) : null}

      {subtitle ? (
        <Text
          fontWeight={600}
          fontSize="11px"
          className={classNames(styles.subTitle, {
            [styles.isDisabled]: isDisabled,
          })}
        >
          {subtitle}
        </Text>
      ) : null}

      <div className={styles.countControls}>
        {withoutContorls ? null : (
          <div
            className={`${circleClass} ${styles.minusIcon}`}
            {...buttonProps}
            data-operation="minus"
          >
            <MinusIcon className={controlButtonClass} />
          </div>
        )}

        {isDisabled ? (
          <Text className={inputClass}>{disableValue ?? displayValue}</Text>
        ) : (
          <TextInput
            type={InputType.text}
            isReadOnly={isDisabled}
            withBorder={false}
            className={inputClass}
            value={displayValue}
            style={{ boxShadow: "none" }}
            {...inputProps}
          />
        )}

        {withoutContorls ? null : (
          <div
            className={`${circleClass} ${styles.plusIcon}`}
            {...buttonProps}
            data-operation="plus"
          >
            <PlusIcon className={controlButtonClass} />
          </div>
        )}
      </div>

      <Text className={titleUnderControlsClass}>{underContorlsTitle}</Text>
      {showSlider ? (
        <div className={styles.sliderWrapper}>
          <Slider
            thumbBorderWidth="8px"
            thumbHeight="32px"
            thumbWidth="32px"
            runnableTrackHeight="12px"
            isDisabled={isDisabled}
            min={minValue}
            max={maxValue + 1}
            step={step}
            withPouring
            value={value}
            {...sliderProps}
            className={styles.slider}
          />
          <div className={styles.sliderTrack}>
            <Text className={styles.sliderTrackValueMin}>{minValue}</Text>
            <Text className={styles.sliderTrackValueMax}>{`${maxValue}+`}</Text>
          </div>
        </div>
      ) : null}

      {items && items.length > 0 ? (
        <div className={styles.tabsWrapper}>
          {tabItems.map((item) => {
            return (
              <TabItem
                data-value={item.value}
                key={item.id}
                label={item.name}
                onSelect={onSelectTab}
                allowNoSelection
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default QuantityPicker;
