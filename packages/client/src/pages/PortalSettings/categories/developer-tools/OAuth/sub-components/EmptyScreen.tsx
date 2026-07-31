/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation, Trans } from "react-i18next";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { Text } from "@docspace/ui-kit/components/text";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import EmptyScreenOauthLightSvg from "PUBLIC_DIR/images/emptyview/empty.oauth2.light.svg";
import EmptyScreenOauthDarkSvg from "PUBLIC_DIR/images/emptyview/empty.oauth2.dark.svg";

import RegisterNewButton from "./RegisterNewButton";
import { getBrandName } from "@docspace/shared/constants/brands";

const OAuthEmptyScreen = ({
  apiOAuthLink,
  logoText,
}: {
  apiOAuthLink: string;
  logoText: string;
}) => {
  const { t } = useTranslation(["OAuth", "Common"]);
  const { isBase } = useTheme();

  const icon = isBase ? (
    <EmptyScreenOauthLightSvg />
  ) : (
    <EmptyScreenOauthDarkSvg />
  );

  const descText = (
    <Trans
      ns="OAuth"
      t={t}
      i18nKey="OAuthAppDescription"
      values={{
        productName: getBrandName("ProductName"),
        organizationName: logoText,
      }}
    />
  );

  const description = (
    <div>
      <Text
        lineHeight="20px"
        fontSize="13px"
        fontWeight={400}
        color={isBase ? globalColors.grayText : globalColors.darkGrayDark}
        textAlign="center"
        style={{ marginBottom: "8px" }}
      >
        {descText}
      </Text>
      <p>
        {apiOAuthLink ? (
          <Link
            target={LinkTarget.blank}
            type={LinkType.page}
            fontWeight={600}
            isHovered
            href={apiOAuthLink}
            tag="a"
            style={{ marginBottom: "20px" }}
            color="accent"
            dataTestId="oauth_guide_link"
          >
            {t("OAuth:OAuth")} {t("Common:Guide")}
          </Link>
        ) : null}
      </p>

      <RegisterNewButton />
    </div>
  );

  return (
    <EmptyView
      icon={icon}
      title={t("NoOAuthAppHeader")}
      description={description}
      options={[]}
    />
  );
};

export default OAuthEmptyScreen;
