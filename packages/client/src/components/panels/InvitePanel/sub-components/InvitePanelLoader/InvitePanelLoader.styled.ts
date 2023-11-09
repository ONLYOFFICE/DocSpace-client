import styled from "styled-components";
import { mobile } from "@docspace/components/utils/device";

export const InvitePanelLoaderWrapper = styled.div``;

export const ExternalLinksLoaderWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  grid-row-gap: 8px;

  padding: 16px;

  border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};
  .external-links-loader__description {
    width: 80%;

    grid-column: 1/-1;
  }

  @media ${mobile} {
    .external-links-loader__description {
      width: 90%;
    }
  }
`;

export const InviteInputLoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 16px;
`;

export const InviteInputLoaderHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const InviteInputLoaderFooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  margin-top: 8px;
`;
