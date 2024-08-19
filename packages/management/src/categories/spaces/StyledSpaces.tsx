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

import styled, { css } from "styled-components";
import { isMobileOnly } from "react-device-detect";

const SpaceContainer = styled.div`
  max-width: 700px;

  .spaces {
    &-input-block {
      margin-bottom: 18px;
    }
    &-text-wrapper {
      display: flex;
    }
    &-input {
      margin-top: 4px;
      width: 350px;
      height: 32px;
    }
    &-header {
      margin-bottom: 20px;
    }
  }

  .row-content_tablet-side-info {
    font-size: 12px;
  }

  @media (max-width: 600px) {
    .row-content_tablet-side-info {
      display: none;
    }

    .spaces-button,
    .spaces-input {
      width: 100%;
    }
  }
`;

const ConfigurationWrapper = styled.div`
  max-width: 700px;

  .spaces {
    &-configuration-header {
      margin-bottom: 20px;
    }
    &-domain-text {
      padding-inline-end: 2px;
    }
    &-configuration-title {
      padding-bottom: 8px;
    }
    &-input-subheader {
      color: ${({ theme }) => theme.management.textColor};
    }
  }

  .error-text {
    color: ${({ theme }) => theme.management.errorColor};
  }
`;

const StyledMultipleSpaces = styled.div`
  .domain-settings-wrapper {
    padding-top: 22px;
  }

  .spaces {
    &-input-block {
      margin-top: 16px;
    }
    &-input-subheader {
      padding-bottom: 3px;
    }
  }
`;

const StyledLoader = styled.div`
  max-width: 700px;
  display: flex;
  flex-direction: column;

  .button {
    margin: 20px 0;
    max-width: 100px;
    ${isMobileOnly &&
    css`
      max-width: 100%;
    `}
  }

  .portals {
    margin-bottom: 24px;
  }

  .domain-header {
    max-width: 130px;
    margin-bottom: 16px;
  }

  .configuration-header {
    max-width: 225px;
    margin-top: 20px;
    margin-bottom: 8px;
  }

  .input {
    max-width: 350px;
  }

  .configuration-input {
    max-width: 350px;
    margin-top: 16px;
  }
`;

export {
  SpaceContainer,
  ConfigurationWrapper,
  StyledMultipleSpaces,
  StyledLoader,
};
