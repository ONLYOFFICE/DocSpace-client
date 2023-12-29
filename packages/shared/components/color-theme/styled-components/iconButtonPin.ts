import styled from "styled-components";
import { commonIconsStyles } from "../../../utils";
import { Base, TColorScheme } from "../../../themes";
import StyledPinIcon from "../sub-components/StyledPinIcon";

import { IconButtonPinColorTheme } from "../ColorTheme.types";

const IconButtonPinTheme = styled(StyledPinIcon)<
  IconButtonPinColorTheme & { $currentColorScheme?: TColorScheme }
>`
  margin-top: 2px;
  ${commonIconsStyles}
  svg {
    path {
      fill: ${(props) =>
        props.theme.isBase && props.$currentColorScheme?.main.accent};
    }
  }

  &:hover {
    svg {
      path {
        fill: ${(props) =>
          props.theme.isBase && props.$currentColorScheme?.main.accent};
      }
    }
  }
`;

IconButtonPinTheme.defaultProps = { theme: Base };

export default IconButtonPinTheme;
