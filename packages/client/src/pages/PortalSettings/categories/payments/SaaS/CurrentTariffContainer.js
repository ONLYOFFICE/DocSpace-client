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
import { Text } from "@docspace/shared/components/text";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { PortalFeaturesLimitations } from "@docspace/shared/enums";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { mobile } from "@docspace/shared/utils";

const StyledCurrentTariffContainer = styled.div`
  display: flex;
  min-height: 40px;
  background: ${(props) => props.theme.client.settings.payment.backgroundColor};
  margin-bottom: 24px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding: 12px 16px;
  box-sizing: border-box;
  padding-bottom: 0;
  border-radius: 6px;

  @media ${mobile} {
    flex-direction: column;
    margin-bottom: 27px;
  }

  div {
    padding-bottom: 8px;
    margin-inline-end: 24px;
  }

  p {
    margin-bottom: 0;
    color: ${(props) => props.theme.client.settings.payment.tariffText};
    .current-tariff_count {
      color: ${(props) => props.theme.client.settings.payment.tariffText};
      margin-inline-start: 4px;
    }
  }
`;

const CurrentTariffContainer = ({ style, quotaCharacteristics }) => {
  const { t } = useTranslation(["Payments", "Common"]);

  return (
    <StyledCurrentTariffContainer style={style}>
      {quotaCharacteristics.map((item) => {
        const maxValue = item.value;
        const usedValue = item.used.value;

        if (maxValue === PortalFeaturesLimitations.Unavailable) return;

        const isExistsMaxValue =
          maxValue !== PortalFeaturesLimitations.Limitless;

        const resultingMaxValue =
          item.type === "size" && isExistsMaxValue
            ? getConvertedSize(t, maxValue)
            : isExistsMaxValue
              ? maxValue
              : null;

        const resultingUsedValue =
          item.type === "size" ? getConvertedSize(t, usedValue) : usedValue;

        return (
          <div key={item.used.title}>
            <Text isBold noSelect fontSize="14px">
              {item.used.title}
              <Text
                className="current-tariff_count"
                as="span"
                isBold
                fontSize="14px"
              >
                {resultingUsedValue}
                {resultingMaxValue ? `/${resultingMaxValue}` : ""}
              </Text>
            </Text>
          </div>
        );
      })}
    </StyledCurrentTariffContainer>
  );
};

export default inject(({ currentQuotaStore }) => {
  const { quotaCharacteristics } = currentQuotaStore;

  return {
    quotaCharacteristics,
  };
})(observer(CurrentTariffContainer));
