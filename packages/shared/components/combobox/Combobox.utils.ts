import React from "react";

export const extractChildrenFromReactFragment = (
  children: React.ReactNode,
): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      return extractChildrenFromReactFragment(child.props.children);
    }
    return child;
  });
};
