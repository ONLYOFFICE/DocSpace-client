import styled from "styled-components";

import { mobile } from "@docspace/shared/utils";

const StyledSMTPContent = styled.div`
  .rectangle-loader_description {
    max-width: 700px;
    margin-bottom: 20px;
    margin-top: 16px;
  }
  .rectangle-loader_title {
    margin-bottom: 8px;
  }
  .rectangle-loader-2 {
    max-width: 350px;
    margin-bottom: 16px;
  }

  .rectangle-loader_checkbox {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;

    svg:first-child {
      margin-top: 2px;
    }
  }
  .rectangle-loader_buttons {
    margin-top: 20px;
    max-width: 404px;
    display: grid;
    grid-template-columns: 86px 1fr 1fr;
    gap: 8px;

    @media ${mobile} {
      grid-template-columns: 1fr;
    }
  }
`;
const StyledStorageManagementLoader = styled.div`
  max-width: 660px;

  svg {
    display: block;
  }
  .storage-loader_title {
    height: 40px;
    margin-bottom: 24px;

    @media ${mobile} {
      height: 68px;
    }
  }

  svg:last-child {
    max-width: 123px;
    @media ${mobile} {
      max-width: 100%;
    }
  }

  .storage-loader_grid {
    svg:nth-child(1) {
      max-width: 158px;
    }
    svg:nth-child(2) {
      max-width: 130px;
    }
    svg:nth-child(3) {
      max-width: 100px;
    }
    svg:nth-child(4) {
      max-width: 120px;
    }

    display: grid;
    grid-gap: 24px;
    grid-template-columns:
      minmax(50px, 158px) minmax(70px, 130px) minmax(40px, 100px)
      minmax(60px, 120px);

    @media ${mobile} {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 20px);
      grid-gap: 8px;
      margin-bottom: 12px;
    }
  }

  div {
    svg {
      margin-bottom: 16px;
    }
  }
`;

export { StyledSMTPContent, StyledStorageManagementLoader };
