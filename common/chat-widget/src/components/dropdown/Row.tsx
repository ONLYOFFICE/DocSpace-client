import { memo } from "react";

type RowData = {
  children?: React.ReactNode;
  activeIndex?: number;
  activedescendant?: number;
  handleMouseMove?: (index: number) => void;
  isActive?: number;
};

export const Row = memo(
  ({
    data,
    index,
    style,
  }: {
    data: RowData;
    index: number;
    style: React.CSSProperties;
  }) => {
    const { children, isActive, handleMouseMove } = data;

    const option = Array.isArray(children) ? children[index] : null;

    const optionStyle = option?.props?.style ?? {};

    const newStyle = { ...style, ...optionStyle };

    const className =
      isActive === index ? " chat-panel-footer_input-dropdown-item_active" : "";

    return (
      <div
        {...option?.props}
        className={option.props.className + className}
        style={newStyle}
        onMouseMove={() => {
          handleMouseMove?.(index);
        }}
      />
    );
  }
);
