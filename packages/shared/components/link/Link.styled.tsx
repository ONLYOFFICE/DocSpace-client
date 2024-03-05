import React from "react";
import styled, { css } from "styled-components";

import { Text } from "../text";
import { Base } from "../../themes";
import { NoUserSelect } from "../../utils";
import { LinkProps } from "./Link.types";

const colorCss = css<LinkProps>`
  color: ${(props) => (props.color ? props.color : props.theme.link.color)};
`;

const hoveredCss = css<LinkProps>`
  ${colorCss};
  text-decoration: ${(props) =>
    props.type === "page"
      ? props.theme.link.hover.page.textDecoration
      : props.theme.link.hover.textDecoration};
`;

const PureText = ({
  type,
  color,
  ...props
}: LinkProps & { tag?: string; truncate?: boolean }) => <Text {...props} />;

const StyledText = styled(PureText)`
  text-decoration: ${(props) => props.theme.link.textDecoration};

  ${(props) =>
    props.enableUserSelect
      ? css`
          user-select: text;
        `
      : NoUserSelect}

  cursor: ${(props) => props.theme.link.cursor};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  opacity: ${(props) => props.isSemitransparent && props.theme.link.opacity};
  line-height: ${(props) =>
    props.lineHeight ? props.lineHeight : props.theme.link.lineHeight};

  ${colorCss};

  &:hover {
    ${(props) => !props.noHover && hoveredCss};
  }

  ${(props) => !props.noHover && props.isHovered && hoveredCss}

  ${(props) =>
    props.isTextOverflow &&
    css`
      display: ${props.theme.link.display};
      max-width: 100%;
    `}
`;

StyledText.defaultProps = {
  theme: Base,
};

export default StyledText;
