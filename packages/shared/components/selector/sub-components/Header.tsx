import React from "react";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import { IconButton } from "../../icon-button";
import { Heading } from "../../heading";

import { StyledHeader } from "../Selector.styled";
import { HeaderProps } from "../Selector.types";

const Header = React.memo(
  ({ onBackClick, withoutBackButton, headerLabel }: HeaderProps) => {
    return (
      <StyledHeader>
        {!withoutBackButton && (
          <IconButton
            className="arrow-button"
            iconName={ArrowPathReactSvgUrl}
            size={17}
            onClick={onBackClick}
          />
        )}

        <Heading className="heading-text">{headerLabel}</Heading>
      </StyledHeader>
    );
  },
);

Header.displayName = "Header";

export { Header };
