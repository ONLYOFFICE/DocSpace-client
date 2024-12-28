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

import React from "react";

import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

import { StyledContactComponent } from "./StyledComponent";

const ContactContainer = (props) => {
  const { t } = useTranslation("PaymentsEnterprise");

  const { helpUrl, salesEmail, theme, isCommunity } = props;

  const officialWebsiteUrl = "https://www.onlyoffice.com/for-enterprises.aspx";
  const demonstrationUrl = "https://www.onlyoffice.com/demo-order.aspx";

  return (
    <>
      {isCommunity && (
        <StyledContactComponent>
          <div className="payments_contact">
            <Text
              fontWeight={600}
              color={theme.client.settings.payment.contactContainer.textColor}
            >
              <Trans
                i18nKey="UpgradeToProBannerInformationAboutShort"
                ns="PaymentsEnterprise"
                t={t}
                values={{ license: t("Common:EnterpriseLicense") }}
                components={{
                  1: (
                    <Link
                      target="_blank"
                      tag="a"
                      fontWeight="600"
                      href={officialWebsiteUrl}
                      color={
                        theme.client.settings.payment.contactContainer.linkColor
                      }
                    />
                  ),
                }}
              />
            </Text>
          </div>
          <div className="payments_contact">
            <Text
              fontWeight={600}
              color={theme.client.settings.payment.contactContainer.textColor}
            >
              <Trans
                i18nKey="UpgradeToProBannerInformationDemo"
                ns="PaymentsEnterprise"
                t={t}
              >
                Request demonstration
                <Link
                  target="_blank"
                  tag="a"
                  fontWeight="600"
                  href={demonstrationUrl}
                  color={
                    theme.client.settings.payment.contactContainer.linkColor
                  }
                >
                  here
                </Link>
              </Trans>
            </Text>
          </div>
        </StyledContactComponent>
      )}
      <StyledContactComponent>
        <div className="payments_contact">
          <Text
            fontWeight={600}
            color={theme.client.settings.payment.contactContainer.textColor}
          >
            <Trans
              i18nKey="UpgradeToProBannerInformationPurchase"
              ns="PaymentsEnterprise"
              t={t}
            >
              Ask purchase questions at
              <Link
                fontWeight="600"
                target="_blank"
                tag="a"
                href={`mailto:${salesEmail}`}
                color={theme.client.settings.payment.contactContainer.linkColor}
              >
                {{ email: salesEmail }}
              </Link>
            </Trans>
          </Text>
        </div>
        <div className="payments_contact">
          <Text
            fontWeight={600}
            color={theme.client.settings.payment.contactContainer.textColor}
          >
            <Trans
              i18nKey="UpgradeToProBannerInformationSupport"
              ns="PaymentsEnterprise"
              t={t}
            >
              Get tech assistance
              <Link
                target="_blank"
                tag="a"
                fontWeight="600"
                href={helpUrl}
                color={theme.client.settings.payment.contactContainer.linkColor}
              >
                {{ helpUrl }}
              </Link>
            </Trans>
          </Text>
        </div>
      </StyledContactComponent>
    </>
  );
};

export default inject(
  ({ currentTariffStatusStore, settingsStore, paymentStore }) => {
    const { isCommunity } = currentTariffStatusStore;
    const { helpUrl, salesEmail } = paymentStore;
    const { theme } = settingsStore;
    return { helpUrl, salesEmail, theme, isCommunity };
  },
)(observer(ContactContainer));
