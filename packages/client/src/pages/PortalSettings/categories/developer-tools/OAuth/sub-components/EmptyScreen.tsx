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

import { useTranslation, Trans } from "react-i18next";
import { useTheme } from "styled-components";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { Text } from "@docspace/shared/components/text";
import { globalColors } from "@docspace/shared/themes";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import EmptyScreenOauthLightSvg from "PUBLIC_DIR/images/emptyview/empty.oauth2.light.svg";
import EmptyScreenOauthDarkSvg from "PUBLIC_DIR/images/emptyview/empty.oauth2.dark.svg";

import RegisterNewButton from "./RegisterNewButton";

const OAuthEmptyScreen = ({
  apiOAuthLink,
  logoText,
}: {
  apiOAuthLink: string;
  logoText: string;
}) => {
  const { t } = useTranslation(["OAuth", "Common"]);
  const theme = useTheme();

  const icon = theme.isBase ? (
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
        productName: t("Common:ProductName"),
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
        color={theme.isBase ? globalColors.grayText : globalColors.darkGrayDark}
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
