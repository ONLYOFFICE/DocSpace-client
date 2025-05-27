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
import PropTypes from "prop-types";
import classNames from "classnames";

import PlusIcon from "PUBLIC_DIR/images/payment.plus.react.svg";
import MinusIcon from "PUBLIC_DIR/images/minus.react.svg";

import { Text } from "../text";
import { Slider } from "../slider";
import { TextInput } from "../text-input";

import styles from "./select-count-container.module.scss";

const SelectCountContainer = ({
  count,
  minValue,
  maxValue,
  step,
  title,
  subTitle,
  isNeedPlusSign,
  isDisabled,
  isSlider,
  onChangeNumber,
  className,
}) => {
  const displayValue = isNeedPlusSign
    ? count > maxValue
      ? `${maxValue}+`
      : `${count}`
    : `${count}`;

  const containerClass = classNames(styles.container, className);
  const titleClass = classNames(styles.countTitle, {
    [styles.disabled]: isDisabled,
  });

  const inputClass = classNames(styles.countInput, {
    [styles.disabled]: isDisabled,
  });
  const circleClass = classNames(styles.circle, {
    [styles.disabled]: isDisabled,
  });
  const controlButtonClass = classNames(styles.controlButton, {
    [styles.disabled]: isDisabled,
  });

  const onSlider = (e) => {
    const value = parseFloat(e.target.value);

    onChangeNumber(value);
  };

  const onClickOperations = (e) => {
    const operation = e.currentTarget.dataset.operation;

    let value = +count;

    if (operation === "plus") {
      if (count <= maxValue) {
        value += step;
      }
    }

    if (operation === "minus") {
      if (count > maxValue) {
        value = maxValue;
      } else if (count > minValue) {
        value -= step;
      }
    }

    if (value !== +count) {
      onChangeNumber(value);
    }
  };

  const onTextInput = (e) => {
    const { target } = e;
    let value = target.value;

    if (count > maxValue) {
      value = value.slice(0, -1);
    }

    const numberValue = +value;

    if (Number.isNaN(numberValue)) return;

    if (numberValue <= minValue) {
      onChangeNumber(minValue);
      return;
    }

    onChangeNumber(numberValue);
  };

  const onClickProp = isDisabled ? {} : { onClick: onClickOperations };
  const onChangeSlideProp = isDisabled ? {} : { onChange: onSlider };
  const onchangeNumberProp = isDisabled ? {} : { onChange: onTextInput };

  return (
    <div className={containerClass}>
      {title ? (
        <Text noSelect fontWeight={600} className={titleClass}>
          {title}
        </Text>
      ) : null}

      {subTitle ? (
        <Text
          noSelect
          fontWeight={600}
          fontSize="11px"
          className={classNames(styles.subTitle, {
            [styles.disabled]: isDisabled,
          })}
        >
          {subTitle}
        </Text>
      ) : null}

      <div className={styles.countControls}>
        <div
          className={`${circleClass} ${styles.minusIcon}`}
          {...onClickProp}
          data-operation="minus"
        >
          <MinusIcon className={controlButtonClass} />
        </div>

        {isDisabled ? (
          <Text className={inputClass}>{displayValue}</Text>
        ) : (
          <TextInput
            isReadOnly={isDisabled}
            withBorder={false}
            className={inputClass}
            value={displayValue}
            {...onchangeNumberProp}
          />
        )}

        <div
          className={`${circleClass} ${styles.plusIcon}`}
          {...onClickProp}
          data-operation="plus"
        >
          <PlusIcon className={controlButtonClass} />
        </div>
      </div>

      {isSlider ? (
        <div className={styles.sliderWrapper}>
          <Slider
            thumbBorderWidth="8px"
            thumbHeight="32px"
            thumbWidth="32px"
            runnableTrackHeight="12px"
            isDisabled={isDisabled}
            isReadOnly={isDisabled}
            type="range"
            min={minValue.toString()}
            max={(maxValue + 1).toString()}
            step={step}
            withPouring
            value={count}
            {...onChangeSlideProp}
            className={styles.slider}
          />
          <div className={styles.sliderTrack}>
            <Text className={styles.sliderTrackValueMin} noSelect>
              {minValue}
            </Text>
            <Text className={styles.sliderTrackValueMax} noSelect>
              {`${maxValue}+`}
            </Text>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SelectCountContainer;
