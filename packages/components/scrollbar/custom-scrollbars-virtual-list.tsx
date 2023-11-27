/* eslint-disable react/prop-types */
import React from "react";
import Scrollbar from "./";

export class CustomScrollbars extends React.Component {
  refSetter = (scrollbarsRef: any, forwardedRef: any) => {
    const isFuntion = typeof forwardedRef === "function";

    const ref = scrollbarsRef?.contentElement ?? null;

    if (isFuntion) {
      forwardedRef(ref);
    } else {
      forwardedRef = ref;
    }
  };

  render() {
    // @ts-expect-error TS(2339): Property 'onScroll' does not exist on type 'Readon... Remove this comment to see the full error message
    const { onScroll, forwardedRef, style, children, className, stype } =
      this.props;
    //console.log("CustomScrollbars", this.props);
    return (
      // @ts-expect-error TS(2322): Type '{ children: any[]; ref: (scrollbarsRef: unkn... Remove this comment to see the full error message
      <Scrollbar
        ref={(scrollbarsRef) => this.refSetter(scrollbarsRef, forwardedRef)}
        style={{ ...style, overflow: "hidden" }}
        onScroll={onScroll}
        stype={stype}
        className={className}
      >
        {children}
        <div className="additional-scroll-height"></div>
      </Scrollbar>
    );
  }
}

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
CustomScrollbars.defaultProps = {
  stype: "mediumBlack",
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  // @ts-expect-error TS(2769): No overload matches this call.
  <CustomScrollbars {...props} forwardedRef={ref} />
));

export default CustomScrollbarsVirtualList;
