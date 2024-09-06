import React from "react";

type TDirection = "forward" | "backward";

export const findNextNonSeparatorIndex = (
  currentIndex: number,
  children: React.ReactNode,
  direction: TDirection,
) => {
  if (!children || !React.Children.count(children)) return currentIndex;

  const childrenArray = React.Children.toArray(children);

  const step = direction === "forward" ? 1 : -1;

  for (
    let i = currentIndex + step;
    i >= 0 && i < childrenArray.length;
    i += step
  ) {
    const child = childrenArray[i];
    if (React.isValidElement(child) && !child.props.isSeparator) {
      return i;
    }
  }

  return currentIndex;
};
