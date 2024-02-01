import styled from "styled-components";
import { commonIconsStyles } from "../../../utils";
import { TColorScheme } from "../../../themes";

import { StyledIcon } from "../sub-components/StyledIcon";
import { IconButtonColorTheme } from "../ColorTheme.types";

const StyledIconTheme = styled(StyledIcon)<
  IconButtonColorTheme & { $currentColorScheme?: TColorScheme }
>`
  ${commonIconsStyles}
  svg {
    path {
      fill: ${(props) =>
        (props.shared || props.locked || props.isFavorite || props.isEditing) &&
        props.$currentColorScheme?.main?.accent};
    }
  }

  &:hover {
    svg {
      path {
        fill: ${(props) => props.$currentColorScheme?.main?.accent};
      }
    }
  }
`;

export default StyledIconTheme;
