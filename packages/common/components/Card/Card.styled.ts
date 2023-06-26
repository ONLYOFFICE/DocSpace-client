import styled, { css } from "styled-components";
import { CardContainerProps } from "./Card.props";

export const CardDivider = styled.hr`
  height: 1px;
  border: none;
  border-radius: 1px;

  background: ${(props) => props.theme.card.dividerBackground};

  margin: -1px 15px 12px;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;

  height: 24px;
  padding: 13px 15px 12px;

  .card__context-menu {
    margin-left: auto;
  }

  .card__checkbox {
    margin-left: 4px;
    margin-right: 2px;
  }
`;

export const CardHeaderLoader = styled(CardHeader)`
  gap: 10px;
`;

export const CardAvatar = styled.img`
  width: 24px;
  height: 24px;

  border-radius: 100%;

  margin-right: 10px;
`;

export const CardContainer = styled.div<CardContainerProps>`
  width: 264px;

  border: 1px solid;
  border-color: ${({ isForMe, theme: { card } }) =>
    isForMe ? card.forMeBorderColor : card.borderColor};
  border-radius: 6px;

  box-sizing: border-box;

  overflow: hidden;

  background: ${(props) => props.theme.card.background};

  .card__checkbox {
    display: none;
  }

  ${(props) =>
    props.isSelected &&
    css`
      ${CardHeader}, ${CardDivider} {
        background: ${(props) => props.theme.card.selectedColor};
      }
      ${CardAvatar} {
        display: none;
      }
      .card__checkbox {
        display: flex;
      }
    `}

  @media (hover: hover) {
    :hover ${CardHeader}, :hover ${CardDivider} {
      background: ${(props) => props.theme.card.hoverColor};
    }
  }
`;

export const CardAvatarWrapper = styled.div`
  position: relative;

  @media (hover: hover) {
    :hover ${CardAvatar} {
      display: none;
    }
    :hover .card__checkbox {
      display: flex;
    }
  }
`;

export const CardUserName = styled.p`
  margin: 0;

  font-weight: 600;
  font-size: 13px;
  line-height: 20px;

  color: ${(props) => props.theme.card.userNameColor};
`;

export const CardContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0px 16px 12px 16px;
  gap: 10px;

  .card__oform-icon {
    width: 31px;
    height: 30px;
    flex: 0 0 auto;
  }
`;

export const CardContentTitle = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;

  color: ${(props) => props.theme.card.titleColor};
  margin: 0px;
`;
