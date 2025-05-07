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

const StyledPaymentsLoader = styled.div`
  .payments-loader_title {
    height: 28px;
    margin-bottom: 23px;
  }
  .payments-loader_description {
    max-width: 600px;
    height: 40px;
    margin-top: 16px;
    margin-bottom: 24px;
    @media ${mobile} {
      height: 68px;
    }
  }

  .payments-loader_plan-description {
    margin-top: 16px;
  }
  .payments-loader_main {
    display: grid;
    margin-top: 20px;
    max-width: 660px;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 453px;
    grid-gap: 20px;

    @media ${mobile} {
      grid-template-columns: 1fr;
    }
  }
`;

const StyledEnterpriseComponent = styled.div`
  .payments-loader_4,
  .payments-loader_2,
  .payments-loader_3,
  .payments-loader_5,
  .payments-loader_6,
  .payments-loader_7,
  .payments-loader_8,
  .payments-loader_9,
  .payments-loader_10 {
    display: block;
  }

  .payments-loader_4,
  .payments-loader_9 {
    height: 32px;
    @media ${tablet} {
      height: 40px;
    }
  }

  .payments-loader_1 {
    max-width: 272px;
    margin-bottom: 12px;
  }
  .payments-loader_2 {
    max-width: 660px;
    margin-bottom: 12px;
    height: 32px;

    @media ${mobile} {
      height: 64px;
    }
  }
  .payments-loader_3 {
    max-width: 342px;
    margin-bottom: 16px;

    @media ${mobile} {
      max-width: 100%;
    }
  }
  .payments-loader_4 {
    max-width: 110px;
    margin-bottom: 16px;
  }
  .payments-loader_5 {
    max-width: 497px;
    margin-bottom: 32px;

    height: 32px;

    @media ${mobile} {
      height: 60px;
    }
  }
  .payments-loader_6 {
    max-width: 126px;
    margin-bottom: 12px;
  }
  .payments-loader_7 {
    max-width: 581px;
    margin-bottom: 16px;
    height: 16px;
    @media ${mobile} {
      height: 32px;
    }
  }
  .payments-loader_8 {
    max-width: 350px;
    margin-bottom: 16px;
  }
  .payments-loader_9 {
    max-width: 110px;
    margin-bottom: 20px;

    @media ${mobile} {
      max-width: 100%;
    }
  }
  .payments-loader_10 {
    max-width: 264px;
    margin-bottom: 4px;
  }
  .payments-loader_11 {
    max-width: 304px;
  }
`;

const StyledTrialComponent = styled.div`
  .payments-loader_4,
  .payments-loader_2,
  .payments-loader_3,
  .payments-loader_5,
  .payments-loader_6,
  .payments-loader_7,
  .payments-loader_8,
  .payments-loader_9 {
    display: block;
  }

  .payments-loader_1 {
    max-width: 660px;
    margin-bottom: 20px;
    height: 294px;

    @media ${mobile} {
      height: 380px;
    }
  }
  .payments-loader_2 {
    max-width: 497px;
    margin-bottom: 12px;
  }
  .payments-loader_3 {
    max-width: 206px;
    margin-bottom: 4px;
  }
  .payments-loader_4 {
    max-width: 172px;
    margin-bottom: 4px;
  }
  .payments-loader_5 {
    max-width: 219px;
    margin-bottom: 12px;
  }
  .payments-loader_6 {
    max-width: 338px;
    margin-bottom: 4px;
  }
  .payments-loader_7 {
    max-width: 197px;
    margin-bottom: 16px;
  }
  .payments-loader_8 {
    max-width: 350px;
    margin-bottom: 16px;
  }
  .payments-loader_9 {
    max-width: 255px;
    margin-bottom: 4px;

    @media ${mobile} {
      max-width: 100%;
    }
  }
`;
export {
  StyledEnterpriseComponent,
  StyledTrialComponent,
  StyledPaymentsLoader,
};
