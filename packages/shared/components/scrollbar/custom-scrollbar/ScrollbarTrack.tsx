import { cnb } from "cnbuilder";
import React from "react";
import { AxisDirection, ElementPropsWithElementRefAndRenderer } from "./types";
import { isFun, isUndef, renderDivWithRenderer } from "./util";

export interface ScrollbarTrackClickParameters {
  axis: AxisDirection;
  offset: number;
}

export type ScrollbarTrackProps = ElementPropsWithElementRefAndRenderer & {
  axis: AxisDirection;

  onClick?: (ev: MouseEvent, values: ScrollbarTrackClickParameters) => void;

  ref?: (ref: ScrollbarTrack | null) => void;
};

class ScrollbarTrack extends React.Component<ScrollbarTrackProps, unknown> {
  public element: HTMLDivElement | null = null;

  public componentDidMount(): void {
    if (!this.element) {
      this.setState(() => {
        throw new Error(
          "Element was not created. Possibly you haven't provided HTMLDivElement to renderer's `elementRef` function.",
        );
      });
      return;
    }

    this.element?.addEventListener("click", this.handleClick);
  }

  public componentWillUnmount(): void {
    if (this.element) {
      this.element.removeEventListener("click", this.handleClick);
      this.element = null;

      this.elementRef(null);
    }
  }

  private elementRef = (ref: HTMLDivElement | null): void => {
    if (!ref && this.element) return;
    if (isFun(this.props.elementRef)) this.props.elementRef(ref);
    this.element = ref;
  };

  private handleClick = (ev: MouseEvent) => {
    if (!ev || !this.element || ev.button !== 0) {
      return;
    }

    if (isFun(this.props.onClick) && ev.target === this.element) {
      if (!isUndef(ev.offsetX)) {
        this.props.onClick(ev, {
          axis: this.props.axis,
          offset: this.props.axis === AxisDirection.X ? ev.offsetX : ev.offsetY,
        });
      } else {
        // support for old browsers
        /* istanbul ignore next */
        const rect: ClientRect = this.element.getBoundingClientRect();
        /* istanbul ignore next */
        this.props.onClick(ev, {
          axis: this.props.axis,
          offset:
            this.props.axis === AxisDirection.X
              ? (ev.clientX ||
                  (ev as unknown as TouchEvent).touches[0].clientX) - rect.left
              : (ev.clientY ||
                  (ev as unknown as TouchEvent).touches[0].clientY) - rect.top,
        });
      }
    }

    return true;
  };

  public render(): React.ReactElement<unknown> | null {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      elementRef,

      axis,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick,

      ...props
    } = this.props as ScrollbarTrackProps;

    props.className = cnb(
      "ScrollbarsCustom-Track",
      axis === AxisDirection.X
        ? "ScrollbarsCustom-TrackX"
        : "ScrollbarsCustom-TrackY",
      props.className,
    );

    if (props.renderer) {
      (props as ScrollbarTrackProps).axis = axis;
    }

    return renderDivWithRenderer(props, this.elementRef);
  }
}

export default ScrollbarTrack;
