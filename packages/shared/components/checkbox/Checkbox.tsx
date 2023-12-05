import React, { ChangeEvent } from "react";

import CheckboxIndeterminateIcon from "PUBLIC_DIR/images/checkbox.indeterminate.react.svg";
import CheckboxCheckedIcon from "PUBLIC_DIR/images/checkbox.checked.react.svg";
import CheckboxIcon from "PUBLIC_DIR/images/checkbox.react.svg";

import { Text } from "../text";

import { StyledLabel, HiddenInput } from "./Checkbox.styled";
import { CheckboxProps } from "./Checkbox.types";

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
      className="checkbox not-selectable"
    />
  ) : isChecked ? (
    <CheckboxCheckedIcon
      tabIndex={tabIndex}
      className="checkbox not-selectable"
    />
  ) : (
    <CheckboxIcon tabIndex={tabIndex} className="checkbox not-selectable" />
  );
};

const CheckboxPure = ({
  id,
  className,
  style,
  label,
  value,
  title,
  truncate,
  hasError,
  onChange,
  isChecked,
  isIndeterminate,
  isDisabled,
  name,
  tabIndex,
  helpButton,
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
    onChange?.();
  };

  const onClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    return e.preventDefault();
  };

  return (
    <StyledLabel
      id={id}
      style={style}
      isDisabled={isDisabled || false}
      isIndeterminate={isIndeterminate || false}
      className={className}
      title={title}
      hasError={hasError || false}
      data-testid="checkbox"
    >
      <HiddenInput
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
      <div className="wrapper">
        {label && (
          <Text
            as="span"
            title={title}
            truncate={truncate}
            className="checkbox-text"
          >
            {label}
          </Text>
        )}
        {helpButton && (
          <span className="help-button" onClick={onClick}>
            {helpButton}
          </span>
        )}
      </div>
    </StyledLabel>
  );
};

CheckboxPure.defaultProps = {
  isChecked: false,
  truncate: false,
  tabIndex: -1,
  hasError: false,
};
CheckboxPure.displayName = "CheckboxPure";

const Checkbox = React.memo(CheckboxPure);

export { Checkbox, CheckboxPure };
