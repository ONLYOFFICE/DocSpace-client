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

import React from "react";
import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";

const StyledBody = styled.div`
  border-radius: 12px;
  border: ${(props) => props.theme.client.settings.payment.border};
  max-width: 320px;

  padding: 24px;
  box-sizing: border-box;
  background: ${(props) =>
    props.theme.client.settings.payment.backgroundBenefitsColor};

  p {
    margin-bottom: 24px;
  }
  .payment-benefits_text {
    margin-bottom: 20px;
  }
  .payment-benefits {
    margin-bottom: 14px;
    align-items: center;
    display: grid;
    grid-template-columns: 24px 1fr;
    grid-gap: 10px;
    p {
      margin-bottom: 0;
    }
    .icons-container {
      width: 24px;
      height: 24px;

      ${(props) =>
        !props.theme.isBase &&
        css`
          svg {
            path {
              fill: ${({ theme }) =>
                theme.client.settings.payment.benefitsContainer
                  .iconsColor} !important;
            }
            mask + path {
              fill: none !important;
              stroke: ${({ theme }) =>
                theme.client.settings.payment.benefitsContainer
                  .iconsColor} !important;
            }
          }
        `}
    }
  }
`;

const BenefitsContainer = ({ t, features }) => {
  return (
    <StyledBody className="benefits-container">
      <Text fontSize="16px" fontWeight="600" className="payment-benefits_text">
        {t("Benefits")}
      </Text>
      {Array.from(features.values()).map((item) => {
        if (!item.title || !item.image) return;
        return (
          <div className="payment-benefits" key={item.title || item.image}>
            <div
              dangerouslySetInnerHTML={{ __html: item.image }}
              className="icons-container"
            />
            <Text>{item.title}</Text>
          </div>
        );
      })}
    </StyledBody>
  );
};

export default inject(({ settingsStore, paymentQuotasStore }) => {
  const { theme } = settingsStore;
  const { portalPaymentQuotasFeatures } = paymentQuotasStore;

  return {
    theme,
    features: portalPaymentQuotasFeatures,
  };
})(observer(BenefitsContainer));
