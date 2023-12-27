import React from "react";

import { Heading } from "@docspace/shared/components";
import { IconButton } from "@docspace/shared/components";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

const Header = ({ headerLabel, onArrowClickAction }) => {
  return (
    <div className="header">
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill={true}
        className="arrow-button"
        onClick={onArrowClickAction}
      />
      <Heading size="medium" truncate={true}>
        {headerLabel.replace("()", "")}
      </Heading>
    </div>
  );
};

export default React.memo(Header);
