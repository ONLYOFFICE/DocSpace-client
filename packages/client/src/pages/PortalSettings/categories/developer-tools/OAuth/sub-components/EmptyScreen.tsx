import { useTranslation, Trans } from "react-i18next";
import { useTheme } from "styled-components";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { Text } from "@docspace/shared/components/text";
import { globalColors } from "@docspace/shared/themes";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import EmptyScreenOauthLightSvg from "PUBLIC_DIR/images/emptyview/empty.oauth2.light.svg";
import EmptyScreenOauthDarkSvg from "PUBLIC_DIR/images/emptyview/empty.oauth2.dark.svg";

import RegisterNewButton from "./RegisterNewButton";

const OAuthEmptyScreen = ({ apiOAuthLink }: { apiOAuthLink: string }) => {
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
        organizationName: t("Common:OrganizationName"),
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
        <Link
          className="guide-link"
          target={LinkTarget.blank}
          type={LinkType.page}
          fontWeight={600}
          isHovered
          href={apiOAuthLink}
        >
          {t("OAuth:OAuth")} {t("Common:Guide")}
        </Link>
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
