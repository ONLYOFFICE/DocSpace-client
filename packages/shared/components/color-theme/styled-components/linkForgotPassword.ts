import styled, { css } from "styled-components";
import { TColorScheme } from "../../../themes";

import LoginContainer from "../sub-components/LoginContainer";

const getDefaultStyles = ({
  $currentColorScheme,
}: {
  $currentColorScheme?: TColorScheme;
}) =>
  $currentColorScheme &&
  css`
    .login-link {
      color: ${$currentColorScheme?.main?.accent};
    }
  `;

export default styled(LoginContainer)(getDefaultStyles);
