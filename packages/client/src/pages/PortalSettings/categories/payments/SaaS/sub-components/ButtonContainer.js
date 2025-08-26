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
import { inject, observer } from "mobx-react";
import { Button } from "@docspace/shared/components/button";
import styled from "styled-components";
import { toastr } from "@docspace/shared/components/toast";
import RequestButtonContainer from "./RequestButtonContainer";
import UpdatePlanButtonContainer from "./UpdatePlanButtonContainer";

const StyledBody = styled.div`
  button {
    width: 100%;
  }
`;

const ButtonContainer = ({
  isNeedRequest,
  isDisabled,
  isLoading,
  t,
  isNotPaidPeriod,
  isGracePeriod,
  paymentLink,
}) => {
  const goToStripePortal = () => {
    paymentLink
      ? window.open(paymentLink, "_blank")
      : toastr.error(t("ErrorNotification"));
  };

  return (
    <StyledBody>
      {isNotPaidPeriod || isGracePeriod ? (
        <Button
          className="pay-button"
          label={t("Pay")}
          size="medium"
          primary
          isDisabled={isLoading || isDisabled}
          onClick={goToStripePortal}
          isLoading={isLoading}
          testId="pay_button"
        />
      ) : isNeedRequest ? (
        <RequestButtonContainer isDisabled={isDisabled} t={t} />
      ) : (
        <UpdatePlanButtonContainer t={t} isDisabled={isDisabled} />
      )}
    </StyledBody>
  );
};

export default inject(({ currentTariffStatusStore, paymentStore }) => {
  const { isNeedRequest, isLoading, accountLink, paymentLink } = paymentStore;
  const { isNotPaidPeriod, isGracePeriod } = currentTariffStatusStore;

  return {
    isNeedRequest,
    isLoading,
    isNotPaidPeriod,
    isGracePeriod,
    accountLink,
    paymentLink,
  };
})(observer(ButtonContainer));
