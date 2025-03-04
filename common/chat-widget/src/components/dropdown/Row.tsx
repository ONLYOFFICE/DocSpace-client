import { memo } from "react";

export const Row = memo(({ data, index, style }: any) => {
  // TODO: types
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
});
