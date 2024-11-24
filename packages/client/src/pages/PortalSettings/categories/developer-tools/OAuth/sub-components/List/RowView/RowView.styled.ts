import styled from "styled-components";

import { RowContainer } from "@docspace/shared/components/row-container";
import { RowContent } from "@docspace/shared/components/row-content";
import { tablet } from "@docspace/shared/utils/device";

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

  .oauth2-row-selected {
    background: ${(props) =>
      props.theme.filesSection.rowView.checkedBackground};

    cursor: pointer;
    border-bottom: none;

    margin-left: -24px;
    margin-right: -24px;
    padding-left: 24px;
    padding-right: 24px;

    @media ${tablet} {
      margin-left: -16px;
      margin-right: -16px;
      padding-left: 16px;
      padding-right: 16px;
    }
  }

  .oauth2-row {
    margin-top: -3px;
    padding-top: 3px;

    :hover {
      background: ${(props) =>
        props.theme.filesSection.rowView.checkedBackground};

      cursor: pointer;
      border-bottom: none;

      margin-left: -24px;
      margin-right: -24px;
      padding-left: 24px;
      padding-right: 24px;

      @media ${tablet} {
        margin-left: -16px;
        margin-right: -16px;
        padding-left: 16px;
        padding-right: 16px;
      }
    }
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
