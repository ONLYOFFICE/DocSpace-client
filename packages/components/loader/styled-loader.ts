import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";
import Base from "../themes/base";

const BounceAnimation = keyframes`
0% { margin-bottom: 0; display: none; }
50% { margin-bottom: 1px;  }
100% { margin-bottom: 0; display: none; }
`;

const DotWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;

const Dot = styled.div`
  background-color: ${(props) =>
    props.color ? props.color : props.theme.loader.color};
  border-radius: ${(props) => props.theme.loader.borderRadius};
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  width: ${(props) => props.size / 9}px;
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  height: ${(props) => props.size / 9}px;
  margin-right: ${(props) => props.theme.loader.marginRight};
  /* Animation */
  animation: ${BounceAnimation} 0.5s linear infinite;
  // @ts-expect-error TS(2339): Property 'delay' does not exist on type 'ThemedSty... Remove this comment to see the full error message
  animation-delay: ${(props) => props.delay};
`;

Dot.propTypes = {
  // @ts-expect-error TS(2322): Type '{ delay: PropTypes.Validator<string>; color:... Remove this comment to see the full error message
  delay: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};
Dot.defaultProps = { theme: Base };

const LoadingWrapper = styled.div`
  display: flex;
  align-items: baseline;

  color: ${(props) => props.color};
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  font-size: ${(props) => props.theme.getCorrectFontSize(props.size)};
`;

const LoadingLabel = styled.span`
  margin-right: ${(props) => props.theme.loader.marginRight};
`;
LoadingLabel.defaultProps = { theme: Base };

const StyledOval = styled.svg`
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  width: ${(props) => (props.size ? props.size : props.theme.loader.size)};
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  height: ${(props) => (props.size ? props.size : props.theme.loader.size)};
  stroke: ${(props) => (props.color ? props.color : props.theme.loader.color)};
`;
StyledOval.defaultProps = { theme: Base };

const StyledDualRing = styled.svg`
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  width: ${(props) => (props.size ? props.size : props.theme.loader.size)};
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  height: ${(props) => (props.size ? props.size : props.theme.loader.size)};
  stroke: ${(props) => (props.color ? props.color : props.theme.loader.color)};
`;
StyledDualRing.defaultProps = { theme: Base };

const StyledTrack = styled.svg`
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  width: ${(props) => (props.size ? props.size : "20px")};
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  height: ${(props) => (props.size ? props.size : "20px")};
  // @ts-expect-error TS(2339): Property 'primary' does not exist on type 'Omit<SV... Remove this comment to see the full error message
  color: ${({ color, primary, theme }) =>
    color
      ? color
      : primary
      ? theme.button.loader.primary
      : theme.button.loader.base};
`;
StyledTrack.defaultProps = { theme: Base };

export {
  LoadingLabel,
  LoadingWrapper,
  DotWrapper,
  Dot,
  StyledOval,
  StyledDualRing,
  StyledTrack,
};
