import styled, { css } from "styled-components";
import { TColorScheme, TTheme } from "../../../themes";
import { Box } from "../../box";

const getDefaultStyles = ({
  $currentColorScheme,
  $isVersion,
  theme,
}: {
  $currentColorScheme?: TColorScheme;
  $isVersion?: boolean;
  theme: TTheme;
}) =>
  $currentColorScheme &&
  css`
    .version-mark-icon {
      path {
        fill: ${!$isVersion
          ? theme.filesVersionHistory.badge.defaultFill
          : theme.filesVersionHistory.badge.fill};

        stroke: ${!$isVersion
          ? theme.filesVersionHistory.badge.stroke
          : theme.filesVersionHistory.badge.fill};
      }
    }

    .version_badge-text {
      color: ${$isVersion && $currentColorScheme.text?.accent};
    }
  `;

export default styled(Box)(getDefaultStyles);
