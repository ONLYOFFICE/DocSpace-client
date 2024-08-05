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

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { PaymentsStandaloneLoader } from "@docspace/shared/skeletons/payments";

import BenefitsContainer from "SRC_DIR/components/StandaloneComponents/BenefitsContainer";
import StyledComponent from "./StyledComponent";
import OfficialDocumentation from "./sub-components/OfficialDocumentation";
import ContactContainer from "SRC_DIR/components/StandaloneComponents/ContactContainer";

const Bonus = ({ standaloneInit, isInitPaymentPage }) => {
  const { t, ready } = useTranslation("PaymentsEnterprise");

  useEffect(() => {
    standaloneInit();
  }, []);

  if (!isInitPaymentPage || !ready) return <PaymentsStandaloneLoader />;

  return (
    <StyledComponent>
      <BenefitsContainer />
      <Text fontWeight={600}>
        {t("UpgradeToProBannerInstructionHeader", {
          organizationName: t("Common:OrganizationName"),
        })}
      </Text>
      <Text>{t("UpgradeToProBannerInstructionDescr")}</Text>

      <OfficialDocumentation />

      <ContactContainer />
    </StyledComponent>
  );
};

export const Component = inject(({ paymentStore }) => {
  const { standaloneInit, isInitPaymentPage } = paymentStore;
  return {
    standaloneInit,
    isInitPaymentPage,
  };
})(observer(Bonus));
