import styled, { css } from "styled-components";

import {
  StyledCatalogItemContainer,
  StyledCatalogItemImg,
  StyledCatalogItemText,
} from "SRC_DIR/catalog-item/styled-catalog-item";

import Base from "SRC_DIR/themes/base";

const getDefaultStyles = ({ $currentColorScheme, isActive, theme }) =>
  $currentColorScheme &&
  css`
    ${StyledCatalogItemText} {
      color: ${isActive && theme.isBase && $currentColorScheme.main.accent};

      &:hover {
        color: ${isActive && theme.isBase && $currentColorScheme.main.accent};
      }
    }

    ${StyledCatalogItemImg} {
      svg {
        path {
          fill: ${isActive &&
          theme.isBase &&
          $currentColorScheme.main.accent} !important;
        }
        circle {
          fill: ${isActive &&
          theme.isBase &&
          $currentColorScheme.main.accent} !important;
        }
      }

      &:hover {
        svg {
          path {
            fill: ${isActive &&
            theme.isBase &&
            $currentColorScheme.main.accent} !important;
          }
        }
      }
    }
  `;

StyledCatalogItemContainer.defaultProps = { theme: Base };

export default styled(StyledCatalogItemContainer)(getDefaultStyles);
