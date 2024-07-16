/* eslint-disable @next/next/no-img-element */
import React from "react";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

const StyledOAuthContainer = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 12px;

  margin-bottom: 32px;

  img {
    width: 32px;
    height: 32px;
  }

  .row {
    width: 100%;
    text-align: center;
  }

  .login-link {
    cursor: normal;
  }
`;

interface IOAuthClientInfo {
  name: string;
  logo: string;
  websiteUrl: string;

  isConsentScreen?: boolean;
}

const OAuthClientInfo = ({
  name,
  logo,
  websiteUrl,

  isConsentScreen,
}: IOAuthClientInfo) => {
  const { t } = useTranslation(["Consent", "Common"]);

  return (
    <StyledOAuthContainer>
      {!isConsentScreen && (
        <Text
          className="row"
          fontWeight={600}
          fontSize="16px"
          lineHeight="22px"
        >
          {t("Common:LoginButton")}
        </Text>
      )}
      <img src={logo} alt={"client-logo"} />
      <Text
        className="row"
        fontWeight={isConsentScreen ? 400 : 600}
        fontSize="16px"
        lineHeight="22px"
      >
        {isConsentScreen ? (
          <Trans t={t} i18nKey={"ConsentSubHeader"} ns="Consent">
            <Link
              className={"login-link"}
              type={LinkType.page}
              isHovered={false}
              href={websiteUrl}
              target={LinkTarget.blank}
              noHover
              fontWeight={600}
              fontSize="16px"
            >
              {name}
            </Link>{" "}
            would like the ability to access the following data in{" "}
            <strong>your DocSpace account</strong>:
          </Trans>
        ) : (
          <>
            {t("Consent:ToContinue")}{" "}
            <Link
              className={"login-link"}
              type={LinkType.page}
              isHovered={false}
              href={websiteUrl}
              target={LinkTarget.blank}
              noHover
              fontWeight={600}
              fontSize="16px"
            >
              {name}
            </Link>
          </>
        )}
      </Text>
    </StyledOAuthContainer>
  );
};

export default OAuthClientInfo;
