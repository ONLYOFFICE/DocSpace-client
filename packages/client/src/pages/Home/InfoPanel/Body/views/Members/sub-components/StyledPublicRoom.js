import styled, { css } from "styled-components";
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";
import commonIconsStyles from "@docspace/components/utils/common-icons-style";
import { tablet, desktop } from "@docspace/components/utils/device";

const StyledPublicRoomBar = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.infoBlock.background};
  color: #333;
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 10px;

  .text-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .header-body {
    display: flex;
    height: fit-content;
    width: 100%;
    gap: 8px;
    font-weight: 600;
  }

  .text-container_header {
    color: ${(props) => props.theme.infoBlock.headerColor};
  }

  .text-container_body {
    color: ${(props) => props.theme.infoBlock.descriptionColor};
  }

  .close-icon {
    margin: -5px -17px 0 0;

    path {
      fill: ${({ theme }) => theme.iconButton.color};
    }

    svg {
      weight: 8px;
      height: 8px;
    }
  }
`;

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
    color: ${({ theme }) => theme.text.disableColor};
  }

  .link-to-viewing-icon {
    svg {
      weight: 16px;
      height: 16px;
    }
  }
`;

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
    ${({ isPrimary, theme }) =>
      isPrimary &&
      css`
        svg {
          path {
            fill: ${theme.infoPanel.links.primaryColor} !important;
          }
        }
      `}
  }

  .avatar_role-wrapper {
    ${({ isExpired, theme }) =>
      css`
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

export { StyledPublicRoomBar, StyledCrossIcon, LinksBlock, StyledLinkRow };
