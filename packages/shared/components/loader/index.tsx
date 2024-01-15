import React from "react";

import { Text } from "../text";

import { Oval } from "./sub-components/Oval";
import { DualRing } from "./sub-components/DualRing";
import { Rombs } from "./sub-components/Rombs";
import { Track } from "./sub-components/Track";
import { LoaderProps } from "./Loader.types";
import { LoaderTypes } from "./Loader.enums";

export { LoaderTypes };
const Loader = ({ ...props }: LoaderProps) => {
  const { type, color, size, label, className, style, id } = props;

  const svgRenderer = (t?: LoaderTypes) => {
    switch (t) {
      case LoaderTypes.oval:
        return <Oval {...props} />;
      case LoaderTypes.dualRing:
        return <DualRing {...props} />;
      case LoaderTypes.rombs:
        return <Rombs {...props} />;
      case LoaderTypes.track:
        return <Track {...props} />;
      default:
        return (
          <span style={{ ...style }}>
            <Text color={color} fontSize={size}>
              {label}
            </Text>
          </span>
        );
    }
  };

  return (
    <div
      aria-busy="true"
      className={className}
      style={style}
      id={id}
      data-testid="loader"
    >
      {svgRenderer(type)}
    </div>
  );
};

Loader.defaultProps = {
  type: LoaderTypes.base,
  size: "40px",
  label: "Loading content, please wait.",
};

export { Loader };
