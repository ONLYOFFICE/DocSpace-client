import styled, { css } from "styled-components";
import { Base, TColorScheme } from "../../../themes";
import StyledInfoPanelToggleWrapper from "../sub-components/StyledWrapper";

const getDefaultStyles = ({
  $currentColorScheme,
  isInfoPanelVisible,
}: {
  $currentColorScheme?: TColorScheme;
  isInfoPanelVisible?: boolean;
}) =>
  $currentColorScheme &&
  isInfoPanelVisible &&
  css`
    .info-panel-toggle-bg {
      path {
        fill: ${$currentColorScheme.main?.accent};
      }
      &:hover {
        path {
          fill: ${$currentColorScheme.main?.accent};
        }
      }
    }
  `;

StyledInfoPanelToggleWrapper.defaultProps = { theme: Base };

export default styled(StyledInfoPanelToggleWrapper)(getDefaultStyles);
