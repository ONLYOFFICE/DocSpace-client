import styled, { css } from "styled-components";
import Base from "../themes/base";

import Text from "../text";
import { tablet } from "../utils/device";

const hoveredCss = css`
  border-color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
    props.backgroundColor
      // @ts-expect-error TS(2339): Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
      ? props.backgroundColor
      : props.theme.badge.backgroundColor};
`;

const highCss = css`
  cursor: default;
  padding: 3px 10px;
  border-radius: 6px;

  p {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 400;
  }
`;

const noBorderCss = css`
  border: none;
  border-radius: 6px;
`;

const StyledBadge = styled.div`
  display: ${(props) =>
    // @ts-expect-error TS(2339): Property 'label' does not exist on type 'ThemedSty... Remove this comment to see the full error message
    props.label.length > 0 || props.label != "0" ? "flex" : "none"};
  align-items: center;
  justify-content: center;
  border: ${(props) => props.theme.badge.border};
  // @ts-expect-error TS(2339): Property 'borderRadius' does not exist on type 'Th... Remove this comment to see the full error message
  border-radius: ${(props) => props.borderRadius};
  width: fit-content;
  padding: ${(props) => props.theme.badge.padding};

  // @ts-expect-error TS(2339): Property 'height' does not exist on type 'ThemedSt... Remove this comment to see the full error message
  height: ${(props) => props.height};
  // @ts-expect-error TS(2339): Property 'lineHeight' does not exist on type 'Them... Remove this comment to see the full error message
  line-height: ${(props) => props.lineHeight};
  cursor: pointer;
  overflow: ${(props) => props.theme.badge.overflow};
  flex-shrink: 0;
  // @ts-expect-error TS(2339): Property 'border' does not exist on type 'ThemedSt... Remove this comment to see the full error message
  border: ${(props) => props.border};

  // @ts-expect-error TS(2339): Property 'type' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  ${(props) => props.type === "high" && noBorderCss}
  &:hover {
    // @ts-expect-error TS(2339): Property 'noHover' does not exist on type 'ThemedS... Remove this comment to see the full error message
    ${(props) => !props.noHover && hoveredCss};
  }
  // @ts-expect-error TS(2339): Property 'noHover' does not exist on type 'ThemedS... Remove this comment to see the full error message
  ${(props) => !props.noHover && props.isHovered && hoveredCss};

  @media ${tablet} {
    // @ts-expect-error TS(2339): Property 'isVersionBadge' does not exist on type '... Remove this comment to see the full error message
    ${({ isVersionBadge }) => isVersionBadge && `width: auto;`}
  }
`;
StyledBadge.defaultProps = { theme: Base };

const StyledInner = styled.div`
  background-color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
    props.backgroundColor
      // @ts-expect-error TS(2339): Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
      ? props.backgroundColor
      : props.theme.badge.backgroundColor};
  // @ts-expect-error TS(2339): Property 'borderRadius' does not exist on type 'Th... Remove this comment to see the full error message
  border-radius: ${(props) => props.borderRadius};
  // @ts-expect-error TS(2339): Property 'maxWidth' does not exist on type 'Themed... Remove this comment to see the full error message
  max-width: ${(props) => props.maxWidth};
  // @ts-expect-error TS(2339): Property 'padding' does not exist on type 'ThemedS... Remove this comment to see the full error message
  padding: ${(props) => props.padding};
  text-align: center;
  user-select: none;
  // @ts-expect-error TS(2339): Property 'compact' does not exist on type 'ThemedS... Remove this comment to see the full error message
  line-height: ${(props) => (props.compact ? "0.8" : "1.5")};
  display: flex;
  align-items: center;
  justify-content: center;
  // @ts-expect-error TS(2339): Property 'type' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  ${(props) => props.type === "high" && highCss}
`;

StyledInner.defaultProps = { theme: Base };

const StyledText = styled(Text)`
  color: ${(props) =>
    props.color ? props.color : props.theme.badge.color} !important;
  border-radius: ${(props) => props.borderRadius};
`;

StyledText.defaultProps = { theme: Base };

export { StyledBadge, StyledInner, StyledText };
