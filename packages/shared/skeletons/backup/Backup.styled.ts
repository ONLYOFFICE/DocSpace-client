// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled from "styled-components";
import { mobile, tablet } from "../../utils";

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

export const StyledRestoreBackup = styled.div`
  width: 100%;
  .restore-backup-loader_title {
    max-width: 400px;
    height: 12px;
    @media ${mobile} {
      height: 30px;
    }
  }
  .restore-backup_checkbox {
    margin-top: 24px;
    margin-bottom: 24px;
    display: grid;
    grid-template-rows: repeat(3, max-content);
    grid-template-columns: 16px 1fr;
    grid-column-gap: 8px;
    grid-row-gap: 16px;
    .restore-backup_checkbox-first {
      max-width: 61px;
      height: 20px;
    }
    .restore-backup_checkbox-second {
      max-width: 418px;
      height: 20px;
      @media ${mobile} {
        height: 40px;
      }
    }
    .restore-backup_checkbox-third {
      max-width: 122px;
      height: 20px;
    }
  }
  .restore-backup_input {
    max-width: 350px;
    margin-bottom: 16px;
  }
  .restore-backup_backup-list {
    max-width: 130px;
    display: block;
  }
  .restore-backup_notification {
    margin-bottom: 24px;
    margin-top: 11px;
    display: grid;
    // grid-template-rows: repeat(3, max-content);
    grid-template-columns: 16px 1fr;
    grid-column-gap: 8px;
    grid-row-gap: 16px;
    .restore-backup_notification-title {
      max-width: 315px;
    }
  }
  .restore-backup_warning-title {
    max-width: 72px;
  }
  .restore-backup_warning-description {
    display: block;
    height: 32px;
    max-width: 700px;
    @media ${mobile} {
      height: 48px;
    }
  }
  .restore-backup_warning {
    margin-top: 17px;
    margin-bottom: 24px;
    display: block;
    height: 20px;
    max-width: 700px;
    @media ${mobile} {
      height: 31px;
    }
  }
  .restore-backup_button {
    display: block;
    max-width: 100px;
    height: 32px;
    @media ${mobile} {
      height: 40px;
      max-width: 100%;
    }
  }
`;
