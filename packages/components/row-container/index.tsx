/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import StyledRowContainer from "./styled-row-container";
import InfiniteLoaderComponent from "../infinite-loader";

class RowContainer extends React.PureComponent {
  render() {
    const {
      // @ts-expect-error TS(2339): Property 'manualHeight' does not exist on type 'Re... Remove this comment to see the full error message
      manualHeight,
      // @ts-expect-error TS(2339): Property 'itemHeight' does not exist on type 'Read... Remove this comment to see the full error message
      itemHeight,
      // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
      children,
      // @ts-expect-error TS(2339): Property 'useReactWindow' does not exist on type '... Remove this comment to see the full error message
      useReactWindow,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'onScroll' does not exist on type 'Readon... Remove this comment to see the full error message
      onScroll,
      // @ts-expect-error TS(2339): Property 'filesLength' does not exist on type 'Rea... Remove this comment to see the full error message
      filesLength,
      // @ts-expect-error TS(2339): Property 'itemCount' does not exist on type 'Reado... Remove this comment to see the full error message
      itemCount,
      // @ts-expect-error TS(2339): Property 'fetchMoreFiles' does not exist on type '... Remove this comment to see the full error message
      fetchMoreFiles,
      // @ts-expect-error TS(2339): Property 'hasMoreFiles' does not exist on type 'Re... Remove this comment to see the full error message
      hasMoreFiles,
    } = this.props;

    return (
      <StyledRowContainer
        id={id}
        className={className}
        style={style}
        // @ts-expect-error TS(2769): No overload matches this call.
        manualHeight={manualHeight}
        useReactWindow={useReactWindow}
      >
        {useReactWindow ? (
          <InfiniteLoaderComponent
            className="List"
            viewAs="row"
            hasMoreFiles={hasMoreFiles}
            filesLength={filesLength}
            itemCount={itemCount}
            loadMoreItems={fetchMoreFiles}
            itemSize={itemHeight}
            onScroll={onScroll}
          >
            {children}
          </InfiniteLoaderComponent>
        ) : (
          children
        )}
      </StyledRowContainer>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
RowContainer.propTypes = {
  /** Height of one Row element. Required for the proper functioning of the scroll */
  itemHeight: PropTypes.number,
  /** Allows setting fixed block height for Row */
  manualHeight: PropTypes.string,
  /** Child elements */
  children: PropTypes.any.isRequired,
  /** Enables react-window for efficient rendering of large lists */
  useReactWindow: PropTypes.bool,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets a callback function that is called when the list scroll positions change */
  onScroll: PropTypes.func,
  /** The property required for the infinite loader */
  filesLength: PropTypes.number,
  /** The property required for the infinite loader */
  itemCount: PropTypes.number,
  /** The property required for the infinite loader */
  loadMoreItems: PropTypes.func,
  /** The property required for the infinite loader */
  hasMoreFiles: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
RowContainer.defaultProps = {
  itemHeight: 50,
  useReactWindow: true,
  id: "rowContainer",
};

export default RowContainer;
