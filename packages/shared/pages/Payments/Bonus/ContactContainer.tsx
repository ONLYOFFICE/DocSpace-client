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

import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget } from "@docspace/shared/components/link";

import { StyledContactComponent } from "./Bonus.styled";

export const ContactContainer = ({ helpUrl, salesEmail, isCommunity }) => {
  const { t } = useTranslation("Common");
  const officialWebsiteUrl = "https://www.onlyoffice.com/for-enterprises.aspx";
  const demonstrationUrl = "https://www.onlyoffice.com/demo-order.aspx";

  return (
    <>
      {isCommunity && (
        <StyledContactComponent>
          <div className="payments_contact">
            <Text className="text" fontWeight={600}>
              <Trans
                i18nKey="UpgradeToProBannerInformationAboutShort"
                ns="Common"
                t={t}
                values={{ license: t("Common:EnterpriseLicense") }}
                components={{
                  1: (
                    <Link
                      target={LinkTarget.blank}
                      tag="a"
                      fontWeight="600"
                      href={officialWebsiteUrl}
                      className="link"
                    />
                  ),
                }}
              />
            </Text>
          </div>
          <div className="payments_contact">
            <Text className="text" fontWeight={600}>
              <Trans
                i18nKey="UpgradeToProBannerInformationDemo"
                ns="Common"
                t={t}
              >
                Request demonstration
                <Link
                  target={LinkTarget.blank}
                  tag="a"
                  fontWeight="600"
                  href={demonstrationUrl}
                  className="link"
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
          <Text className="text" fontWeight={600}>
            <Trans
              i18nKey="UpgradeToProBannerInformationPurchase"
              ns="Common"
              t={t}
            >
              Ask purchase questions at
              <Link
                fontWeight="600"
                target={LinkTarget.blank}
                tag="a"
                href={`mailto:${salesEmail}`}
                className="link"
              >
                {{ email: salesEmail }}
              </Link>
            </Trans>
          </Text>
        </div>
        <div className="payments_contact">
          <Text className="text" fontWeight={600}>
            <Trans
              i18nKey="UpgradeToProBannerInformationSupport"
              ns="Common"
              t={t}
            >
              Get tech assistance
              <Link
                target={LinkTarget.blank}
                tag="a"
                fontWeight="600"
                href={helpUrl}
                className="link"
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
