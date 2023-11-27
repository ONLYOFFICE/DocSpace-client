import styled, { css } from "styled-components";
import {
  Container,
  // @ts-expect-error TS(2305): Module '"../../calendar/styled-components"' has no... Remove this comment to see the full error message
  CurrentDateItem,
  HeaderActionIcon,
} from "../../calendar/styled-components";

const getDefaultStyles = ({
  $currentColorScheme
}: any) =>
  $currentColorScheme &&
  css`
    ${HeaderActionIcon} {
      border-color: ${$currentColorScheme.main.accent};
    }
  `;

export default styled(Container)(getDefaultStyles);
