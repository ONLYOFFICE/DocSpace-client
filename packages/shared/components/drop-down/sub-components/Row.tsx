import { memo } from "react";

import { DropDownItem } from "../../drop-down-item";

import { RowProps } from "../DropDown.types";

const Row = memo(({ data, index, style }: RowProps) => {
  const { children, theme, activedescendant, handleMouseMove } = data;

  const option = children ? children[index] : null;

  const separator = option?.props?.isSeparator
    ? { width: `calc(100% - 32px)`, height: `1px` }
    : {};
  const newStyle = { ...style, ...separator };

  return (
    <DropDownItem
      theme={theme}
      {...option?.props}
      noHover
      style={newStyle}
      onMouseMove={() => {
        handleMouseMove?.(index);
      }}
      isActiveDescendant={activedescendant === index}
    />
  );
});

Row.displayName = "Row";

export { Row };
