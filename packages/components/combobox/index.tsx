import PropTypes from "prop-types";
import React from "react";
import equal from "fast-deep-equal/react";

import ComboButton from "./sub-components/combo-button";

import DropDown from "../drop-down";
import DropDownItem from "../drop-down-item";
import StyledComboBox from "./styled-combobox";

class ComboBox extends React.Component {
  ref: any;
  constructor(props: any) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      isOpen: props.opened,
      selectedOption: props.selectedOption,
    };
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    const needUpdate =
      !equal(this.props, nextProps) || !equal(this.state, nextState);

    return needUpdate;
  }

  stopAction = (e: any) => e.preventDefault();

  setIsOpen = (isOpen: any) => {
    // @ts-expect-error TS(2339): Property 'setIsOpenItemAccess' does not exist on t... Remove this comment to see the full error message
    const { setIsOpenItemAccess } = this.props;
    this.setState({ isOpen: isOpen });
    setIsOpenItemAccess && setIsOpenItemAccess(isOpen);
  };

  handleClickOutside = (e: any) => {
    // @ts-expect-error TS(2339): Property 'setIsOpenItemAccess' does not exist on t... Remove this comment to see the full error message
    const { setIsOpenItemAccess } = this.props;

    if (this.ref.current.contains(e.target)) return;

    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.setState({ isOpen: !this.state.isOpen }, () => {
      // @ts-expect-error TS(2339): Property 'onToggle' does not exist on type 'Readon... Remove this comment to see the full error message
      this.props.onToggle && this.props.onToggle(e, this.state.isOpen);
    });

    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    setIsOpenItemAccess && setIsOpenItemAccess(!this.state.isOpen);
  };

  comboBoxClick = (e: any) => {
    const {
      // @ts-expect-error TS(2339): Property 'disableIconClick' does not exist on type... Remove this comment to see the full error message
      disableIconClick,
      // @ts-expect-error TS(2339): Property 'disableItemClick' does not exist on type... Remove this comment to see the full error message
      disableItemClick,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'onToggle' does not exist on type 'Readon... Remove this comment to see the full error message
      onToggle,
      // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
      isLoading,
      // @ts-expect-error TS(2339): Property 'setIsOpenItemAccess' does not exist on t... Remove this comment to see the full error message
      setIsOpenItemAccess,
    } = this.props;

    if (
      isDisabled ||
      disableItemClick ||
      isLoading ||
      (disableIconClick && e && e.target.closest(".optionalBlock")) ||
      e?.target.classList.contains("nav-thumb-vertical")
    )
      return;

    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.setState({ isOpen: !this.state.isOpen }, () => {
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
      onToggle && onToggle(e, this.state.isOpen);
    });
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    setIsOpenItemAccess && setIsOpenItemAccess(!this.state.isOpen);
  };

  optionClick = (option: any) => {
    // @ts-expect-error TS(2339): Property 'setIsOpenItemAccess' does not exist on t... Remove this comment to see the full error message
    const { setIsOpenItemAccess } = this.props;
    this.setState({
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
      isOpen: !this.state.isOpen,
      selectedOption: option,
    });
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    setIsOpenItemAccess && setIsOpenItemAccess(!this.state.isOpen);
    // @ts-expect-error TS(2339): Property 'onSelect' does not exist on type 'Readon... Remove this comment to see the full error message
    this.props.onSelect && this.props.onSelect(option);
  };

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'setIsOpenItemAccess' does not exist on t... Remove this comment to see the full error message
    const { setIsOpenItemAccess } = this.props;
    // @ts-expect-error TS(2339): Property 'opened' does not exist on type 'Readonly... Remove this comment to see the full error message
    if (this.props.opened !== prevProps.opened) {
      // @ts-expect-error TS(2339): Property 'opened' does not exist on type 'Readonly... Remove this comment to see the full error message
      this.setIsOpen(this.props.opened);
      // @ts-expect-error TS(2339): Property 'opened' does not exist on type 'Readonly... Remove this comment to see the full error message
      setIsOpenItemAccess && setIsOpenItemAccess(this.props.opened);
    }

    // @ts-expect-error TS(2339): Property 'selectedOption' does not exist on type '... Remove this comment to see the full error message
    if (this.props.selectedOption !== prevProps.selectedOption) {
      // @ts-expect-error TS(2339): Property 'selectedOption' does not exist on type '... Remove this comment to see the full error message
      this.setState({ selectedOption: this.props.selectedOption });
    }
  }

  render() {
    //console.log("ComboBox render");
    const {
      // @ts-expect-error TS(2339): Property 'dropDownMaxHeight' does not exist on typ... Remove this comment to see the full error message
      dropDownMaxHeight,
      // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Read... Remove this comment to see the full error message
      directionX,
      // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Read... Remove this comment to see the full error message
      directionY,
      // @ts-expect-error TS(2339): Property 'scaled' does not exist on type 'Readonly... Remove this comment to see the full error message
      scaled,
      // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error TS(2339): Property 'type' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      type,
      // @ts-expect-error TS(2339): Property 'options' does not exist on type 'Readonl... Remove this comment to see the full error message
      options,
      // @ts-expect-error TS(2339): Property 'advancedOptions' does not exist on type ... Remove this comment to see the full error message
      advancedOptions,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
      children,
      // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Readon... Remove this comment to see the full error message
      noBorder,
      // @ts-expect-error TS(2339): Property 'scaledOptions' does not exist on type 'R... Remove this comment to see the full error message
      scaledOptions,
      // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
      displayType,
      // @ts-expect-error TS(2339): Property 'onToggle' does not exist on type 'Readon... Remove this comment to see the full error message
      onToggle,
      // @ts-expect-error TS(2339): Property 'textOverflow' does not exist on type 'Re... Remove this comment to see the full error message
      textOverflow,
      // @ts-expect-error TS(2339): Property 'showDisabledItems' does not exist on typ... Remove this comment to see the full error message
      showDisabledItems,
      // @ts-expect-error TS(2339): Property 'comboIcon' does not exist on type 'Reado... Remove this comment to see the full error message
      comboIcon,
      // @ts-expect-error TS(2339): Property 'manualY' does not exist on type 'Readonl... Remove this comment to see the full error message
      manualY,
      // @ts-expect-error TS(2339): Property 'manualX' does not exist on type 'Readonl... Remove this comment to see the full error message
      manualX,
      // @ts-expect-error TS(2339): Property 'isDefaultMode' does not exist on type 'R... Remove this comment to see the full error message
      isDefaultMode,
      // @ts-expect-error TS(2339): Property 'manualWidth' does not exist on type 'Rea... Remove this comment to see the full error message
      manualWidth,
      // @ts-expect-error TS(2339): Property 'displaySelectedOption' does not exist on... Remove this comment to see the full error message
      displaySelectedOption,
      // @ts-expect-error TS(2339): Property 'fixedDirection' does not exist on type '... Remove this comment to see the full error message
      fixedDirection,
      // @ts-expect-error TS(2339): Property 'withBlur' does not exist on type 'Readon... Remove this comment to see the full error message
      withBlur,
      // @ts-expect-error TS(2339): Property 'fillIcon' does not exist on type 'Readon... Remove this comment to see the full error message
      fillIcon,
      // @ts-expect-error TS(2339): Property 'offsetLeft' does not exist on type 'Read... Remove this comment to see the full error message
      offsetLeft,
      // @ts-expect-error TS(2339): Property 'modernView' does not exist on type 'Read... Remove this comment to see the full error message
      modernView,
      // @ts-expect-error TS(2339): Property 'withBackdrop' does not exist on type 'Re... Remove this comment to see the full error message
      withBackdrop,
      // @ts-expect-error TS(2339): Property 'isAside' does not exist on type 'Readonl... Remove this comment to see the full error message
      isAside,
      // @ts-expect-error TS(2339): Property 'withBackground' does not exist on type '... Remove this comment to see the full error message
      withBackground,
      // @ts-expect-error TS(2339): Property 'advancedOptionsCount' does not exist on ... Remove this comment to see the full error message
      advancedOptionsCount,
      // @ts-expect-error TS(2339): Property 'isMobileView' does not exist on type 'Re... Remove this comment to see the full error message
      isMobileView,
      // @ts-expect-error TS(2339): Property 'withoutPadding' does not exist on type '... Remove this comment to see the full error message
      withoutPadding,
      // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
      isLoading,
      // @ts-expect-error TS(2339): Property 'isNoFixedHeightOptions' does not exist o... Remove this comment to see the full error message
      isNoFixedHeightOptions,
      // @ts-expect-error TS(2339): Property 'hideMobileView' does not exist on type '... Remove this comment to see the full error message
      hideMobileView,
      // @ts-expect-error TS(2339): Property 'forceCloseClickOutside' does not exist o... Remove this comment to see the full error message
      forceCloseClickOutside,
      // @ts-expect-error TS(2339): Property 'withoutBackground' does not exist on typ... Remove this comment to see the full error message
      withoutBackground,
    } = this.props;
    // @ts-expect-error TS(2339): Property 'tabIndex' does not exist on type 'Readon... Remove this comment to see the full error message
    const { tabIndex, onClickSelectedItem, ...props } = this.props;
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { isOpen, selectedOption } = this.state;

    const dropDownMaxHeightProp = dropDownMaxHeight
      ? { maxHeight: dropDownMaxHeight }
      : {};

    const dropDownManualWidthProp =
      scaledOptions && !isDefaultMode
        ? { manualWidth: "100%" }
        : scaledOptions && this.ref.current
        ? { manualWidth: this.ref.current.clientWidth + "px" }
        : { manualWidth: manualWidth };

    const optionsLength = options.length
      ? options.length
      : displayType !== "toggle"
      ? 0
      : 1;

    const withAdvancedOptions = !!advancedOptions?.props.children;

    let optionsCount = optionsLength;

    if (withAdvancedOptions) {
      const advancedOptionsWithoutSeparator =
        advancedOptions.props.children.filter((option: any) => option.key !== "s1");

      const advancedOptionsWithoutSeparatorLength =
        advancedOptionsWithoutSeparator.length;

      optionsCount = advancedOptionsCount
        ? advancedOptionsCount
        : advancedOptionsWithoutSeparatorLength
        ? advancedOptionsWithoutSeparatorLength
        : 6;
    }

    const disableMobileView = optionsCount < 4 || hideMobileView;
    return (
      <StyledComboBox
        ref={this.ref}
        // @ts-expect-error TS(2769): No overload matches this call.
        isDisabled={isDisabled}
        scaled={scaled}
        size={size}
        data={selectedOption}
        onClick={this.comboBoxClick}
        onToggle={onToggle}
        isOpen={isOpen}
        disableMobileView={disableMobileView}
        withoutPadding={withoutPadding}
        {...props}
      >
        <ComboButton
          noBorder={noBorder}
          isDisabled={isDisabled}
          selectedOption={selectedOption}
          withOptions={optionsLength > 0}
          optionsLength={optionsLength}
          withAdvancedOptions={withAdvancedOptions}
          innerContainer={children}
          innerContainerClassName="optionalBlock"
          isOpen={isOpen}
          size={size}
          scaled={scaled}
          comboIcon={comboIcon}
          modernView={modernView}
          fillIcon={fillIcon}
          tabIndex={tabIndex}
          isLoading={isLoading}
          type={type}
        />

        {displayType !== "toggle" && (
          // @ts-expect-error TS(2769): No overload matches this call.
          <DropDown
            // @ts-expect-error TS(2339): Property 'dropDownId' does not exist on type 'Read... Remove this comment to see the full error message
            id={this.props.dropDownId}
            className="dropdown-container not-selectable"
            directionX={directionX}
            directionY={directionY}
            manualY={manualY}
            manualX={manualX}
            open={isOpen}
            forwardedRef={this.ref}
            clickOutsideAction={this.handleClickOutside}
            style={advancedOptions && { padding: "6px 0px" }}
            {...dropDownMaxHeightProp}
            {...dropDownManualWidthProp}
            showDisabledItems={showDisabledItems}
            isDefaultMode={isDefaultMode}
            fixedDirection={fixedDirection}
            withBlur={withBlur}
            offsetLeft={offsetLeft}
            withBackdrop={withBackdrop}
            isAside={isAside}
            withBackground={withBackground}
            isMobileView={isMobileView && !disableMobileView}
            isNoFixedHeightOptions={isNoFixedHeightOptions}
            forceCloseClickOutside={forceCloseClickOutside}
            withoutBackground={withoutBackground}
          >
            {advancedOptions
              ? advancedOptions
              : options.map((option: any) => {
                  const disabled =
                    option.disabled ||
                    (!displaySelectedOption &&
                      option.label === selectedOption.label);

                  const isActive =
                    displaySelectedOption &&
                    option.label === selectedOption.label;

                  const isSelected = option.label === selectedOption.label;
                  return (
                    <DropDownItem
                      {...option}
                      className="drop-down-item"
                      textOverflow={textOverflow}
                      key={option.key}
                      disabled={disabled}
                      backgroundColor={option.backgroundColor}
                      onClick={this.optionClick.bind(this, option)}
                      onClickSelectedItem={() => onClickSelectedItem?.(option)}
                      fillIcon={fillIcon}
                      isModern={noBorder}
                      isActive={isActive}
                      isSelected={isSelected}
                    />
                  );
                })}
          </DropDown>
        )}
      </StyledComboBox>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ComboBox.propTypes = {
  /** Displays advanced options */
  advancedOptions: PropTypes.element,
  /** Children elements */
  children: PropTypes.any,
  /** Accepts class */
  className: PropTypes.string,
  /** X direction position */
  directionX: PropTypes.oneOf(["left", "right"]),
  /** Y direction position */
  directionY: PropTypes.oneOf(["bottom", "top", "both"]),
  /** Component Display Type */
  displayType: PropTypes.oneOf(["default", "toggle"]),
  /** Height of Dropdown */
  dropDownMaxHeight: PropTypes.number,
  /** Displays disabled items when displayType !== toggle */
  showDisabledItems: PropTypes.bool,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts id for dropdown container */
  dropDownId: PropTypes.string,
  /** Indicates that component contains a backdrop */
  withBackdrop: PropTypes.bool,
  /** Indicates that component is disabled */
  isDisabled: PropTypes.bool,
  /** Indicates that component is displayed without borders */
  noBorder: PropTypes.bool,
  /** Is triggered whenever ComboBox is a selected option */
  onSelect: PropTypes.func,
  /** Sets the component open */
  opened: PropTypes.bool,
  /** Combo box options */
  options: PropTypes.array.isRequired,
  /** Indicates that component is scaled by parent */
  scaled: PropTypes.bool,
  /** Indicates that component`s options are scaled by ComboButton */
  scaledOptions: PropTypes.bool,
  /** Selected option */
  selectedOption: PropTypes.object.isRequired,
  /** Sets the component's width from the default settings */
  size: PropTypes.oneOf(["base", "middle", "big", "huge", "content"]),
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** The event is triggered by clicking on a component when `displayType: toggle` */
  onToggle: PropTypes.func,
  /** Accepts css text-overflow */
  textOverflow: PropTypes.bool,
  /** Disables clicking on the icon */
  disableIconClick: PropTypes.bool,
  /** Sets the operation mode of the component. The default option is set to portal mode */
  isDefaultMode: PropTypes.bool,
  /** Y offset */
  offsetDropDownY: PropTypes.string,
  /** Sets an icon that is displayed in the combo button */
  comboIcon: PropTypes.string,
  /** Sets the precise distance from the parent */
  manualY: PropTypes.string,
  /** Sets the precise distance from the parent */
  manualX: PropTypes.string,
  /** Dropdown manual width */
  manualWidth: PropTypes.string,
  /** Displays the selected option */
  displaySelectedOption: PropTypes.bool,
  /** Disables position checking. Used for explicit direction setting */
  fixedDirection: PropTypes.bool,
  /** Disables clicking on the item */
  disableItemClick: PropTypes.bool,
  /** Indicates that component will fill selected item icon */
  fillIcon: PropTypes.bool,
  /** Sets the left offset for the dropdown */
  offsetLeft: PropTypes.number,
  /** Sets the combo-box to be displayed in modern view */
  modernView: PropTypes.bool,
  /** Count of advanced options  */
  advancedOptionsCount: PropTypes.number,
  /** Accepts css tab-index style */
  tabIndex: PropTypes.number,
  /** Disables the combo box padding */
  withoutPadding: PropTypes.bool,
  /** Indicates when the component is loading */
  isLoading: PropTypes.bool,
  /**Type ComboBox */
  type: PropTypes.oneOf(["badge", null]),
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ComboBox.defaultProps = {
  displayType: "default",
  isDisabled: false,
  noBorder: false,
  scaled: true,
  scaledOptions: false,
  size: "base",
  disableIconClick: true,
  showDisabledItems: false,
  manualY: "102%",
  isDefaultMode: true,
  manualWidth: "200px",
  displaySelectedOption: false,
  fixedDirection: false,
  disableItemClick: false,
  modernView: false,
  tabIndex: -1,
  withoutPadding: false,
  isLoading: false,
};

export default ComboBox;
