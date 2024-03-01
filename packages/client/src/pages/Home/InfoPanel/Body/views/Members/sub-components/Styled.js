import styled, { css } from "styled-components";

import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";

import { commonIconsStyles } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

const StyledCrossIcon = styled(CrossReactSvg)`
  ${commonIconsStyles}

  g {
    path {
      fill: #657077;
    }
  }

  path {
    fill: #999976;
  }
`;

const LinksBlock = styled.div`
  display: flex;
  height: 100%;
  padding-top: 3px;
  align-items: center;
  justify-content: space-between;

  p {
    color: ${({ theme }) => theme.infoPanel.members.subtitleColor};
  }

  .link-to-viewing-icon {
    svg {
      weight: 16px;
      height: 16px;
    }
  }
`;

LinksBlock.defaultProps = { theme: Base };

const StyledLinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
  background: ${(props) => props.theme.backgroundColor};

  .external-row-link {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .external-row-icons {
    margin-left: auto;
    display: flex;
    gap: 16px;
  }

  .avatar-wrapper {
    ${({ theme }) => css`
      svg {
        path {
          fill: ${theme.infoPanel.links.primaryColor} !important;
        }
      }
    `}
  }

  .avatar_role-wrapper {
    ${({ isExpired, theme }) => css`
      svg {
        path {
          fill: ${isExpired
            ? theme.infoPanel.links.iconErrorColor
            : theme.infoPanel.links.iconColor};
        }
      }
    `}
  }
`;

StyledLinkRow.defaultProps = { theme: Base };

export { StyledCrossIcon, LinksBlock, StyledLinkRow };
