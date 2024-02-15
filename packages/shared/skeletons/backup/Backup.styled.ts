import styled from "styled-components";
import { mobile, tablet } from "@docspace/shared/utils";

export const StyledDataBackup = styled.div`
  width: 100%;
  .data-backup-loader_main {
    display: grid;
    grid-template-rows: 1fr;
    grid-gap: 8px;
    width: 100%;
    .data-backup-loader_title {
      max-width: 118px;
    }
    .data-backup-loader_title-description {
      display: block;
      max-width: 700px;
      width: 100%;
      height: 16px;
      @media ${mobile} {
        height: 32px;
      }
    }
  }
  .data-backup-loader {
    margin-top: 24px;
    display: grid;
    grid-template-rows: repeat(5, max-content);
    grid-template-columns: 16px 1fr;
    width: 100%;
    grid-column-gap: 8px;
    .data-backup-loader_menu,
    .data-backup-loader_menu-higher,
    .data-backup-loader_menu-last {
      height: 40px;
      max-width: 700px;
      width: 100%;
      margin-bottom: 16px;
    }
    .data-backup-loader_menu-higher {
      height: 72px;
      @media ${mobile} {
        height: 120px;
      }
    }
    .data-backup-loader_menu-last {
      height: 56px;
      @media ${mobile} {
        height: 88px;
      }
    }
    .data-backup-loader_menu-description {
      margin-bottom: 16px;
      height: 32px;
      max-width: 285px;
      width: 100%;
      @media ${tablet} {
        height: 40px;
      }
    }
  }
`;

export const StyledAutoBackup = styled.div`
  width: 100%;
  .auto-backup-loader_main {
    display: grid;
    grid-template-rows: max-content max-content max-content;
    grid-gap: 8px;
    width: 100%;
    .auto-backup-loader_title {
      max-width: 118px;
    }
    .auto-backup-loader_title-description {
      display: block;
      max-width: 700px;
      width: 100%;
      height: 16px;
      @media ${mobile} {
        height: 32px;
      }
    }
    .auto-backup-loader_toggle {
      max-width: 718px;
      height: 64px;
    }
  }
  .auto-backup-loader_menu {
    margin-top: 24px;
    display: grid;
    grid-template-rows: repeat(5, max-content);
    grid-template-columns: 16px 1fr;
    width: 100%;
    grid-column-gap: 8px;
    .auto-backup-loader_option {
      height: 40px;
      max-width: 700px;
      @media ${tablet} {
        height: 54px;
      }
    }
    .auto-backup-loader_option-description {
      margin-top: 8px;
      height: 32px;
      max-width: 350px;
    }
    .auto-backup-loader_option-description-second {
      margin-top: 16px;
      height: 20px;
      max-width: 119px;
    }
    .auto-backup-loader_option-description-third,
    .auto-backup-loader_option-description-fourth {
      margin-top: 4px;
      height: 32px;
      max-width: 350px;
    }
  }
`;
