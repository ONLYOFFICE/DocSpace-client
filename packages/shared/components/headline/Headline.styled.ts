import styled from "styled-components";

import { Base } from "@docspace/shared/themes";
import { Heading } from "@docspace/shared/components/heading";
import { NoUserSelect, tablet } from "@docspace/shared/utils";

import { size, weight } from "./Headline.constants";
import type { StyledHeadingProps } from "./Headline.types";

const StyledHeading = styled(Heading)<StyledHeadingProps>`
  margin: 0;
  line-height: 50px;
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(
      props.fontSize ? props.fontSize : size[props.headlineType],
    )};
  font-weight: ${(props) => weight[props.headlineType]};
  color: ${(props) => (props.color ? props.color : props.theme.color)};
  ${NoUserSelect}
  @media ${tablet} {
    ${(props) =>
      props.headlineType === "content" &&
      `font-size: ${props.theme.getCorrectFontSize("18px")}`};
  }
`;
StyledHeading.defaultProps = { theme: Base };

export default StyledHeading;
