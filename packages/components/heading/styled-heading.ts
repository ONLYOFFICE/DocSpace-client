import styled, { css } from "styled-components";
import NoUserSelect from "../utils/commonStyles";
import commonTextStyles from "../text/common-text-styles";
import Base from "../themes/base";

const fontSizeStyle = (props: any) => props.theme.heading.fontSize[props.size];

const styleCss = css`
  font-size: ${(props) => props.theme.getCorrectFontSize(fontSizeStyle(props))};
  font-weight: ${(props) => props.theme.heading.fontWeight};
  // @ts-expect-error TS(2339): Property 'color' does not exist on type 'ThemedSty... Remove this comment to see the full error message
  color: ${(props) => (props.color ? props.color : props.theme.heading.color)}
    ${(props) =>
      // @ts-expect-error TS(2339): Property 'isInline' does not exist on type 'Themed... Remove this comment to see the full error message
      props.isInline &&
      css`
        display: inline-block;
      `};
`;

const StyledHeading = styled.h1`
  ${styleCss};

  ${commonTextStyles};

  ${NoUserSelect};
`;

StyledHeading.defaultProps = { theme: Base };

export default StyledHeading;
