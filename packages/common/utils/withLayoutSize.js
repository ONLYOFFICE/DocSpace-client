import * as React from "react";
import { Consumer } from "@docspace/shared/utils";

export function withLayoutSize(Component) {
  return function LayoutSizeComponent(props) {
    return (
      <Consumer>
        {(context) => {
          return <Component {...props} {...context} />;
        }}
      </Consumer>
    );
  };
}
