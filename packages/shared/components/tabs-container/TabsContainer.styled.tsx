import styled, { css } from "styled-components";
import { NoUserSelect } from "../../utils";
import { Base, TColorScheme } from "../../themes";

import { Scrollbar } from "../scrollbar";

const StyledScrollbar = styled(Scrollbar)`
  width: ${(props) => props.theme.tabsContainer.scrollbar.width} !important;
  height: ${(props) => props.theme.tabsContainer.scrollbar.height} !important;
`;

StyledScrollbar.defaultProps = { theme: Base };

const NavItem = styled.div`
  position: relative;
  white-space: nowrap;
  display: flex;
`;
NavItem.defaultProps = { theme: Base };

const Label = styled.div<{ isDisabled?: boolean; selected?: boolean }>`
  height: ${(props) => props.theme.tabsContainer.label.height};
  border-radius: ${(props) => props.theme.tabsContainer.label.borderRadius};
  min-width: ${(props) => props.theme.tabsContainer.label.minWidth};
  width: ${(props) => props.theme.tabsContainer.label.width};

  .title_style {
    text-align: center;
    margin: ${(props) => props.theme.tabsContainer.label.title.margin};
    overflow: ${(props) =>
      props.theme.interfaceDirection === "rtl" ? "visible" : "hidden"};
    ${NoUserSelect};
  }

  ${(props) =>
    props.isDisabled &&
    css`
      pointer-events: none;
    `}

  ${(props) =>
    props.selected
      ? css`
          cursor: default;
          background-color: ${props.theme.tabsContainer.label.backgroundColor};
          .title_style {
            color: ${props.theme.tabsContainer.label.title.color};
          }
        `
      : css`
          &:hover {
            cursor: pointer;
            background-color: ${props.theme.tabsContainer.label
              .hoverBackgroundColor};
            .title_style {
              color: ${props.theme.tabsContainer.label.title.hoverColor};
            }
          }
        `}

${(props) =>
    props.isDisabled &&
    props.selected &&
    css`
      background-color: ${props.theme.tabsContainer.label
        .disableBackgroundColor};
      .title_style {
        color: ${props.theme.tabsContainer.label.title.disableColor};
      }
    `}
`;

Label.defaultProps = { theme: Base };

const StyledLabelTheme = styled(Label)<{ $currentColorScheme?: TColorScheme }>`
  background-color: ${(props) =>
    props.selected && props.$currentColorScheme?.main?.accent} !important;

  .title_style {
    color: ${(props) =>
      props.selected && props.$currentColorScheme?.text?.accent};
  }
`;

export { NavItem, Label, StyledScrollbar, StyledLabelTheme };
