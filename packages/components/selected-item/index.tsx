import React from "react";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/cross.react.... Remove this comment to see the full error message
import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
import { StyledSelectedItem, StyledLabel } from "./styled-selected-item";
import PropTypes from "prop-types";
import IconButton from "../icon-button";

const SelectedItem = (props: any) => {
  const {
    label,
    onClose,
    isDisabled,
    onClick,
    isInline,
    className,
    id,
    propKey,
    group,
    forwardedRef,
    classNameCloseButton,
  } = props;
  if (!label) return <></>;

  const onCloseClick = (e: any) => {
    !isDisabled && onClose && onClose(propKey, label, group, e);
  };

  const handleOnClick = (e: any) => {
    !isDisabled &&
      onClick &&
      !e.target.classList.contains("selected-tag-removed") &&
      onClick(propKey, label, group, e);
  };

  return (
    <StyledSelectedItem
      onClick={handleOnClick}
      // @ts-expect-error TS(2769): No overload matches this call.
      isInline={isInline}
      className={className}
      isDisabled={isDisabled}
      id={id}
      ref={forwardedRef}
    >
      <StyledLabel
        className="selected-item_label"
        // @ts-expect-error TS(2769): No overload matches this call.
        truncate={true}
        noSelect
        isDisabled={isDisabled}
      >
        {label}
      </StyledLabel>
      <IconButton
        // @ts-expect-error TS(2322): Type '{ className: string; iconName: any; size: nu... Remove this comment to see the full error message
        className={"selected-tag-removed " + classNameCloseButton}
        iconName={CrossReactSvgUrl}
        size={12}
        onClick={onCloseClick}
        isFill
        isDisabled={isDisabled}
      />
    </StyledSelectedItem>
  );
};

SelectedItem.propTypes = {
  /** Selected item text */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** Sets the 'width: fit-content' property */
  isInline: PropTypes.bool,
  /** Sets a callback function that is triggered when the cross icon is clicked */
  onClose: PropTypes.func.isRequired,
  /** Sets a callback function that is triggered when the selected item is clicked */
  onClick: PropTypes.func,
  /** Sets the button to present a disabled state */
  isDisabled: PropTypes.bool,
  /** Accepts class  */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Accepts key to remove item */
  propKey: PropTypes.string,
  /** Accepts group key to remove item */
  group: PropTypes.string,
  /** Passes ref to component */
  forwardedRef: PropTypes.object,
};

SelectedItem.defaultProps = {
  isInline: true,
  isDisabled: false,
};

export default React.memo(SelectedItem);
