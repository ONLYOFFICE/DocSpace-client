/* eslint-disable react/prop-types */
import React from "react";
import { ScrollbarComponent } from "../Scrollbar";
import { CustomScrollbarsVirtualListProps } from "../Scrollbar.types";
import { Scrollbar } from "../custom-scrollbar";

const CustomScrollbars = ({
  onScroll,
  forwardedRef,
  style,
  children,
  className,
}: CustomScrollbarsVirtualListProps) => {
  const refSetter = (
    scrollbarsRef: React.RefObject<Scrollbar>,
    forwardedRefArg: unknown,
  ) => {
    // @ts-expect-error Don`t know how fix it
    const ref = scrollbarsRef?.contentElement ?? null;

    if (typeof forwardedRefArg === "function") {
      forwardedRefArg(ref);
    } else {
      forwardedRefArg = ref;
    }
  };
  return (
    <ScrollbarComponent
      ref={(scrollbarsRef: React.RefObject<Scrollbar>) =>
        refSetter(scrollbarsRef, forwardedRef)
      }
      style={{ ...style, overflow: "hidden" }}
      onScroll={onScroll}
      className={className}
    >
      {children}
      <div className="additional-scroll-height" />
    </ScrollbarComponent>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef(
  (props: CustomScrollbarsVirtualListProps, ref) => (
    <CustomScrollbars {...props} forwardedRef={ref} />
  ),
);

export { CustomScrollbarsVirtualList };
