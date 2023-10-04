import styled from "styled-components";

//@ts-ignore
import RowContainer from "@docspace/components/row-container";
//@ts-ignore
import RowContent from "@docspace/components/row-content";

export const StyledRowContainer = styled(RowContainer)`
  margin-top: 0px;

  .row-list-item {
    padding-left: 21px;
  }

  .row-loader {
    width: calc(100% - 46px) !important;
    padding-left: 21px;
  }

  img {
    width: 32px;
    max-width: 32px;

    height: 32px;
    max-height: 32px;
  }
`;

export const StyledRowContent = styled(RowContent)`
  display: flex;
  padding-bottom: 10px;

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .mainIcons {
    min-width: 76px;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
`;

export const ToggleButtonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  label {
    margin-top: 1px;
    position: relative;
    gap: 0px;

    margin-right: -8px;
  }
`;

export const FlexWrapper = styled.div`
  display: flex;
`;
