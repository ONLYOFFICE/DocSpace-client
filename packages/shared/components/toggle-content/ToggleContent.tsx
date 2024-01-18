import React from "react";

import styled from "styled-components";

import ArrowContentReactSvg from "PUBLIC_DIR/images/arrow.content.react.svg";
import { IconSizeType, commonIconsStyles } from "../../utils";

import { Heading, HeadingSize } from "../heading";

import { StyledContent, StyledContainer } from "./ToggleContent.styled";
import { ToggleContentProps } from "./ToggleContent.types";

const StyledArrowContentIcon = styled(ArrowContentReactSvg)`
  ${commonIconsStyles}
`;

const ToggleContent = ({
  isOpen = false,
  children,
  className,
  id,
  label,
  style,
  enableToggle = false,
}: ToggleContentProps) => {
  const [open, setOpen] = React.useState(isOpen);

  const toggleContent = () => {
    if (!enableToggle) return;

    setOpen((s) => !s);
  };

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <StyledContainer
      className={className}
      isOpen={open}
      id={id}
      style={style}
      enableToggle={enableToggle}
      data-testid="toggle-content"
    >
      <div className="toggle-container">
        <span className="span-toggle-content" onClick={toggleContent}>
          <StyledArrowContentIcon
            className="arrow-toggle-content"
            size={IconSizeType.medium}
          />
          <Heading
            className="heading-toggle-content"
            level={2}
            size={HeadingSize.small}
            isInline
          >
            {label}
          </Heading>
        </span>
      </div>
      <StyledContent isOpen={open}>{children}</StyledContent>
    </StyledContainer>
  );
};

export { ToggleContent };
