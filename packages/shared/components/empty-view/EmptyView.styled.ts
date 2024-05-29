import styled from "styled-components";
import { mobile } from "@docspace/shared/utils";

export const EmptyViewWrapper = styled.div`
  margin-inline: auto;

  max-width: 480px;
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 18px;

  padding-top: 31px;
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
    max-width: 300px;
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
      color: #5299e0;
    }
    path {
      color: #4781d1;
    }
  }
  :nth-child(2) .ev-item__icon {
    rect {
      color: #2db482;
    }
    path {
      color: #2db482;
    }
  }
  :nth-child(3) .ev-item__icon {
    rect {
      color: #f97a0b;
    }
    path {
      color: #f97a0b;
    }
  }
  :nth-child(4) .ev-item__icon {
    rect {
      color: #6d4ec2;
    }
    path {
      color: #6d4ec2;
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
