import PropTypes from "prop-types";
import React from "react";

import Checkbox from "../checkbox";
import ContextMenuButton from "../context-menu-button";
import ContextMenu from "../context-menu";
import {
  StyledOptionButton,
  StyledContentElement,
  StyledElement,
  StyledCheckbox,
  StyledContent,
  StyledRow,
} from "./styled-row";
import Loader from "../loader";

import { isMobile } from "react-device-detect"; //TODO: isDesktop=true for IOS(Firefox & Safari)
import { isMobile as isMobileUtils } from "../utils/device";
class Row extends React.Component {
  cm: any;
  row: any;
  constructor(props: any) {
    super(props);

    this.cm = React.createRef();
    this.row = React.createRef();
  }

  render() {
    const {
      // @ts-expect-error TS(2339): Property 'checked' does not exist on type 'Readonl... Remove this comment to see the full error message
      checked,
      // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
      children,
      // @ts-expect-error TS(2339): Property 'contentElement' does not exist on type '... Remove this comment to see the full error message
      contentElement,
      // @ts-expect-error TS(2339): Property 'contextButtonSpacerWidth' does not exist... Remove this comment to see the full error message
      contextButtonSpacerWidth,
      // @ts-expect-error TS(2339): Property 'data' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      data,
      // @ts-expect-error TS(2339): Property 'element' does not exist on type 'Readonl... Remove this comment to see the full error message
      element,
      // @ts-expect-error TS(2339): Property 'indeterminate' does not exist on type 'R... Remove this comment to see the full error message
      indeterminate,
      // @ts-expect-error TS(2339): Property 'onSelect' does not exist on type 'Readon... Remove this comment to see the full error message
      onSelect,
      // @ts-expect-error TS(2339): Property 'rowContextClose' does not exist on type ... Remove this comment to see the full error message
      rowContextClose,
      // @ts-expect-error TS(2339): Property 'sectionWidth' does not exist on type 'Re... Remove this comment to see the full error message
      sectionWidth,
      // @ts-expect-error TS(2339): Property 'getContextModel' does not exist on type ... Remove this comment to see the full error message
      getContextModel,
      // @ts-expect-error TS(2339): Property 'isRoom' does not exist on type 'Readonly... Remove this comment to see the full error message
      isRoom,
      // @ts-expect-error TS(2339): Property 'withoutBorder' does not exist on type 'R... Remove this comment to see the full error message
      withoutBorder,
      // @ts-expect-error TS(2339): Property 'contextTitle' does not exist on type 'Re... Remove this comment to see the full error message
      contextTitle,
      // @ts-expect-error TS(2339): Property 'badgesComponent' does not exist on type ... Remove this comment to see the full error message
      badgesComponent,
      // @ts-expect-error TS(2339): Property 'isArchive' does not exist on type 'Reado... Remove this comment to see the full error message
      isArchive,
    } = this.props;

    // @ts-expect-error TS(2339): Property 'onRowClick' does not exist on type 'Read... Remove this comment to see the full error message
    const { onRowClick, inProgress, mode, onContextClick, ...rest } =
      this.props;

    const renderCheckbox = Object.prototype.hasOwnProperty.call(
      this.props,
      "checked"
    );

    const renderElement = Object.prototype.hasOwnProperty.call(
      this.props,
      "element"
    );

    const renderContentElement = Object.prototype.hasOwnProperty.call(
      this.props,
      "contentElement"
    );

    const contextData = data.contextOptions ? data : this.props;

    const renderContext =
      Object.prototype.hasOwnProperty.call(contextData, "contextOptions") &&
      contextData &&
      contextData.contextOptions &&
      contextData.contextOptions.length > 0;

    const changeCheckbox = (e: any) => {
      onSelect && onSelect(e.target.checked, data);
    };

    const getOptions = () => {
      onContextClick && onContextClick();
      return contextData.contextOptions;
    };

    const onContextMenu = (e: any) => {
      onContextClick && onContextClick(e.button === 2);
      if (!this.cm.current.menuRef.current) {
        this.row.current.click(e); //TODO: need fix context menu to global
      }
      this.cm.current.show(e);
    };

    let contextMenuHeader = {};
    if (children.props.item) {
      contextMenuHeader = {
        icon: children.props.item.icon,
        avatar: children.props.item.avatar,
        title: children.props.item.title
          ? children.props.item.title
          : children.props.item.displayName,
        color: children.props.item.logo?.color,
      };
    }

    const onElementClick = () => {
      if (!isMobile) return;

      onSelect && onSelect(true, data);
    };

    return (
      <StyledRow
        ref={this.row}
        {...rest}
        // @ts-expect-error TS(2769): No overload matches this call.
        mode={mode}
        onContextMenu={onContextMenu}
        withoutBorder={withoutBorder}
      >
        {inProgress ? (
          <Loader className="row-progress-loader" type="oval" size="16px" />
        ) : (
          <>
            {mode == "default" && renderCheckbox && (
              <StyledCheckbox className="not-selectable">
                <Checkbox
                  className="checkbox"
                  isChecked={checked}
                  isIndeterminate={indeterminate}
                  onChange={changeCheckbox}
                />
              </StyledCheckbox>
            )}
            {mode == "modern" && renderCheckbox && renderElement && (
              <StyledCheckbox
                className="not-selectable styled-checkbox-container"
                // @ts-expect-error TS(2769): No overload matches this call.
                checked={checked}
                mode={mode}
              >
                <StyledElement
                  onClick={onElementClick}
                  className="styled-element"
                >
                  {element}
                </StyledElement>
                <Checkbox
                  className="checkbox"
                  isChecked={checked}
                  isIndeterminate={indeterminate}
                  onChange={changeCheckbox}
                />
              </StyledCheckbox>
            )}

            {mode == "default" && renderElement && (
              <StyledElement onClick={onRowClick} className="styled-element">
                {element}
              </StyledElement>
            )}
          </>
        )}

        <StyledContent onClick={onRowClick} className="row_content">
          {children}
        </StyledContent>
        <StyledOptionButton
          className="row_context-menu-wrapper"
          // @ts-expect-error TS(2769): No overload matches this call.
          spacerWidth={contextButtonSpacerWidth}
        >
          {badgesComponent && badgesComponent}
          {renderContentElement && (
            <StyledContentElement>{contentElement}</StyledContentElement>
          )}
          {renderContext ? (
            <ContextMenuButton
              // @ts-expect-error TS(2322): Type '{ isFill: true; className: string; getData: ... Remove this comment to see the full error message
              isFill
              className="expandButton"
              getData={getOptions}
              directionX="right"
              displayType="toggle"
              onClick={onContextMenu}
              title={contextTitle}
            />
          ) : (
            <div className="expandButton"> </div>
          )}
          <ContextMenu
            getContextModel={getContextModel}
            model={contextData.contextOptions}
            ref={this.cm}
            header={contextMenuHeader}
            withBackdrop={isMobileUtils()}
            onHide={rowContextClose}
            isRoom={isRoom}
            isArchive={isArchive}
          ></ContextMenu>
        </StyledOptionButton>
      </StyledRow>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
Row.propTypes = {
  /** Required for hosting the Checkbox component. Its location is always fixed in the first position.
   * If there is no value, the occupied space is distributed among the other child elements. */
  checked: PropTypes.bool,
  /** Displays the child elements */
  children: PropTypes.element,
  /** Accepts class */
  className: PropTypes.string,
  /** Required for displaying a certain element in the row */
  contentElement: PropTypes.any,
  /** Sets the width of the ContextMenuButton component. */
  contextButtonSpacerWidth: PropTypes.string,
  /** Required for hosting the ContextMenuButton component. It is always located near the right border of the container,
   * regardless of the contents of the child elements. If there is no value, the occupied space is distributed among the other child elements. */
  contextOptions: PropTypes.array,
  /** Current row item information. */
  data: PropTypes.object,
  /** In case Checkbox component is specified, it is located in a fixed order,
   * otherwise it is located in the first position. If there is no value, the occupied space is distributed among the other child elements. */
  element: PropTypes.element,
  /** Accepts id  */
  id: PropTypes.string,
  /** If true, this state is shown as a rectangle in the checkbox */
  indeterminate: PropTypes.bool,
  /** Sets a callback function that is triggered when a row element is selected. Returns data value. */
  onSelect: PropTypes.func,
  /** Sets a callback function that is triggered when any element except the checkbox and context menu is clicked. */
  onRowClick: PropTypes.func,
  /** Function that is invoked on clicking the icon button in the context-menu */
  onContextClick: PropTypes.func,
  /** Accepts css style  */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Width section */
  sectionWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Displays the loader*/
  inProgress: PropTypes.bool,
  /** Function that returns an object containing the elements of the context menu */
  getContextModel: PropTypes.func,
  /** Changes the row mode */
  mode: PropTypes.string,
  /** Removes the borders */
  withoutBorder: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
Row.defaultProps = {
  contextButtonSpacerWidth: "26px",
  mode: "default",
  data: {},
  withoutBorder: false,
};

export default Row;
