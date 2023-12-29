import React from "react";
import uniqueId from "lodash/uniqueId";

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

import { classNames } from "../../utils";
import { IconButton } from "../icon-button";
import { Tooltip } from "../tooltip";

import { HelpButtonProps } from "./HelpButton.types";

const HelpButton = (props: HelpButtonProps) => {
  const {
    id,
    className,
    iconName,
    size,
    color,
    dataTip,
    getContent,
    place,
    offset,
    style,
    afterShow,
    afterHide,
    tooltipMaxWidth,
    tooltipContent,
  } = props;
  const currentId = id || uniqueId();

  const ref = React.useRef(null);

  const anchorSelect = `div[id='${currentId}'] svg`;

  return (
    <div ref={ref} style={style} data-testid="help-button">
      <IconButton
        id={currentId}
        className={classNames([className], "help-icon") || "help-icon"}
        isClickable
        iconName={iconName || InfoReactSvgUrl}
        size={size}
        color={color}
        data-for={currentId}
        dataTip={dataTip}
      />

      {getContent ? (
        <Tooltip
          clickable
          openOnClick
          place={place || "top"}
          offset={offset}
          afterShow={afterShow}
          afterHide={afterHide}
          maxWidth={tooltipMaxWidth}
          getContent={getContent}
          anchorSelect={anchorSelect}
        />
      ) : (
        <Tooltip
          clickable
          openOnClick
          place={place}
          offset={offset}
          afterShow={afterShow}
          afterHide={afterHide}
          maxWidth={tooltipMaxWidth}
          anchorSelect={anchorSelect}
        >
          {tooltipContent}
        </Tooltip>
      )}
    </div>
  );
};

HelpButton.defaultProps = {
  iconName: InfoReactSvgUrl,
  //   place: "top",
  className: "icon-button",
  size: 12,
};

export { HelpButton };
