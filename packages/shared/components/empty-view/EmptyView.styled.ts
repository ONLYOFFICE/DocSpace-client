import styled from "styled-components";

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
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    color: ${(props) => props.theme.emptyContent.header.color};
    text-align: center;
    margin-bottom: 8px;
    margin-top: 20px;
  }

  .ev-subheading {
    color: ${(props) => props.theme.emptyContent.description.color};
    text-align: center;
    text-wrap: balance;
  }
`;

export const EmptyViewBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const EmptyViewItemWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  gap: 20px;

  padding: 16px;

  .ev-item__icon {
    width: 36px;
    height: 36px;

    flex: 1 0 36px;
  }

  .ev-item-header {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    color: ${(props) => props.theme.emptyContent.header.color};
  }

  .ev-item-subheading {
    color: ${(props) => props.theme.emptyContent.description.color};
    text-wrap: balance;
  }

  .ev-item__arrow-icon {
    flex: 1 0 12px;
  }
`;

export const EmptyViewItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
