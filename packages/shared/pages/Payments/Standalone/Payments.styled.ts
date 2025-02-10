// (c) Copyright Ascensio System SIA 2009-2025
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

import { tablet, mobile } from "../../../utils";

export const StyledPageWrapper = styled.div`
  .payments_file-input {
    max-width: 350px;
    margin: 16px 0;
  }
  .payments_license-description {
    margin-top: 12px;
  }
`;

export const StyledButtonComponent = styled.div`
  margin: 16px 0;
  button {
    @media ${tablet} {
      max-width: 100%;

      height: 40px;
    }
    @media ${mobile} {
      width: 100%;
    }
  }
`;

export const StyledEnterpriseComponent = styled.div`
  margin-bottom: 35px;

  .payments_renew-subscription {
    max-width: 660px;
  }
  .payments_renew-subscription {
    margin-top: 12px;
  }
  .payments_support {
    max-width: 503px;
  }
`;

export const StyledTitleComponent = styled.div<{
  limitedWidth: boolean;
  isLicenseDateExpired: boolean;
}>`
  .payments_subscription {
    max-width: 660px;
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    .title {
      line-height: 16px;
      ${(props) => props.limitedWidth && "max-width: 376px"};
      span:first-child {
        ${(props) => props.isLicenseDateExpired && "margin-top: 5px"};
      }
    }
  }

  .payments_subscription-expired {
    max-width: fit-content;
    border: 1px solid
      ${(props) =>
        props.theme.client.settings.payment[
          props.isLicenseDateExpired ? "warningColor" : "color"
        ]};
    border-radius: 3px;
    color: ${(props) =>
      props.theme.client.settings.payment[
        props.isLicenseDateExpired ? "warningColor" : "color"
      ]};
    padding: 2px 8px;
    height: fit-content;
  }
`;

export const StyledContactContainer = styled.div`
  display: flex;
  width: 100%;
  a {
    margin-inline-start: 4px;
  }
`;

export const StyledBenefitsBody = styled.div`
  margin: 20px 0;
  border-radius: 12px;
  border: ${(props) => props.theme.client.settings.payment.border};
  max-width: 660px;

  padding: 23px;

  background: ${(props) =>
    props.theme.client.settings.payment.backgroundBenefitsColor};

  .benefits-title {
    margin-bottom: 20px;
  }
  .payments-benefits {
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: 10px;
    .benefits-svg {
      display: flex;
      align-items: flex-start;
      padding-top: 4px;
    }
    .benefits-description {
      p:first-child {
        margin-bottom: 3px;
      }
    }
  }
  .payments-benefits ~ .payments-benefits {
    margin-top: 13px;
  }
`;
