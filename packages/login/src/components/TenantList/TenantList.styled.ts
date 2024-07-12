import { mobile } from "@docspace/shared/utils";
import styled from "styled-components";

const StyledTenantList = styled.div`
  margin-top: -16px;

  display: flex;
  flex-direction: column;
  align-items: center;

  .more-accounts {
    color: ${(props) => props.theme.text.disableColor};
    text-align: center;

    margin-bottom: 32px;
  }

  .items-list {
    width: 100%;
    max-width: 480px;

    border: 1px solid ${(props) => props.theme.oauth.infoDialog.separatorColor};
    border-radius: 6px;

    div:last-child {
      border: none !important;
    }

    @media ${mobile} {
      maxwidth: 100%;
    }
  }

  .item {
    height: 59px;

    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 16px;

    border-bottom: 1px solid
      ${(props) => props.theme.oauth.infoDialog.separatorColor};

    :hover {
      cursor: pointer;

      background-color: ${(props) =>
        props.theme.dropDownItem.hoverBackgroundColor};
    }

    .info {
      display: flex;
      align-items: center;

      max-width: calc(100% - 64px);
    }

    .favicon {
      width: 32px;
      height: 32px;

      margin-right: 12px;
    }

    .icon-button {
      cursor: pointer;
    }
  }
  .back-button {
    margin: 32px auto 0;
  }
`;

export default StyledTenantList;
