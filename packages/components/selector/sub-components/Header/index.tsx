import React from "react";

import IconButton from "../../../icon-button";
import Heading from "../../../heading";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/arrow.path.r... Remove this comment to see the full error message
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import StyledHeader from "./StyledHeader";
import { HeaderProps } from "./Header.types";

const Header = React.memo(
  ({ onBackClickAction, withoutBackButton, headerLabel }: HeaderProps) => {
    return (
      <StyledHeader>
        {!withoutBackButton && (
          <IconButton
            // @ts-expect-error TS(2322): Type '{ className: string; iconName: any; size: nu... Remove this comment to see the full error message
            className="arrow-button"
            iconName={ArrowPathReactSvgUrl}
            size={17}
            onClick={onBackClickAction}
          />
        )}
        // @ts-expect-error TS(2322): Type '{ children: string; className: string; }' is... Remove this comment to see the full error message
        <Heading className={"heading-text"}>{headerLabel}</Heading>
      </StyledHeader>
    );
  }
);

export default Header;
