import styled from "styled-components";
import { mobile } from "@docspace/shared/utils";
import { globalColors } from "../../themes";

export const EmptyViewWrapper = styled.div`
  margin-inline: auto;

  max-width: 480px;
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 18px;

  padding-top: 61px;

  @media ${mobile} {
    padding-top: 40px;
  }
`;

export const EmptyViewHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .ev-header {
    font-size: 16px;
    color: ${(props) => props.theme.emptyContent.header.color};
    text-align: center;
    margin-bottom: 8px;
    margin-top: 20px;
  }

  .ev-subheading {
    color: ${(props) => props.theme.emptyContent.description.color};
    text-align: center;
  }

  @media ${mobile} {
    > svg {
      height: 105px;
      width: 150px;
    }
  }
`;

export const EmptyViewBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  width: 100%;

  &:has(> .ev-link) {
    margin-top: 2px;
  }

  .empty-view--margin {
    margin-top: 18px;
  }

  .ev-link {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: nowrap;
    align-self: center;

    padding: 6px 10px;

    max-width: fit-content;
    text-decoration: none;

    color: ${(props) => props.theme.emptyView.link.color};
    background: ${(props) => props.theme.emptyView.link.background};

    border-radius: 6px;

    svg {
      color: inherit;
      g {
        fill: currentColor;
      }
      flex-shrink: 0;
    }

    span {
      font-weight: 600;
      font-size: 13px;
      line-height: 15px;
      /* text-decoration: underline dotted; */
      /* text-underline-offset: 2px; */
    }

    @media (hover: hover) {
      :hover {
        background: ${(props) => props.theme.emptyView.link.hoverBackground};
        color: ${(props) => `${props.theme.emptyView.link.hoverColor}`};
      }
    }

    :active {
      background: ${(props) => props.theme.emptyView.link.PressedBackground};
      color: ${(props) => props.theme.emptyView.link.PressedColor};
    }
  }
`;

export const EmptyViewItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  cursor: pointer;
  border-radius: 6px;
  padding: 12px 16px;

  .ev-item__icon {
    width: 36px;
    height: 36px;

    flex: 0 0 36px;
  }

  :nth-child(1) .ev-item__icon {
    rect {
      color: ${globalColors.lightSecondMain};
    }
    path {
      color: ${globalColors.lightBlueMain};
    }
  }
  :nth-child(2) .ev-item__icon {
    rect {
      color: ${globalColors.mainGreen};
    }
    path {
      color: ${globalColors.mainGreen};
    }
  }
  :nth-child(3) .ev-item__icon {
    rect {
      color: ${globalColors.mainOrange};
    }
    path {
      color: ${globalColors.mainOrange};
    }
  }
  :nth-child(4) .ev-item__icon {
    rect {
      color: ${globalColors.purple};
    }
    path {
      color: ${globalColors.purple};
    }
  }

  .ev-item-header {
    font-size: 13px;
    color: ${(props) => props.theme.emptyContent.header.color};
  }

  .ev-item-subheading {
    color: ${(props) => props.theme.emptyContent.description.color};
  }

  .ev-item__arrow-icon {
    flex: 0 0 12px;
  }

  @media (hover: hover) {
    &:hover {
      background-color: ${(props) => props.theme.emptyView.items.hoverColor};
    }
  }

  :active {
    background-color: ${(props) => props.theme.emptyView.items.pressColor};
  }
`;

export const EmptyViewItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
`;
