import styled from "styled-components";
import { Base } from "@docspace/shared/themes";

export const StyledAccountsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledSubtitleLoader = styled.div`
  width: 100%;
  padding: 24px 0 24px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledProperty = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 108px 1fr;
  grid-column-gap: 24px;
  grid-row-gap: 8px;

  .property-content {
    max-width: 100%;
    margin: auto 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const StyledDetailsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledDetailsSubtitleLoader = styled.div`
  width: 100%;
  padding: 24px 0 24px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledDetailsProperty = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 101px 1fr;
  grid-column-gap: 24px;
  grid-row-gap: 8px;

  .property-content {
    max-width: 100%;
    margin: auto 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const StyledGalleryLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  .thumbnail {
  }
`;

export const StyledGallerySubtitleLoader = styled.div`
  width: 100%;
  padding: 24px 0 24px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledGalleryProperty = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 101px 1fr;
  grid-column-gap: 24px;
  grid-row-gap: 8px;

  .property-content {
    max-width: 100%;
    margin: auto 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const StyledHistoryLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledHistorySubtitleLoader = styled.div`
  width: 100%;
  padding: 8px 0 12px 0;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledHistoryBlockLoader = styled.div`
  width: 100%;
  height: 70px;

  display: flex;
  align-items: center;
  border-bottom: ${(props) => `solid 1px ${props.theme.infoPanel.borderColor}`};

  .content {
    width: 100%;
    height: 38px;

    display: flex;
    flex-direction: row;
    gap: 8px;

    .avatar {
      min-height: 32px;
      min-width: 32px;
    }
    .message {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .date {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-right: auto;`
          : `margin-left: auto;`}
    }
  }
`;

StyledHistoryBlockLoader.defaultProps = { theme: Base };

export const StyledMembersLoader = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledMemberSubtitleLoader = styled.div`
  width: 100%;
  padding: 8px 0 12px 0;
  .pending_users {
    padding-top: 20px;
  }

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledMemberLoader = styled.div`
  width: 100%;
  height: 48px;

  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 8px;

  .avatar {
    min-height: 32px;
    min-width: 32px;
  }

  .role-selector {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: auto;`
        : `margin-left: auto;`}
  }
`;

export const StyledNoItemLoader = styled.div`
  width: 100%;
  margin: 80px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
`;

export const StyledSeveralItemsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
