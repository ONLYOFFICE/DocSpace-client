import styled from "styled-components";

import { commonIconsStyles } from "../../../utils";
import { Base, TColorScheme } from "../../../themes";

import StyledMuteIcon from "../sub-components/StyledMuteIcon";

import { IconButtonMuteColorTheme } from "../ColorTheme.types";

const IconButtonMuteTheme = styled(StyledMuteIcon)<
  IconButtonMuteColorTheme & { $currentColorScheme?: TColorScheme }
>`
  ${commonIconsStyles}
  svg {
    path:first-child {
      stroke: ${(props) =>
        props.theme.isBase && props.$currentColorScheme?.main.accent};
    }
    path {
      fill: ${(props) =>
        props.theme.isBase && props.$currentColorScheme?.main.accent};
    }
    rect {
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

IconButtonMuteTheme.defaultProps = { theme: Base };

export default IconButtonMuteTheme;
