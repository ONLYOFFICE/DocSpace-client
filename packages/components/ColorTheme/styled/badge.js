import styled, { css } from "styled-components";
import { StyledBadge, StyledInner, StyledText } from "../../badge/styled-badge";
import Base from "../../themes/base";

const getDefaultStyles = ({
  $currentColorScheme,
  isVersionBadge,
  backgroundColor,
  color,
  theme,
  isPaidBadge,
  isMutedBadge,
  noHover,
}) =>
  $currentColorScheme &&
  !isVersionBadge &&
  css`
    ${StyledText} {
      color: ${color
        ? color
        : isPaidBadge
        ? theme.badge.color
        : $currentColorScheme.text.accent} !important;
    }

    ${StyledInner} {
      background-color: ${isMutedBadge
        ? theme.badge.disableBackgroundColor
        : backgroundColor
        ? backgroundColor
        : $currentColorScheme.main.accent};

      &:hover {
        ${!noHover &&
        css`
          background-color: ${isMutedBadge
            ? theme.badge.disableBackgroundColor
            : backgroundColor
            ? backgroundColor
            : $currentColorScheme.main.accent};
        `}
      }
    }

    &:hover {
      ${!noHover &&
      css`
        border-color: ${isMutedBadge
          ? theme.badge.disableBackgroundColor
          : backgroundColor
          ? backgroundColor
          : $currentColorScheme.main.accent};
      `}
    }
  `;

StyledBadge.defaultProps = { theme: Base };

export default styled(StyledBadge)(getDefaultStyles);
